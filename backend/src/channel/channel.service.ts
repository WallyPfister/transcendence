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
				muteList: [],
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
	``
		socket.data.roomId = "lobby";
		socket.data.roomName = "lobby";
		socket.data.nickname = nickname;
		socket.join(socket.data.roomId);
		this.server.to(socket.data.roomId).emit('newMessage', { nickname, message: `${nickname}님이 입장하셨습니다.` });
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
		  socket.data.roomId = roomName;
		  socket.data.roomName = roomName;
		  socket.data.chiefId = socket.id;
		  this.chatRoomList[roomName] = { 
				roomId: roomName,
				roomName: roomName,
				chiefId: socket.id,
				banList: [],
				muteList: [],
		}
		socket.join(roomName);
	}

	@SubscribeMessage('joinRoom')
	async joinRoom(@MessageBody() data: {roomId: string}, @ConnectedSocket() socket: Socket) {
		const roomId = data.roomId;
		const noRoom = Object.values(this.chatRoomList).find( (room) => room.roomId === roomId);

		console.log(Object.values(this.chatRoomList));
		if (noRoom == undefined){
			this.server.emit("errorMessage", {
				message : "존재하지 않는 방입니다.",
			})
			return ;
		}
		if (noRoom.banList.includes(socket.data.nickname) == true){
			socket.emit("newMessage", {message: "입장이 제한된 방입니다."});
			return ;
		}

		socket.leave(socket.data.roomId);
		socket.data.roomId = roomId;
		socket.data.roomName = roomId;
		socket.join(roomId);
	  	this.server.to(roomId).emit('newMessage', {
			message: `${socket.data.nickname} 님이 입장하셨습니다.`,
		});
	}

	@SubscribeMessage("sendMessage")
	async sendMessage(@MessageBody() data: {message: string}, @ConnectedSocket() socket: Socket) {
		const nickname = socket.data.nickname;
		const message = data.message;
		this.server.to(socket.data.roomId).emit('newMessage', {nickname, message});
	}

	@SubscribeMessage("channel")
	async channelList(){
		this.server.emit("channelList", Object.keys(this.channelList));
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

	kick(nickname: string, roomId: string) {
		const sockets = this.server.sockets.adapter.rooms.get(roomId);

		for(const socketId of sockets){
			const target = this.server.sockets.sockets.get(socketId);
			console.log(target.data.nickname);
			console.log(target.data.roomId);
			if (target.data.nickname == nickname){
				console.log("here we go");
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
		if (chatRoom.chiefId != socket.id){
			socket.emit("newMessage", `Room ${roomId} admin is not you`);
			throw new Error(`Room ${roomId} admin is not you`);
		}

		return chatRoom.banList.includes(nickname);
	}
}

  