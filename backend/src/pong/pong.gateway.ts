import { Injectable } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Ball } from "./pong.interface"
import { Player } from "./pong.interface";
import { Server, Socket } from 'socket.io';
import { Interval } from '@nestjs/schedule';

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
	gameList: string[] = [];
	ball: Ball;
	userA: Player;
	userB: Player;

	constructor(){
		this.ball={
			x: 450,
			y: 300,
			radius: 10,
			speed: 10,
			velocityX: 5,
			velocityY: 5,
			color: "BLACK"
		};
		this.userA = {
			x : 0,
			y : 250,
			width : 10,
			height : 100,
			color : "BLACK",
			score : 0
		}
		this.userB = {
			x : 890,
			y : 250,
			width : 10,
			height : 100,
			color : "GRAY",
			score : 0
		}
	}

	handleConnection(socket: Socket) {
		console.log("This is Pong socket server");
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log("Pong socket server Disconnect");
		this.gameList.pop();
	  }

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
	
	resetBall(){
		this.ball.x = 450;
		this.ball.y = 300;
		this.ball.velocityX = -1 * this.ball.velocityX;
	}
	
	init(playerA: Player, playerB: Player, ball: Ball){
		playerA = {
			x : 0,
			y : 350,
			width : 10,
			height : 100,
			color : "WHITE",
			score : 0
		}
		playerB = {
			x : 890,
			y : 350,
			width : 10,
			height : 100,
			color : "WHITE",
			score : 0
		}
		ball = {
			x: 450,
			y: 300,
			radius: 10,
			speed: 5,
			velocityX: 5,
			velocityY: 5,
			color: "BLACK"
		}
	}
	
	@SubscribeMessage("register")
	async register(@ConnectedSocket() socket: Socket){
		this.gameList.push(socket.id);
		console.log(this.gameList);
	}
	
	@SubscribeMessage("setting")
	  game() {
		let ball: Ball;
		let playerA: Player;
		let playerB: Player;
	
		this.init(playerA, playerB, ball);
	}
	
	@SubscribeMessage("paddleUpdate")
	async paddleUpdate(@MessageBody() y: number){
		this.userA.y = y;
	}
	
	@Interval(15)
	async upadte(){
		for (const socketId of this.gameList){
			const socket = this.server.sockets.sockets.get(socketId);
			this.ball.x += this.ball.velocityX;
			this.ball.y += this.ball.velocityY;
	
			let computerLevel = 0.1;
			this.userB.y += (this.ball.y - (this.userB.y + this.userB.height / 2)) * computerLevel;
	
			if (this.ball.y + this.ball.radius > 600 || this.ball.y - this.ball.radius < 0)
				this.ball.velocityY = -this.ball.velocityY;
	
			let player = (this.ball.x < 900 / 2) ? this.userA : this.userB;
	
			if (this.collision(this.ball, player)){
				// 공이 플레이어를 친 곳
				let colliedPoint = this.ball.y - (player.y + player.height / 2);
		
				// 평균화
				colliedPoint = colliedPoint / (player.height / 2);
		
				// calculate angle in Radian
				let angleRad = colliedPoint * Math.PI / 4;
		
		
				let direction = (this.ball.x < 900 / 2) ? 1 : -1;
				// change vel X and Y
				this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
				this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
		
				// ball.speed += 0.5;
			}
	
			if (this.ball.x - this.ball.radius < 0){
				this.userB.score++;
				this.resetBall();
			}
			else if (this.ball.x + this.ball.radius > 900){
				this.userA.score++
				this.resetBall();
			}
			if (this.userA.score > 2 || this.userB.score > 2)
				this.endGame();
			socket.emit("update", {ball: this.ball, userA: this.userA, userB: this.userB});
		}
	}
	
	endGame(){
		this.gameList.pop();
		// socket.emit("endGame");
	}

}

/** game logic */
