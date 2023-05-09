import { Injectable } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Ball } from "./pong.interface"
import { Player } from "./pong.interface";
import { Server, Socket } from 'socket.io';
import { Interval } from '@nestjs/schedule';
import { gameRoomDto } from "./gameRoomDto";


@Injectable()
@WebSocketGateway(3001, {
	// transports: ['websocket'],
	cors: {
	  origin: 'http://localhost:3002',
	  methods: ['GET', 'POST'],
	  credentials: true
	}
  })
export class Pong{

	@WebSocketServer()
	server:Server;

	// 임시 리스트 나중에 바꿔야함
	gameRoomList: Record<string, gameRoomDto>;

	constructor(){
		this.gameRoomList = {};
	}

	handleConnection(socket: Socket) {
		console.log("This is Pong socket server");
	}

	// handleDisconnect(@ConnectedSocket() client: Socket) {
	// 	console.log("Pong socket server Disconnect");
	// 	this.gameList.pop();
	//   }

	collision(b: Ball, p: Player): boolean{
		const bTop = b.y - b.radius;
		const bBottom = b.y + b.radius;
		const bLeft = b.x - b.radius;
		const bRight = b.x + b.radius;
	
		const pTop = p.y;
		const pBottom = p.y + p.height;
		const pLeft = p.x;
		const pRight = p.x + p.width;
	
		return bRight > pLeft && bBottom > pTop && bLeft < pRight && bTop < pBottom;
	}
	
	resetBall(roomId: string){
		this.gameRoomList[roomId].ball.x = 450;
		this.gameRoomList[roomId].ball.y = 300;
		this.gameRoomList[roomId].ball.velocityX = -1 * this.gameRoomList[roomId].ball.velocityX;
	}
	
	@SubscribeMessage("test")
	async test(@MessageBody() data: {roomId: string, socketId: string}){
		console.log("=====test=====");
	}
	
	@SubscribeMessage("register")
	async register(@MessageBody() data: {roomId: string}, @ConnectedSocket() socket:Socket){
		if (this.server.sockets.adapter.rooms.get(data.roomId) == undefined)
			return ;
		this.gameRoomList[data.roomId] = {
			ball: {x: 450,
			y: 300,
			radius: 10,
			speed: 10,
			velocityX: 5,
			velocityY: 5,
			color: "BLACK"
			},
			playerA: {
				x : 0,
				y : 350,
				width : 10,
				height : 100,
				color : "WHITE",
				score : 0
			},
			playerB: {
				x : 890,
				y : 350,
				width : 10,
				height : 100,
				color : "WHITE",
				score : 0
			}
		}
	}
	
	@SubscribeMessage("paddleA")
	async paddleA(@MessageBody() data: {roomId: string, y: number} ){
		// console.log("======= Paddle =======");
		// console.log(data);
		// console.log(this.gameRoomList);
		if(!this.gameRoomList[data.roomId])
			return;
		this.gameRoomList[data.roomId].playerA.y = data.y;
	}

	@SubscribeMessage("paddleB")
	async paddleB(@MessageBody() data: {roomId: string, y: number} ){
		if(!this.gameRoomList[data.roomId])
			return;
		this.gameRoomList[data.roomId].playerB.y = data.y;
	}
	
	@Interval(15)
	async upadte(){
		if (!this.gameRoomList)
			return ;
		for (const roomId of Object.keys(this.gameRoomList)){
			this.gameRoomList[roomId].ball.x += this.gameRoomList[roomId].ball.velocityX;
			this.gameRoomList[roomId].ball.y += this.gameRoomList[roomId].ball.velocityY;
			let computerLevel = 0.1;
			this.gameRoomList[roomId].playerB.y += (this.gameRoomList[roomId].ball.y - (this.gameRoomList[roomId].playerB.y + this.gameRoomList[roomId].playerB.height / 2)) * computerLevel;
	
			if (this.gameRoomList[roomId].ball.y + this.gameRoomList[roomId].ball.radius > 600 || this.gameRoomList[roomId].ball.y - this.gameRoomList[roomId].ball.radius < 0)
				this.gameRoomList[roomId].ball.velocityY = -this.gameRoomList[roomId].ball.velocityY;
	
			let player = (this.gameRoomList[roomId].ball.x < 900 / 2) ? this.gameRoomList[roomId].playerA : this.gameRoomList[roomId].playerB;
	
			if (this.collision(this.gameRoomList[roomId].ball, player)){
				// 공이 플레이어를 친 곳
				let colliedPoint = this.gameRoomList[roomId].ball.y - (player.y + player.height / 2);
		
				// 평균화
				colliedPoint = colliedPoint / (player.height / 2);
		
				// calculate angle in Radian
				let angleRad = colliedPoint * Math.PI / 4;
		
		
				let direction = (this.gameRoomList[roomId].ball.x < 900 / 2) ? 1 : -1;
				// change vel X and Y
				this.gameRoomList[roomId].ball.velocityX = direction * this.gameRoomList[roomId].ball.speed * Math.cos(angleRad);
				this.gameRoomList[roomId].ball.velocityY = this.gameRoomList[roomId].ball.speed * Math.sin(angleRad);
		
				// ball.speed += 0.5;
			}
	
			if (this.gameRoomList[roomId].ball.x - this.gameRoomList[roomId].ball.radius < 0){
				this.gameRoomList[roomId].playerB.score++;
				this.resetBall(roomId);
			}
			else if (this.gameRoomList[roomId].ball.x + this.gameRoomList[roomId].ball.radius > 900){
				this.gameRoomList[roomId].playerA.score++
				this.resetBall(roomId);
			}
			if (this.gameRoomList[roomId].playerA.score > 2 || this.gameRoomList[roomId].playerB.score > 2)
				this.endGame(roomId);
			this.server.to(roomId).emit("update", {ball: this.gameRoomList[roomId].ball, playerA: this.gameRoomList[roomId].playerA, playerB: this.gameRoomList[roomId].playerB});
			// this.server.emit("update", {ball: this.gameRoomList[roomId].ball, playerA: this.gameRoomList[roomId].playerA, playerB: this.gameRoomList[roomId].playerB});
		}
	}
	
	endGame(roomId: string){
		this.server.to(roomId).emit("endgame", {ball: this.gameRoomList[roomId].ball, playerA: this.gameRoomList[roomId].playerA, playerB: this.gameRoomList[roomId].playerB});
		delete this.gameRoomList[roomId];
	}

}

/** game logic */
