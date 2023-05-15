import { Injectable } from '@nestjs/common';
import { GameConstants } from './gameConstants';
import { Socket, Server } from 'socket.io';
import { SubscribeMessage, MessageBody, ConnectedSocket, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MemberRepository } from 'src/member/member.repository';
import { MemberConstants } from 'src/member/memberConstants';
import { Interval } from '@nestjs/schedule';
import { GameQueue } from './gameQueue';
import { GameInfoDto } from './dto/gameInfo.dto';
import { MemberService } from 'src/member/member.service';
import { GameResultDto } from './dto/gameResult.dto';
import { GameRepository } from './game.repository';
import { randomBytes } from 'crypto';

@Injectable()
@WebSocketGateway(3001, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class GameService {
	private gameQ: GameQueue[];
	@WebSocketServer()
	server: Server;

	constructor( private memberService: MemberService,
				private memberRepository: MemberRepository,
				private gameRepository: GameRepository )
				{ this.gameQ = Array.from({ length: 3 }, () => new GameQueue(30)); }

	@SubscribeMessage('enterGame')
	waitGame(@MessageBody() type: number, @ConnectedSocket() socket: Socket) {
		if (socket.data.nickname === undefined) {
			socket.emit("duplicateUser");
			return ;
		}
		if (!this.gameQ[type].enQueue(socket.data.nickname)) {
			socket.emit('errorMessage', "The waiting list is full. Please try again later.");
			return;
		}
		socket.emit('addQueue', socket.data.nickname);
	}

	@Interval('casual', 7000)
	async checkCasualGame() {
		if (this.gameQ[GameConstants.CASUAL].getCount() < 2)
			return;
		const p1 = await this.checkPlayer(GameConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(1), 1);
		if (p1 === null)
			return;
		const p2 = await this.checkPlayer(GameConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(2), 2);
		if (p1 === null)
			return;
		if (p1.data.nickname === p2.data.nickname) {
			this.gameQ[GameConstants.CASUAL].deQueue();
			return;
		}
		this.gameQ[GameConstants.CASUAL].deQueue();
		this.gameQ[GameConstants.CASUAL].deQueue();
		this.memberRepository.updateStatus(p1.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(p2.data.nickname, MemberConstants.INGAME);
		const roomId = randomBytes(Math.ceil(25 / 2)).toString('hex').slice(0, 25);
		p1.emit("startGame", new GameInfoDto(GameConstants.CASUAL, roomId, p1.data.nickname, p2.data.nickname, 0));
		p2.emit("startGame", new GameInfoDto(GameConstants.CASUAL, roomId, p1.data.nickname, p2.data.nickname, 1));
	}

	@Interval('casual_p', 7000)
	async checkCasualPowerGame() {
		if (this.gameQ[GameConstants.CASUAL_P].getCount() < 2)
			return;
		const p1 = await this.checkPlayer(GameConstants.CASUAL_P, this.gameQ[GameConstants.CASUAL_P].peek(1), 1);
		if (p1 === null)
			return;
		const p2 = await this.checkPlayer(GameConstants.CASUAL_P, this.gameQ[GameConstants.CASUAL_P].peek(2), 2);
		if (p1 === null)
			return;
		if (p1.data.nickname === p2.data.nickname) {
			this.gameQ[GameConstants.CASUAL_P].deQueue();
			return;
		}
		this.gameQ[GameConstants.CASUAL_P].deQueue();
		this.gameQ[GameConstants.CASUAL_P].deQueue();
		this.memberRepository.updateStatus(p1.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(p2.data.nickname, MemberConstants.INGAME);
		const roomId = randomBytes(Math.ceil(25 / 2)).toString('hex').slice(0, 25);
		p1.emit("startGame", new GameInfoDto(GameConstants.CASUAL_P, roomId, p1.data.nickname, p2.data.nickname, 0));
		p2.emit("startGame", new GameInfoDto(GameConstants.CASUAL_P, roomId, p1.data.nickname, p2.data.nickname, 1));
	}

	@Interval('ladder', 7000)
	async checkLadderGame() {
		if (this.gameQ[GameConstants.LADDER].getCount() < 2)
			return;
		const p1 = await this.checkPlayer(GameConstants.LADDER, this.gameQ[GameConstants.LADDER].peek(1), 1);
		if (p1 === null)
			return;
		const p2 = await this.checkPlayer(GameConstants.LADDER, this.gameQ[GameConstants.LADDER].peek(2), 2);
		if (p1 === null)
			return;
		if (p1.data.nickname === p2.data.nickname) {
			this.gameQ[GameConstants.LADDER].deQueue();
			return;
		}
		this.gameQ[GameConstants.LADDER].deQueue();
		this.gameQ[GameConstants.LADDER].deQueue();
		this.memberRepository.updateStatus(p1.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(p2.data.nickname, MemberConstants.INGAME);
		const roomId = randomBytes(Math.ceil(25 / 2)).toString('hex').slice(0, 25);
		p1.emit("startGame", new GameInfoDto(GameConstants.LADDER, roomId, p1.data.nickname, p2.data.nickname, 0));
		p2.emit("startGame", new GameInfoDto(GameConstants.LADDER, roomId, p1.data.nickname, p2.data.nickname, 1));
	}

	async checkPlayer(type: number, name: string, flag: number): Promise<Socket> {
		if (this.gameQ[type].getCount() < 2)
			return null;
		const { status } = await this.memberRepository.getStatus(name);
		if (status !== MemberConstants.ONLINE) {
			if (flag === 1)
				this.gameQ[type].deQueue();
			else
				this.gameQ[type].deQueueSecond();
			this.checkPlayer(type, this.gameQ[type].peek(flag), flag);
		}
		return this.checkSocket(type, name, flag);
	}

	async checkSocket(type: number, name: string, flag: number): Promise<Socket> {
		if (this.gameQ[type].getCount() < 2)
			return null;
		const socket = await this.findSocketByName(name);
		if (socket === null) {
			if (flag === 1)
				this.gameQ[type].deQueue();
			else
				this.gameQ[type].deQueueSecond();
			this.checkSocket(type, this.gameQ[type].peek(flag), flag);
		}
		return socket;
	}

	async findSocketByName(name: string): Promise<Socket> {
		const sockets = this.server.sockets.sockets;
		for (const [_, socket] of sockets) {
			if (socket.data.nickname === name) return socket;
		}
		return null;
	}

	@SubscribeMessage('invite')
	async inviteGame(@MessageBody() data: { type: number, invitee: string }, @ConnectedSocket() socket: Socket) {
		const { status } = await this.memberRepository.getStatus(data.invitee);
		if (status !== MemberConstants.ONLINE) {
			socket.emit('errorMessage', "The invitee\'s status is not online. Please try again later.");
			return;
		}
		const inviteeSocket = await this.findSocketByName(data.invitee);
		const gameType = data.type;
		const inviter = socket.data.nickname;
		inviteeSocket.emit("invite", { gameType, inviter })
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT);
	}

	@SubscribeMessage('inviteAccept')
	async startGame(@MessageBody() data: { type: number, inviterName: string }, @ConnectedSocket() socket: Socket) {
		const { status } = await this.memberRepository.getStatus(data.inviterName);
		const inviter = await this.findSocketByName(data.inviterName);
		if (status !== MemberConstants.WAIT || inviter === null) {
			socket.emit("lost", data.inviterName);
			return;
		}
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(data.inviterName, MemberConstants.INGAME);

		const roomId = randomBytes(Math.ceil(25 / 2)).toString('hex').slice(0, 25);
		inviter.emit("startGame", new GameInfoDto(data.type, roomId, data.inviterName, socket.data.nickname, 0));
		socket.emit("startGame", new GameInfoDto(data.type, roomId, data.inviterName, socket.data.nickname, 1));
	}

	@SubscribeMessage('inviteReject')
	async rejectGame(@MessageBody() inviterName: string, @ConnectedSocket() socket: Socket) {
		const inviter = await this.findSocketByName(inviterName);
		if (inviter === null)
			return;
		this.memberRepository.updateStatus(inviterName, MemberConstants.ONLINE);
		inviter.emit("rejectedGame", socket.data.nickname);
	}

	updateGameResult(result: GameResultDto): void {
		this.memberService.updateWinGameResult(result);
		this.memberService.updateLoseGameResult(result.loser, result.type);
		this.gameRepository.createHistory(result.winner, result.loser, result.winScore, result.loseScore, true, result.type);
		this.gameRepository.createHistory(result.loser, result.winner, result.loseScore, result.winScore, false, result.type);
		this.memberRepository.updateStatus(result.winner, MemberConstants.ONLINE);
		this.memberRepository.updateStatus(result.loser, MemberConstants.ONLINE);
	}
}