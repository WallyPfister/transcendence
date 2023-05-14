import { Injectable } from '@nestjs/common';
import { ChatRoomListDto, userDto } from './chatRoom.dto';
import {
	SubscribeMessage,
	WebSocketGateway,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
@WebSocketGateway(3001, {
	// transports: ['websocket'],
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class ChannelGateway {
	@WebSocketServer()
	server: Server;
	chatRoomList: Record<string, ChatRoomListDto>;
	userList: Record<string, userDto>;

	constructor(private authService: AuthService) {
		this.chatRoomList = {
			lobby: {
				roomId: 'lobby',
				roomName: 'lobby',
				chiefName: null,
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
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		const user = Object.values(this.userList).find(
			(out) => out.socketId === socket.id,
		)
		if (user === undefined)
			return;
			const room = this.channelList[user.roomId];
		if (!room){
			delete this.userList[user.nickname];
			return;
		}
		const index = room.adminList.indexOf(user.nickname);
		if (user.isChief == true) {
			const sockets = this.server.sockets.adapter.rooms.get(user.roomId);
			if (sockets) {
				const socketId = Array.from(sockets.values())[0];
				const nextChief = this.server.sockets.sockets.get(socketId);
				this.chatRoomList[user.roomId].adminList.push(nextChief.data.nickname);
				this.chatRoomList[user.roomId].chiefName = nextChief.data.nickname;
				this.userList[nextChief.data.nickname].isChief = true;
				this.userList[nextChief.data.nickname].isAdmin = true;
			}
			else
				delete this.channelList[user.roomId];
		}
		if (user.isAdmin === true) {
			if (this.channelList[user.roomId]) {
				if (index > -1)
					this.channelList[user.roomId].adminList.slice(index, 1);
			}
		}
		delete this.userList[user.nickname];
		this.channelUserList(user.roomId);
		this.authService.logout(user.nickname);
	}

	@SubscribeMessage('setUser')
	async setUser(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = data.nickname;
		if (this.userList[nickname] && this.userList[nickname].socketId != socket.id) {
			socket.emit("duplicateUser");
			return ;
		}
		
		this.userList[nickname] = {
				roomId: "lobby",
				nickname: nickname,
				socketId: socket.id,
				isAdmin: false,
				isChief: false
		}
		socket.data.roomId = 'lobby';
		socket.data.roomName = 'lobby';
		socket.data.nickname = nickname;
		socket.join(socket.data.roomId);
		socket.emit('joinRoom', { roomName: 'lobby' });
		this.server.to(socket.data.roomId).emit('addUser', nickname);
		this.channelUserList('lobby');
	}

	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() data: { roomId: string; password: string },
		@ConnectedSocket() socket: Socket,
	) {
		const roomId = data.roomId;
		if (data.password === '') data.password = undefined;
		if (data.roomId == undefined || data.roomId === '') {
			this.server.emit('errorMessage', {
				message: 'You cannot create a room with empty name.',
			});
			return;
		}
		const existingRoom = Object.values(this.chatRoomList).find(
			(room) => room.roomId === roomId,
		);
		if (existingRoom !== undefined) {
			this.server.emit('errorMessage', {
				message: `Room ${roomId} already exists.`,
			});
			return;
		}
		else if (this.leaveRoom(socket) === false) {
			this.changeChief(this.chatRoomList[socket.data.roomId], socket);
		}
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		this.chatRoomList[roomId] = {
			roomId: roomId,
			roomName: roomId,
			chiefName: socket.data.nickname,
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
		this.channelUserList(roomId);
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
		if (Room === undefined) {
			socket.emit('errorMessage', {
				message: 'The room does not exists.',
			});
			return;
		}
		else if (Room.banList.includes(socket.data.nickname) === true) {
			socket.emit('systemMessage', 'You are on the ban list of the room.');
			return;
		}
		else if (Room.roomId === socket.data.roomId) {
			socket.emit('systemMessage', 'You have already entered the room.');
			return;
		}
		else if (Room.password !== undefined) {
			socket.emit('passwordRequired', { roomName: roomId });
			return;
		}
		else if (this.leaveRoom(socket) === false) {
			this.changeChief(this.chatRoomList[socket.data.roomId], socket);
		}

		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		socket.join(roomId);
		this.userList[socket.data.nickname].roomId = roomId;
		socket.emit('joinRoom', { roomName: roomId });
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(roomId);
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
		if (Room === undefined) {
			socket.emit('errorMessage', {
				message: 'The room does not exist.',
			});
			return;
		}
		else if (Room.password !== data.password) {
			socket.emit('errorMessage', {
				message: 'You used a wrong password.',
			});
			return;
		}
		else if (Room.banList.includes(socket.data.nickname) === true) {
			socket.emit('systemMessage', 'You are banned from the room.');
			return;
		}
		if (Room.roomId === socket.data.roomId) {
			socket.emit('systemMessage', 'You have already entered the room.');
			return;
		}
		if (this.leaveRoom(socket) === false)
			this.changeChief(this.chatRoomList[socket.data.roomId], socket);
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		this.userList[socket.data.nickname].roomId = roomId;
		socket.join(roomId);
		socket.emit('joinRoom', { roomName: roomId });
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(roomId);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(
		@MessageBody() data: { message: string },
		@ConnectedSocket() socket: Socket,
	) {
		const nickname = socket.data.nickname;
		const message = data.message;
		const chatRoom = this.chatRoomList[socket.data.roomId];
		if (chatRoom && Object.keys(chatRoom.muteList).includes(nickname)) {
			const now = new Date();
			const diff =
				(now.getTime() - chatRoom.muteList[nickname].getTime()) / 1000 / 60;
			if (diff < 4) {
				socket.emit('errorMessage', `You are muted in the room ${socket.data.roomId}`);
				return;
			}
			delete this.chatRoomList[socket.data.roomId].muteList[nickname];
		}
		this.server
			.to(socket.data.roomId)
			.emit('newMessage', { nickname: nickname, message: message });
	}

	@SubscribeMessage('chatRoomList')
	async channelList() {
		this.server.emit('channelList', Object.keys(this.chatRoomList));
	}

	  @SubscribeMessage('gameIn')
	  async exitChannel(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
	    if (this.leaveRoom(socket) === false) 
	      this.changeChief(this.chatRoomList[socket.data.roomId], socket);

		this.userList[socket.data.nickname].isAdmin = false;
		this.userList[socket.data.nickname].isChief = false;
		this.userList[socket.data.nickname].roomId = roomId;
	    socket.data.roomId = roomId;
	    socket.data.roomName = roomId;
	    socket.join(roomId);
	  }

	async changeChief(chatRoom: ChatRoomListDto, socket: Socket) {
		if (chatRoom.chiefName === socket.data.nickname) {
			socket.emit('isNotChief');
			const sockets = this.server.sockets.adapter.rooms.get(socket.data.roomId);
			if (sockets) {
				const socketId = Array.from(sockets.values())[0];
				const user = this.server.sockets.sockets.get(socketId);
				this.chatRoomList[socket.data.roomId].adminList.push(user.data.nickname);
				this.chatRoomList[socket.data.roomId].chiefName = user.data.nickname;
				this.userList[user.data.nickname].isChief = true;
				this.userList[user.data.nickname].isAdmin = true;
				delete this.chatRoomList[socket.data.roomId].adminList[socket.data.nickname];
			}
			this.userList[socket.data.nickname].isChief = false;
			this.userList[socket.data.nickname].isAdmin = false;
		}
	}

	@SubscribeMessage('setAdmin')
	async setAdmin(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		try {
			const chatRoom = this.chatRoomList[socket.data.roomId];
			if (chatRoom.chiefName !== socket.data.nickname) {
				socket.emit('system', `You are not the owner.`);
				throw new Error(`You are not the owner of the room ${socket.data.roomId}.`);
			}
			const target = await this.findSocketByName(data.nickname);
			if (target) {
				target.emit('isAdmin');
				this.chatRoomList[socket.data.roomId].adminList.push(target.data.nickname);
				this.userList[target.data.nickname].isAdmin = true;
				socket.emit('system', `${data.nickname} is now on the administrator list.`);
			} else {
				throw new Error(`Cannot find ${data.nickname}.`);
			}
		} catch (err) {
			socket.emit('errorMessage', err.message);
		}
	}

	@SubscribeMessage('unSetAdmin')
	async unSetAdmin(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		try {
			const chatRoom = this.chatRoomList[socket.data.roomId];
			if (chatRoom.chiefName !== socket.data.nickname) {
				socket.emit('system', `You are not the owner.`);
				throw new Error(`You are not the owner of the room ${socket.data.roomId}.`);
			}
			const target = await this.findSocketByName(data.nickname);
			if (target) {
				if (
					chatRoom.adminList.find((value) => value === data.nickname) === undefined
				) {
					socket.emit('errorMessage', `The person is not on the adminstrator list already.`);
				} else {
					this.userList[socket.data.nickname].isAdmin = false;
					const index = this.chatRoomList[socket.data.roomId].adminList.indexOf(data.nickname);
					if (index !== -1)
						this.chatRoomList[socket.data.roomId].adminList.splice(index, 1);
					target.emit('isNotAdmin');
					socket.emit('system', `${data.nickname} is not an administrator anymore.`);
				}
			} else
				throw new Error(`cannot find ${data.nickname}`);
		} catch (err) {
			socket.emit('errorMessage', err.message);
		}
	}

	@SubscribeMessage('mute')
	async mute(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		const chatRoom = this.chatRoomList[socket.data.roomId];
		if (!chatRoom)
			socket.emit('errorMessage', `Room ${socket.data.roomId} is not found.`);
		else if (chatRoom.adminList.find((value) => value === socket.data.nickname) === undefined)
			socket.emit('errorMessage', `You are not the administrator of room ${socket.data.roomId}.`);
		else if (chatRoom.chiefName === data.nickname)
			socket.emit('errorMessage', `You cannot mute the chief of the room ${socket.data.roomId}.`);
		else {
			this.chatRoomList[socket.data.roomId].muteList[data.nickname] = new Date();
			socket.emit('systemMessage', `${data.nickname} is muted.`);
		}
	}

	// banList에 사용자 추가
	@SubscribeMessage('ban')
	addBanlist(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		try {
			const nickname = data.nickname;
			if (this.isBanned(nickname, socket) === true) {
				socket.emit('systemMessage', `${nickname} is already on the banned list.`);
				return;
			}
			this.chatRoomList[socket.data.roomId].banList.push(nickname);
			this.kick(nickname, socket.data.roomId);
			socket.emit('systemMessage', `${nickname} is added to the banned list.`);
		} catch (err) {
			socket.emit('errorMessage', err.message);
		}
	}

	// banList에서 사용자 제거
	@SubscribeMessage('banCancel')
	removeBanlist(
		@MessageBody() data: { nickname: string },
		@ConnectedSocket() socket: Socket,
	) {
		try {
			const { nickname } = data;
			if (this.isBanned(nickname, socket) === false) {
				socket.emit('systemMessage', `${nickname} is not on the banned list.`);
				return;
			}
			const index = this.chatRoomList[socket.data.roomId].banList.indexOf(nickname);
			if (index !== -1)
				this.chatRoomList[socket.data.roomId].banList.splice(index, 1);
			socket.emit('systemMessage', `You have removed ${nickname} from the banned list.`);
		} catch (err) {
			socket.emit('errorMessage', err.message);
		}
	}

	// 다이렉트 메세지 만들기
	@SubscribeMessage('privateMessage')
	async privateMessage(
		@MessageBody() data: { nickname: string; message: string },
		@ConnectedSocket() socket: Socket,
	) {
		const user = await this.findSocketByName(data.nickname);
		if (user) {
			socket.emit('privateMessage', {
				nickname: data.nickname,
				message: data.message,
			});
			user.emit('privateMessage', {
				nickname: socket.data.nickname,
				message: data.message,
			});
		} else {
			socket.emit('errorMessage', 'Cannot find the user.');
		}
	}

	kick(nickname: string, roomId: string) {
		const sockets = this.server.sockets.adapter.rooms.get(roomId);

		for (const socketId of sockets) {
			const target = this.server.sockets.sockets.get(socketId);
			if (target.data.nickname === nickname) {
				this.leaveRoom(target);
				target.data.roomId = 'lobby';
				target.data.roomName = 'lobby';
				this.userList[target.data.nickname].roomId = "lobby";
				this.server
					.to(roomId)
					.emit('systemMessage', `${nickname} has been kicked from the room.`);
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
		if (!chatRoom)
			throw new Error(`Room ${roomId} not found`);
		else if (chatRoom.adminList.find((value) => value === socket.data.nickname) === undefined)
			throw new Error(`You are not the administrator of the room ${roomId}.`);
		else if (chatRoom.chiefName === nickname)
			throw new Error(`You cannot ban the chief of the room ${roomId}.`);
		return chatRoom.banList.includes(nickname);
	}

	leaveRoom(socket: Socket): boolean {
		const oldRoomId = socket.data.roomId;
		socket.leave(oldRoomId);
		this.channelUserList(oldRoomId);
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
		else if (socket.data.roomId !== 'lobby') {
			delete this.chatRoomList[oldRoomId];
		}
		return true;
	}

	// 채널 유저 리스트
	async channelUserList(roomId: string) {
		const users = [];
		const sockets = this.server.sockets.adapter.rooms.get(roomId);

		if (!sockets)
			return ;
		for (const socketId of sockets) {
			const user = this.server.sockets.sockets.get(socketId);
			users.push(user.data.nickname);
		}
		this.server.to(roomId).emit('userList', users);
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
