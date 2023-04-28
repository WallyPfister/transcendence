import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ChatRoomListDTO } from './chatRoomDto';

import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { noop } from 'rxjs';
import { IoAdapter } from '@nestjs/platform-socket.io';

const prisma = new PrismaClient();

@Injectable()
@WebSocketGateway(3001, {
	// transports: ['websocket'],
	cors: {
	  origin: 'http://localhost:3002',
	  methods: ['GET', 'POST'],
	  credentials: true
	}
  })
export class ChannelService {
	
	@WebSocketServer()
	server:Server;
	chatRoomList: Record<string, ChatRoomListDTO>;

	constructor(){
		this.chatRoomList = {
			"lobby": {
				roomId: "lobby",
				roomName: 'lobby',
				chiefId: null,
				banList: [],
				muteList: {},
			},
		}
	}

	handleConnection(socket: Socket) {
		console.log(`Client connected with ID ${socket.id}`);
		console.log(`data ==> ${socket.data.nickname}`);
	}

	@SubscribeMessage('setUser')
	async setUser(@MessageBody() data: { nickname: string }, @ConnectedSocket() socket: Socket){
		const nickname = data.nickname;
	
		socket.data.roomId = "lobby";
		socket.data.roomName = "lobby";
		socket.data.nickname = nickname;
		console.log("====setUser====");
		console.log(nickname);
		socket.join(socket.data.roomId);
		this.server.to(socket.data.roomId).emit('addUser', nickname);
		this.channelUserList(socket);
	}

