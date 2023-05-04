import { Injectable } from '@nestjs/common';
import { GameConstants } from './gameConstants';
import { Server, Socket } from 'socket.io';
import { SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { MemberRepository } from 'src/member/member.repository';
import { MemberConstants } from 'src/member/memberConstants';
import { Interval } from '@nestjs/schedule';
import { GameQueue } from './gameQueue';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()
export class GameService {
	gameQ: GameQueue[];

	constructor(
		private memberRepository: MemberRepository,
		private channelService: ChannelService
	) { this.gameQ = new GameQueue(30)[4] }

	@SubscribeMessage('enterGame')
	waitGame(@MessageBody() data: { type: number }, @ConnectedSocket() socket: Socket) {
		if (!this.gameQ[data.type].enQueue(socket.id))
			this.channelService.server.emit("errorMessage", {message : "The waiting list is full. Please try again later."});
		socket.emit('addQueue', socket.data.nickname);
	}

	// 이건 스케쥴링으로 계속 돌아야 함, casualPower, ladder, ladderPower 각각 함수 만들어야 함. 정리 후 복붙
	// @Interval('casualGame', 10000)
	async checkCasualGame() {
		if (this.gameQ[GameConstants.CASUAL].getCount() < 2)
			return ;
		const p1 = await this.checkPlayer(MemberConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(1), 1);
		if (p1 === null)
			return ;
		const p2 = await this.checkPlayer(MemberConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(2), 2);
		if (p1 === null)
			return ;
		this.gameQ[GameConstants.CASUAL].deQueue();
		this.gameQ[GameConstants.CASUAL].deQueue();
		this.memberRepository.updateStatus(p1.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(p2.data.nickname, MemberConstants.INGAME);
		p1.emit("checkGame", p1.data.nickname);
		p2.emit("checkGame", p2.data.nickname);
	}

	async checkPlayer(type: number, name: string, flag: number): Promise<Socket> {
		if (this.gameQ[type].getCount() < 2)
			return null;
		const {status} = await this.memberRepository.getStatus(name);
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
		const socket = await this.channelService.findSocketByName(name);
		if (socket === null) {
			if (flag === 1)
				this.gameQ[type].deQueue();
			else
				this.gameQ[type].deQueueSecond();
			this.checkSocket(type, this.gameQ[type].peek(flag), flag);
		}
		return socket;
	}

	@SubscribeMessage('pressStart') // 수락 버튼 누름
	async startGame(@MessageBody() data: {type: number, opponentName: string}, @ConnectedSocket() socket: Socket) {
		const {status} = await this.memberRepository.getStatus(data.opponentName);
		if (status === MemberConstants.WAIT) {
			const opponent = await this.channelService.findSocketByName(data.opponentName);
			this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);
			this.memberRepository.updateStatus(data.opponentName, MemberConstants.INGAME);
			// 타입에 맞는 게임방 만들기
			// 두명 겜방에 초대
			// 두명 게임에 들어왔음 확인
			opponent.emit("startGame", socket.data.nickname); // 룸이름, 게임타입
			socket.emit("startGame", data.opponentName);
			// 게임 그리는 함수 호출
		}
			
			// check 단계에서 emit을 시간을 두고 보내기?
		// 	const opponent = opponentName으로 소켓찾기
		// 	this.memberRepository.updateStatus(opponentName, MemberConstants.INGAME);
		// 	this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);

		// 	타입에 맞는 게임방 생성 및 두명의 roomID 해당 게임룸으로 변경
		// 	게임 그리는 함수 호출
		// }
		// else
		// 	this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT);
	}

	// @SubscribeMessage('pressReject') // 거절 버튼 누름
	// rejectGame(@MessageBody() data: {opponentName: string}, @ConnectedSocket() socket: Socket) {
	// 	const opponent = opponentName으로 소켓찾기
	// 	const opponentStatus = this.memberRepository.getStatus(socket.data.nickname);
	// 	if (opponentStatus === MemberConstants.WAIT) { // 동시성 문제... 
	// 		this.memberRepository.updateStatus(opponentName, MemberConstants.ONLINE);
	// 		다시 웨이팅리스트에 넣어주기?? 이거 필요???;
	// 	}
	// 	opponent.emit("rejectedGame"); // 게임 리젝트 당했음을 알려주면서 수락 버튼 없애야 함 바로
	// }

	@SubscribeMessage('invite') // 채널 리스트 or 친구 중 상태가 online인 사람만 초대할 수 있게 버튼이 떠야함
	async inviteGame(@MessageBody() data: {type: number, invitee: string}, @ConnectedSocket() socket: Socket) {
		const inviteeSocket = await this.channelService.findSocketByName(data.invitee);
		const gameType = data.type;
		const inviter = socket.data.nickname;
		inviteeSocket.emit("invite", {gameType, inviter}) // 초대된 게임타입, 초대자 이름 보내주기
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT);
		// 초대된 애가 수락 누르면 pressstart로 넘어가기, 거절하면 pressreject
	}

	// @SubscribeMessage('spectator') // 채널 리스트 or 친구 중 상태가 ingame인 사람만 관전 버튼이 떠야함
	// watchGame(@MessageBody() data: {name: string}, @ConnectedSocket() socket: Socket) {
	// 	this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WATCH);
	// 	const gameId = name의 소켓을 찾은 후 .roomId;
	// 	이 소켓의 룸아이디를 gameId로 변경하기
	// }

}