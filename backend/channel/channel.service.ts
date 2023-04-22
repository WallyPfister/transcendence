import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ChatRoomListDTO } from './chatRoomDto';

import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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
				roomName: '로비',
				chiefId: null,
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
		socket.join(socket.data.roomId);
		this.server.to(socket.data.roomId).emit('newMessage', { nickname });
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
		console.log(`roomId ==> ${socket.data.roomId}`);
		console.log(`roomName ==> ${socket.data.roomName}`);
		console.log(`nickname ==> ${socket.data.nickname}`);
		this.server.to(socket.data.roomId).emit('newMessage', {nickname, message});
	}

	@SubscribeMessage("channel")
	async channelList(){
		this.server.emit("channelList", Object.keys(this.channelList));
	}
}

  