	@SubscribeMessage('createRoom')
	async createRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() socket: Socket){
		const roomName = data.roomId;
		const existingRoom = Object.values(this.chatRoomList).find(
			(room) => room.roomName === roomName
		  );
		
		  if (existingRoom) {
			this.server.emit('errorMessage', {
			  message: `${roomName} 방이 이미 존재합니다.`,
			});
			return;
		  }
		  
		  socket.leave(socket.data.roomId);
		  this.isChief(this.chatRoomList[socket.data.roomId], socket);

		  socket.data.roomId = roomName;
		  socket.data.roomName = roomName;
		  this.chatRoomList[roomName] = { 
				roomId: roomName,
				roomName: roomName,
				chiefId: socket.data.nickname,
				banList: [],
				muteList: {},
		}
		socket.join(roomName);
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(@MessageBody() data: {roomId: string}, @ConnectedSocket() socket: Socket) {
		const roomId = data.roomId;
		const noRoom = Object.values(this.chatRoomList).find( (room) => room.roomId === roomId);

		if (noRoom == undefined){
			this.server.emit("errorMessage", {message : "존재하지 않는 방입니다.",})
			return ;
		}
		if (noRoom.banList.includes(socket.data.nickname) == true){
			socket.emit("newMessage", {message: "입장이 제한된 방입니다."});
			return ;
		}
		if (noRoom.roomId == socket.data.roomId){
			socket.emit("newMessage", {message: "이미 입장한 방입니다."});
			return ;
		}
		socket.leave(socket.data.roomId);
		this.isChief(this.chatRoomList[socket.data.roomId], socket);
		
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		socket.join(roomId);
		this.server.to(socket.data.roomId).emit('addUser', socket.data.nickname);
		this.channelUserList(socket);
	}

	@SubscribeMessage("sendMessage")
	async sendMessage(@MessageBody() data: {message: string}, @ConnectedSocket() socket: Socket) {
		const nickname = socket.data.nickname;
		const message = data.message;
		const chatRoom = this.chatRoomList[socket.data.roomId];
		
		console.log("=====send=====");
		console.log(this.chatRoomList);
		console.log(socket.data.roomId);
		if (chatRoom && Object.keys(chatRoom.muteList).includes(nickname)){
			const now = new Date();
			const diff = (now.getTime() - chatRoom.muteList[nickname].getTime()) / 1000 / 60;
			console.log(diff);
			if (diff < 4){
				socket.emit("newMessage", {message: `your chat is blocked in ${socket.data.roomId}`});
				return;
			}
			delete chatRoom.muteList[nickname];
		}
		this.server.to(socket.data.roomId).emit('newMessage', {nickname, message});
	}

	@SubscribeMessage("chatRoomList")
	async channelList(){
		this.server.emit("channelList", Object.keys(this.chatRoomList));
	}

	@SubscribeMessage("exitChannel")
	async exitChannel(@ConnectedSocket() socket: Socket){
		const chatRoom = this.chatRoomList[socket.data.roomId];

		socket.leave(socket.data.roomId); 
		this.isChief(chatRoom, socket);

		socket.data.roomId = "lobby";
		socket.data.roomName = "lobby";
		socket.join("lobby");
		socket.emit("newMessage", `채팅방을 나와 lobby로 나오셨습니다.`);
	}

	async isChief(chatRoom: ChatRoomListDTO, socket: Socket){
		if (chatRoom.chiefId == socket.data.nickname){
			const sockets = this.server.sockets.adapter.rooms.get(socket.data.roomId);
			if (sockets)
				chatRoom.chiefId = Array.from(sockets.values())[0];
		}
	}
	@SubscribeMessage("mute")
	async mute(@MessageBody() data:{nickname: string}, @ConnectedSocket() socket: Socket){
		const chatRoom = this.chatRoomList[socket.data.roomId];

		if (!chatRoom){
			socket.emit("newMessage", `Room ${socket.data.roomId} not found`);
			throw new Error(`Room ${socket.data.roomId} not found`);
		}
		if (chatRoom.chiefId != socket.data.nickname){
			socket.emit("newMessage", `Room ${socket.data.roomId} admin is not you`);
			throw new Error(`Room ${socket.data.roomId} admin is not you`);
		}
		chatRoom.muteList[data.nickname] = new Date();
		socket.emit("newMessage", `${data.nickname} is mute`);
	}

	// banList에 사용자 추가
	@SubscribeMessage("ban")
	addBanlist(@MessageBody() data : {nickname: string}, @ConnectedSocket() socket: Socket) {
		const nickname = data.nickname;
		const chatRoom = this.chatRoomList[socket.data.roomId];

		if (this.isBanned(nickname, socket) == true){
			socket.emit("newMessage", {message: `이미 banlist에 ${nickname}이(가) 있습니다.`});
			return ;
		}
		chatRoom.banList.push(nickname);
		this.kick(nickname, socket.data.roomId);
		socket.emit("newMessage", {message: `banlist에서 ${nickname}을 추가했습니다.`});
	}
	
	// banList에서 사용자 제거
	@SubscribeMessage("banCancel")
	removeBanlist(@MessageBody() data : {nickname: string}, @ConnectedSocket() socket: Socket) {
		const {nickname} = data;
		const chatRoom = this.chatRoomList[socket.data.roomId];

		if (this.isBanned(nickname, socket) == false){
			socket.emit("newMessage", {message: `nobody there`});
			return ;
		}

		const index = chatRoom.banList.indexOf(nickname);
		if (index !== -1) {
			chatRoom.banList.splice(index, 1);
		}
		socket.emit("newMessage", {message: `banlist에서 ${nickname}을 제외했습니다.`})
	}

	// 다이렉트 메세지 만들기
	@SubscribeMessage("privateMessage")
	async privateMessage(@MessageBody() data: {nickname: string, message: string}){
		const memberId = await prisma.member.findUnique({
			where: {
				name: data.nickname,
			},
			select: {
				socket: true,
			},
		}).then((result) => result?.socket);
		
		console.log(memberId); // 이거 나중에 emit으로 수정
	}
	
	kick(nickname: string, roomId: string) {
		console.log("===== kick =====");
		console.log(nickname);
		console.log(roomId);
		const sockets = this.server.sockets.adapter.rooms.get(roomId);

		for(const socketId of sockets){
			const target = this.server.sockets.sockets.get(socketId);
			console.log(target.data.nickname);
			console.log(target.data.roomId);
			if (target.data.nickname == nickname){
				target.leave(target.data.roomId);
				target.data.roomId = "lobby";
				target.data.roomName = "lobby";
				this.server.to(roomId).emit("newMessage", {message: `${nickname} 님이 추방되었습니다.`});
				target.join("lobby");
				return ;
			}
		}
	}

	// 사용자가 banList에 있는지 확인 및 관리자인지 확인
	isBanned(nickname: string, socket: Socket): boolean {
		const roomId = socket.data.roomId;
		const chatRoom = this.chatRoomList[roomId];

		if (!chatRoom){
			socket.emit("newMessage", `Room ${roomId} not found`);
			throw new Error(`Room ${roomId} not found`);
		}
		if (chatRoom.chiefId != socket.data.nickname){
			socket.emit("newMessage", `Room ${roomId} admin is not you`);
			throw new Error(`Room ${roomId} admin is not you`);
		}
		if (chatRoom.chiefId == nickname){
			socket.emit("newMessage", `Room ${roomId} ban target is admin`);
			throw new Error(`Room ${roomId} ban target is admin`);
		}

		return chatRoom.banList.includes(nickname);
	}

	
	// 채널 유저 리스트
	async channelUserList(socket: Socket){
		const users = [];
		const sockets = this.server.sockets.adapter.rooms.get(socket.data.roomId);
		
		console.log("=====here!!!!=====");
		for (const socketId of sockets){
			const user = this.server.sockets.sockets.get(socketId);
			console.log(user.data.nickname);
			users.push(user.data.nickname);
		}
		console.log(users);
		socket.emit("userList", users);
	}
}

  