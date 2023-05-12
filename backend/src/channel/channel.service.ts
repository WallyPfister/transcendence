import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ChatRoomListDto, userDto } from './chatRoomDto';
import {
	SubscribeMessage,
	WebSocketGateway,
	MessageBody,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


const prisma = new PrismaClient();

@Injectable()
@WebSocketGateway(3001, {
	// transports: ['websocket'],
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class ChannelService {
	@WebSocketServer()
	server: Server;
	chatRoomList: Record<string, ChatRoomListDto>;
	userList: Record<string, userDto>;

	constructor() {
		this.chatRoomList = {
			lobby: {
				roomId: 'lobby',
				roomName: 'lobby',
				chiefId: null,
				adminList: [],
				banList: [],
				muteList: {},
				password: undefined,
			},
		};
		this.userList = {};
	}

	handleConnection(socket: Socket) {
		console.log(`Client connected with ID ${socket.id}`);
		console.log(`data ==> ${socket.data.nickname}`);
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		const user = Object.values(this.userList).find(
			(out) => out.socketId === socket.id,
		)
		if (!user)
			return ;
		const index = this.channelList[user.roomId].adminList.indexOf(user.nickname);
		if (user.isChief == true){
			const sockets = this.server.sockets.adapter.rooms.get(user.roomId);
			if (sockets) {
				const socketId = Array.from(sockets.values())[0];
				const nextChief = this.server.sockets.sockets.get(socketId);
				this.chatRoomList[user.roomId].adminList.push(nextChief.data.nickname);
				this.chatRoomList[user.roomId].chiefId = nextChief.data.nickname;
				this.userList[nextChief.data.nickname].isChief = true;
				this.userList[nextChief.data.nickname].isAdmin = true;
			}
			else
				delete this.channelList[user.roomId];
		}
		if (user.isAdmin == true){
			if (this.channelList[user.roomId]){
				if (index > -1)
					this.channelList[user.roomId].adminList.slice(index, 1);
			}
		}
	}

	@SubscribeMessage('setUser')
	async setUser(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = data.nickname;
		if (this.userList[socket.id]) {
			// 추후에 프론트랑 에러형식 맞추기
			socket.emit("errorMessage", { message: "already exist user" })
		}
		else {
			this.userList[nickname] = {
				roomId: "lobby",
				nickname: nickname,
				socketId: socket.id,
				isAdmin: false,
				isChief: false
			}
		}
		socket.data.roomId = 'lobby';
		socket.data.roomName = 'lobby';
		socket.data.nickname = nickname;
		socket.join(socket.data.roomId);
		socket.emit('joinRoom', { roomName: 'lobby' });
		this.server.to(socket.data.roomId).emit('addUser', nickname);
		this.channelUserList(socket);
	}

	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() data: { roomId: string; password: string },
		@ConnectedSocket() socket: Socket,
	) {
		console.log(data.password);
		console.log(data.roomId);
		const roomId = data.roomId;
		if (data.password === '') data.password = undefined;
		if (data.roomId == undefined || data.roomId === '') {
			this.server.emit('errorMessage', {
				nickname: '<system>',
				message: 'cannot make empty roomname.',
			});
			return;
		}

		const existingRoom = Object.values(this.chatRoomList).find(
			(room) => room.roomId === roomId,
		);

		if (existingRoom) {
			this.server.emit('errorMessage', {
				nickname: '<system>',
				message: `${roomId} 방이 이미 존재합니다.`,
			});
			return;
		}
		if (this.leaveRoom(socket) === false) {
			this.isChief(this.chatRoomList[socket.data.roomId], socket);
		}
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		this.chatRoomList[roomId] = {
			roomId: roomId,
			roomName: roomId,
			chiefId: socket.data.nickname,
			adminList: [socket.data.nickname],
			banList: [],
			muteList: {},
			password: data.password,
		};
		this.userList[socket.data.nickname].roomId = roomId;
		this.userList[socket.data.nickname].isChief = true;
		this.userList[socket.data.nickname].isAdmin = true;
		socket.join(roomId);
		socket.emit('joinRoom', { roomName: roomId });
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(socket);
		socket.emit('isChief');
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(
		@MessageBody() data: { roomId: string },
		@ConnectedSocket() socket: Socket,
	) {
		const roomId = data.roomId;
		const Room = Object.values(this.chatRoomList).find(
			(room) => room.roomId === roomId,
		);
		if (Room == undefined) {
			this.server.emit('errorMessage', {
				nickname: '<system>',
				message: '존재하지 않는 방입니다.',
			});
			return;
		}
		if (Room.banList.includes(socket.data.nickname) == true) {
			socket.emit('newMessage', {
				nickname: '<system>',
				message: '입장이 제한된 방입니다.',
			});
			return;
		}
		if (Room.roomId == socket.data.roomId) {
			//   console.log('here');
			socket.emit('newMessage', {
				nickname: '<system>',
				message: '이미 입장한 방입니다.',
			});
			return;
		}
		if (Room.password !== undefined) {
			socket.emit('passwordRequired', { roomName: roomId });
			return;
		}
		if (this.leaveRoom(socket) === false) {
			this.isChief(this.chatRoomList[socket.data.roomId], socket);
		}

		socket.data.roomId = roomId;
		socket.data.roomName = roomId;

		socket.join(roomId);
		this.userList[socket.data.nickname].roomId = roomId;
		socket.emit('joinRoom', { roomName: roomId });
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(socket);
	}

	@SubscribeMessage('sendPassword')
	async joinPrivateRoom(
		@MessageBody() data: { roomId: string; password: string },
		@ConnectedSocket() socket: Socket,
	) {
		const roomId = data.roomId;
		const Room = Object.values(this.chatRoomList).find(
			(room) => room.roomId === roomId,
		);
		// console.log(`privatejoin ${data}`);
		if (Room == undefined) {
			socket.emit('errorMessage', {
				nickname: '<system>',
				message: '존재하지 않는 방입니다.',
			});
			return;
		}
		if (Room.password !== data.password) {
			socket.emit('errorMessage', {
				nickname: '<system>',
				message: 'Wrong Password',
			});
			return;
		}
		if (Room.banList.includes(socket.data.nickname) == true) {
			socket.emit('newMessage', {
				nickname: '<system>',
				message: '입장이 제한된 방입니다.',
			});
			return;
		}
		if (Room.roomId == socket.data.roomId) {
			//   console.log('here');
			socket.emit('newMessage', {
				nickname: '<system>',
				message: '이미 입장한 방입니다.',
			});
			return;
		}
		if (this.leaveRoom(socket) === false) {
			this.isChief(this.chatRoomList[socket.data.roomId], socket);
		}

		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		this.userList[socket.data.nickname].roomId = roomId;
		socket.join(roomId);
		socket.emit('joinRoom', { roomName: roomId });
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(socket);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(
		@MessageBody() data: { message: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = socket.data.nickname;
		const message = data.message;
		const chatRoom = this.chatRoomList[socket.data.roomId];
		// console.log('=====send=====');
		// console.log(this.chatRoomList);
		// console.log(socket.data.roomId);
		if (chatRoom && Object.keys(chatRoom.muteList).includes(nickname)) {
			const now = new Date();
			const diff =
				(now.getTime() - chatRoom.muteList[nickname].getTime()) / 1000 / 60;
			//   console.log(diff);
			if (diff < 4) {
				socket.emit('newMessage', {
					message: `your chat is blocked in ${socket.data.roomId}`,
				});
				return;
			}
			delete this.chatRoomList[socket.data.roomId].muteList[nickname];
		}
		this.server
			.to(socket.data.roomId)
			.emit('newMessage', { nickname, message });
		console.log(data);
	}

	@SubscribeMessage('chatRoomList')
	async channelList() {
		this.server.emit('channelList', Object.keys(this.chatRoomList));
	}

	//   @SubscribeMessage('exitChannel')
	//   async exitChannel(@ConnectedSocket() socket: Socket) {
	//     const chatRoom = this.chatRoomList[socket.data.roomId];

	//     if (this.leaveRoom(socket) === false) {
	//       this.isChief(this.chatRoomList[socket.data.roomId], socket);
	//     }

	//     socket.data.roomId = 'lobby';
	//     socket.data.roomName = 'lobby';
	//     socket.join('lobby');
	//     socket.emit('newMessage', `채팅방을 나와 lobby로 나오셨습니다.`);
	//   }

	async isChief(chatRoom: ChatRoomListDto, socket: Socket) {
		if (chatRoom.chiefId == socket.data.nickname) {
			socket.emit('isNotChief');
			const sockets = this.server.sockets.adapter.rooms.get(socket.data.roomId);
			if (sockets) {
				const socketId = Array.from(sockets.values())[0];
				const user = this.server.sockets.sockets.get(socketId);
				this.chatRoomList[socket.data.roomId].adminList.push(user.data.nickname);
				this.chatRoomList[socket.data.roomId].chiefId = user.data.nickname;
				this.userList[user.data.nickname].isChief = true;
				this.userList[user.data.nickname].isAdmin = true;
				delete this.chatRoomList[socket.data.roomId].adminList[socket.data.nickname];
				this.userList[socket.data.nickname].isChief = false;
				this.userList[socket.data.nickname].isAdmin = false;
			}
		}
	}

	@SubscribeMessage('setAdmin')
	async setAdmin(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const chatRoom = this.chatRoomList[socket.data.roomId];
		if (chatRoom.chiefId != socket.data.nickname) {
			socket.emit('system', `You are not the owner`);
			throw new Error(`Room ${socket.data.roomId} onwer is not you`);
		}
		const target = await this.findSocketByName(data.nickname);
		if (target) {
			target.emit('isAdmin');
			this.chatRoomList[socket.data.roomId].adminList.push(target.data.nickname);
			this.userList[target.data.nickname].isAdmin = true;
			socket.emit('system', `${data.nickname} joins admin`);
		} else {
			throw new Error(`cannot find ${data.nickname}`);
		}
	}

	@SubscribeMessage('unSetAdmin')
	async unSetAdmin(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const chatRoom = this.chatRoomList[socket.data.roomId];
		if (chatRoom.chiefId != socket.data.nickname) {
			socket.emit('system', `You are not the owner`);
			throw new Error(`Room ${socket.data.roomId} onwer is not you`);
		}
		const target = await this.findSocketByName(data.nickname);
		if (target) {
			if (
				chatRoom.adminList.find((value) => value === data.nickname) == undefined
			) {
				socket.emit('newMessage', {
					nickname: '<system>',
					message: `You are not admin`,
				});
			} else {
				this.userList[socket.data.nickname].isAdmin = false;
				const index = this.chatRoomList[socket.data.roomId].adminList.indexOf(data.nickname);
				if (index !== -1) {
					this.chatRoomList[socket.data.roomId].adminList.splice(index, 1);
				}
				target.emit('isNotAdmin');
				socket.emit('system', `${data.nickname} leaves admin`);
			}
		} else {
			throw new Error(`cannot find ${data.nickname}`);
		}
	}

	@SubscribeMessage('mute')
	async mute(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const chatRoom = this.chatRoomList[socket.data.roomId];
		if (!chatRoom) {
			socket.emit('newMessage', `Room ${socket.data.roomId} not found`);
			throw new Error(`Room ${socket.data.roomId} not found`);
		}
		if (chatRoom.chiefId != socket.data.nickname) {
			socket.emit('newMessage', `Room ${socket.data.roomId} admin is not you`);
			throw new Error(`Room ${socket.data.roomId} admin is not you`);
		}
		this.chatRoomList[socket.data.roomId].muteList[data.nickname] = new Date();
		socket.emit('newMessage', `${data.nickname} is mute`);
	}
	// banList에 사용자 추가
	@SubscribeMessage('ban')
	addBanlist(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = data.nickname;
		if (this.isBanned(nickname, socket) == true) {
			socket.emit('newMessage', {
				nickname: '<system>',
				message: `이미 banlist에 ${nickname}이(가) 있습니다.`,
			});
			return;
		}
		this.chatRoomList[socket.data.roomId].banList.push(nickname);
		this.kick(nickname, socket.data.roomId);
		socket.emit('newMessage', {
			nickname: '<system>',
			message: `banlist에서 ${nickname}을 추가했습니다.`,
		});
	}
	// banList에서 사용자 제거
	@SubscribeMessage('banCancel')
	removeBanlist(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const { nickname } = data;
		if (this.isBanned(nickname, socket) == false) {
			socket.emit('newMessage', {
				nickname: '<system>',
				message: `nobody there`,
			});
			return;
		}
		const index = this.chatRoomList[socket.data.roomId].banList.indexOf(nickname);
		if (index !== -1) {
			this.chatRoomList[socket.data.roomId].banList.splice(index, 1);
		}
		socket.emit('newMessage', {
			nickname: '<system>',
			message: `banlist에서 ${nickname}을 제외했습니다.`,
		});
	}

	// 다이렉트 메세지 만들기
	@SubscribeMessage('privateMessage')
	async privateMessage(
		@MessageBody() data: { nickname: string; message: string },
		@ConnectedSocket() socket: Socket,
	) {
		const user = await this.findSocketByName(data.nickname);
		if (!user) {
			user.emit('message', {
				nickname: socket.data.nickname,
				message: data.message,
			});
		}
	}

	kick(nickname: string, roomId: string) {
		console.log('===== kick =====');
		console.log(nickname);
		console.log(roomId);
		const sockets = this.server.sockets.adapter.rooms.get(roomId);

		for (const socketId of sockets) {
			const target = this.server.sockets.sockets.get(socketId);
			//   console.log(target.data.nickname);
			//   console.log(target.data.roomId);
			if (target.data.nickname == nickname) {
				this.leaveRoom(target);

				target.data.roomId = 'lobby';
				target.data.roomName = 'lobby';
				this.userList[target.data.nickname].roomId = "lobby";
				this.server
					.to(roomId)
					.emit('newMessage', { message: `${nickname} 님이 추방되었습니다.` });
				target.join('lobby');
				target.emit('isNotAdmin');
				target.emit('kick');
				return;
			}
		}
	}

	// 사용자가 banList에 있는지 확인 및 관리자인지 확인
	isBanned(nickname: string, socket: Socket): boolean {
		const roomId = socket.data.roomId;
		const chatRoom = this.chatRoomList[roomId];
		if (!chatRoom) {
			socket.emit('newMessage', {
				nickname: '<system>',
				message: `Room ${roomId} not found`,
			});
			throw new Error(`Room ${roomId} not found`);
		}
		if (chatRoom.adminList.find((value) => value === nickname) != undefined) {
			socket.emit('newMessage', `Room ${roomId} admin is not you`);
			throw new Error(`Room ${roomId} admin is not you`);
		}
		if (chatRoom.adminList.find((value) => value === socket.data.nickname) == undefined) {
			socket.emit('newMessage', `Room ${roomId} ban target is admin`);
			throw new Error(`Room ${roomId} ban target is admin`);
		}

		return chatRoom.banList.includes(nickname);
	}

	leaveRoom(socket: Socket): boolean {
		const oldRoomId = socket.data.roomId;
		socket.leave(oldRoomId);
		// true => 내가 마지막 사람, false => 나 말고도 사람이 더 남음
		if (
			this.server.sockets.adapter.rooms.get(oldRoomId) !== undefined
		) {
			const users = [];
			const sockets = this.server.sockets.adapter.rooms.get(oldRoomId);

			for (const socketId of sockets) {
				const user = this.server.sockets.sockets.get(socketId);
				users.push(user.data.nickname);
			}
			this.server.to(oldRoomId).emit('userList', users);
			return false;
		}
		if (socket.data.roomId !== 'lobby') {
			delete this.chatRoomList[oldRoomId];
		}
		return true;
	}
	// 채널 유저 리스트
	async channelUserList(socket: Socket) {
		const users = [];
		const sockets = this.server.sockets.adapter.rooms.get(socket.data.roomId);

		for (const socketId of sockets) {
			const user = this.server.sockets.sockets.get(socketId);
			//   console.log(user.data.nickname);
			users.push(user.data.nickname);
		}
		console.log(users);
		this.server.to(socket.data.roomId).emit('userList', users);
	}

	async findSocketByName(name: string): Promise<Socket> {
		const sockets = this.server.sockets.sockets;
		for (const [_, socket] of sockets) {
			if (socket.data.nickname === name) return socket;
		}
		return null;
	}

	async sendErrorMsg(name: string, msg: string): Promise<void> {
		const socket = await this.findSocketByName(name);
		socket.emit('errorMessage', msg);
	  }
}
