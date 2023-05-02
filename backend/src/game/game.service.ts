import { Injectable } from '@nestjs/common';
import { GameConstants } from './gameConstants';
import { Server, Socket } from 'socket.io';
import { SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { MemberRepository } from 'src/member/member.repository';
import { MemberConstants } from 'src/member/memberConstants';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class GameService {
	@WebSocketServer()
	server: Server;
	gameQ: GameQueue[];

	constructor(private memberRepository: MemberRepository) {
		this.gameQ[GameConstants.CASUAL] = new GameQueue(30);
		this.gameQ[GameConstants.CASUAL_P] = new GameQueue(30);
		this.gameQ[GameConstants.LADDER] = new GameQueue(30);
		this.gameQ[GameConstants.LADDER_P] = new GameQueue(30);
	}

	@SubscribeMessage('enterGame')
	waitGame(@MessageBody() data: { type: number }, @ConnectedSocket() socket: Socket) {
		if (!this.gameQ[data.type].enQueue(socket.id))
			this.server.emit("errorMessage", {message : "The waiting list is full. Please try again later."});
		socket.emit('addQueue', socket.data.nickname);
	}

	// 이건 스케쥴링으로 계속 돌아야 함, casualPower, ladder, ladderPower 각각 함수 만들어야 함. 정리 후 복붙
	@Interval('casualGame', 5000)
	checkCasualGame() {
		if (this.gameQ[GameConstants.CASUAL].getCount() < 2)
			return ;
		const p1 = this.gameQ[GameConstants.CASUAL].deQueue();
		const p2 = this.gameQ[GameConstants.CASUAL].deQueue();
		const s1 = 큐에 들어있는 이름으로 소켓 찾기
		const s2 = 큐에 들어있는 이름으로 소켓 찾기
		s1.emit("checkGame", s1.data.nickname);
		s2.emit("checkGame", s2.data.nickname);
	}

	@SubscribeMessage('pressStart') // 수락 버튼 누름
	startGame(@MessageBody() data: {type: number, opponentName: string}, @ConnectedSocket() socket: Socket) {
		const opponentStatus = this.memberRepository.getStatus(socket.data.nickname);
		if (opponentStatus === MemberConstants.WAIT) { // start, reject 모두 동시성 문제를 어떻게 해결할 것인지?
			// check 단계에서 emit을 시간을 두고 보내기?
			const opponent = opponentName으로 소켓찾기
			this.memberRepository.updateStatus(opponentName, MemberConstants.INGAME);
			this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);
			opponent.emit("startGame", socket.data.nickname);
			socket.emit("startGame", opponentName);
			타입에 맞는 게임방 생성 및 두명의 roomID 해당 게임룸으로 변경
			게임 그리는 함수 호출
		}
		else
			this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT);
	}

	@SubscribeMessage('pressReject') // 거절 버튼 누름
	rejectGame(@MessageBody() data: {opponentName: string}, @ConnectedSocket() socket: Socket) {
		const opponent = opponentName으로 소켓찾기
		const opponentStatus = this.memberRepository.getStatus(socket.data.nickname);
		if (opponentStatus === MemberConstants.WAIT) { // 동시성 문제... 
			this.memberRepository.updateStatus(opponentName, MemberConstants.ONLINE);
			다시 웨이팅리스트에 넣어주기?? 이거 필요???;
		}
		opponent.emit("rejectedGame"); // 게임 리젝트 당했음을 알려주면서 수락 버튼 없애야 함 바로
	}

	@SubscribeMessage('invite') // 채널 리스트 or 친구 중 상태가 online인 사람만 초대할 수 있게 버튼이 떠야함
	inviteGame(@MessageBody() data: {type: number, invited: string}, @ConnectedSocket() socket: Socket) {
		const invitedSocket = 초대하려는 애 이름으로 소켓찾기;
		const gameType = data.type;
		const invitor = socket.data.nickname;
		invitedSocket.emit("invite", {gameType, invitor}) // 초대된 게임타입, 초대자 이름 보내주기
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT);
		// 초대된 애가 수락 누르면 pressstart로 넘어가기, 거절하면 pressreject
	}

	@SubscribeMessage('spectator') // 채널 리스트 or 친구 중 상태가 ingame인 사람만 관전 버튼이 떠야함
	watchGame(@MessageBody() data: {name: string}, @ConnectedSocket() socket: Socket) {
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WATCH);
		const gameId = name의 소켓을 찾은 후 .roomId;
		이 소켓의 룸아이디를 gameId로 변경하기
	}

}