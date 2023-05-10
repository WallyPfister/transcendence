import { Injectable } from '@nestjs/common';
import { GameConstants } from './gameConstants';
import { Socket } from 'socket.io';
import { SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { MemberRepository } from 'src/member/member.repository';
import { MemberConstants } from 'src/member/memberConstants';
import { Interval } from '@nestjs/schedule';
import { GameQueue } from './gameQueue';
import { ChannelService } from 'src/channel/channel.service';
import { GameInfoDto } from './dto/gameInfo.dto';
import { MemberService } from 'src/member/member.service';
import { GameResultDto } from './dto/gameResult.dto';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
	private gameQ: GameQueue[];

	constructor(
		private gameRepository: GameRepository,
		private readonly memberService: MemberService,
		private memberRepository: MemberRepository,
		private readonly channelService: ChannelService
	) { this.gameQ = new GameQueue(30)[4] }

	@SubscribeMessage('enterGame') // 희망 게임을 보내줘야 함 0 casual, 1 casual power, 2 ladder, 3 ladder power
	waitGame(@MessageBody() type: number, @ConnectedSocket() socket: Socket) {
		if (!this.gameQ[type].enQueue(socket.id))
			this.channelService.server.emit("errorMessage", {message : "The waiting list is full. Please try again later."});
		socket.emit('addQueue', socket.data.nickname); // 큐에 넣어졌음을 알려줌. 굳이 응답 안해줘도 되면 삭제해도 됨.
	}

	// 이건 스케쥴링으로 계속 돌아야 함, casualPower, ladder, ladderPower 각각 함수 만들어야 함. 정리 후 복붙
	// @Interval('casualGame', 10000)
	async checkCasualGame() {
		if (this.gameQ[GameConstants.CASUAL].getCount() < 2) // 큐에 두개 이하면 실행 안함
			return ;
		const p1 = await this.checkPlayer(MemberConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(1), 1);
		if (p1 === null)
			return ;
		const p2 = await this.checkPlayer(MemberConstants.CASUAL, this.gameQ[GameConstants.CASUAL].peek(2), 2);
		if (p1 === null)
			return ; // 여기까지 지내면 p1, p2 둘다 정상 남아있다는 뜻
		this.gameQ[GameConstants.CASUAL].deQueue(); // 두명을 큐에서 뻄
		this.gameQ[GameConstants.CASUAL].deQueue();
		this.memberRepository.updateStatus(p1.data.nickname, MemberConstants.INGAME); // 두명을 인게임으로 변경해
		this.memberRepository.updateStatus(p2.data.nickname, MemberConstants.INGAME);
		p1.emit("startGame", new GameInfoDto(GameConstants.CASUAL, p1.data.nickname, p2.data.nickname)); // 게임 시작 정보 알려줌
		p2.emit("startGame", new GameInfoDto(GameConstants.CASUAL, p1.data.nickname, p2.data.nickname));
	} // 아마 프론트 머 몇초 후 겜방으로 이동합니다 창 띄운다음에 쫌 이따 게임창 띄워주고 백에 성훈이 게임 시작 함수 호출.
	// 그러면 백에서 해야 하는 거 게임방 만들고, 두명 게임에 넣고, 게임 그리기 시작

	async checkPlayer(type: number, name: string, flag: number): Promise<Socket> {
		if (this.gameQ[type].getCount() < 2)
			return null;
		const {status} = await this.memberRepository.getStatus(name);
		if (status !== MemberConstants.ONLINE) { // offline, ingame(초대게임 하는 중일 때), wait(게임 초대했을 때) 모두제외 당장 게임 시작이 가능한 경우
			if (flag === 1)
				this.gameQ[type].deQueue();
			else
				this.gameQ[type].deQueueSecond();
			this.checkPlayer(type, this.gameQ[type].peek(flag), flag); // 재귀 다음 사람 뽑아
		}
		return this.checkSocket(type, name, flag); // 스테이터스 확인 끝나면 소켓 확인
	}
	
	async checkSocket(type: number, name: string, flag: number): Promise<Socket> {
		if (this.gameQ[type].getCount() < 2)
			return null;
		const socket = await this.channelService.findSocketByName(name); // 소켓 찾기
		if (socket === null) {
			if (flag === 1)
				this.gameQ[type].deQueue();
			else
				this.gameQ[type].deQueueSecond();
			this.checkSocket(type, this.gameQ[type].peek(flag), flag); // 재귀
		}
		return socket; // 소켓이 있을 때 소켓 반환
	}

	@SubscribeMessage('invite') // 채널 리스트 or 친구 중 상태가 online인 사람만 초대할 수 있게 버튼이 떠야함
	async inviteGame(@MessageBody() data: {type: number, invitee: string}, @ConnectedSocket() socket: Socket) {
		// 게임 종류랑 초대할 사람 담아서 보내주기
		const inviteeSocket = await this.channelService.findSocketByName(data.invitee); // 초대 당한 애 소켓 찾기
		const gameType = data.type;
		const inviter = socket.data.nickname;
		inviteeSocket.emit("invite", {gameType, inviter}) // 초대된 게임타입, 초대자 이름 초대 받은 애한테 보내주기
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.WAIT); // 초대한 애는 wait으로 바꾸기
	}

	@SubscribeMessage('inviteAccept') // 초대 수락 버튼 누름
	async startGame(@MessageBody() data: {type: number, inviterName: string}, @ConnectedSocket() socket: Socket) {
		const {status} = await this.memberRepository.getStatus(data.inviterName); // 초대자 상태 확인
		const inviter = await this.channelService.findSocketByName(data.inviterName); // 초대자 소켓 찾기
		if (status !== MemberConstants.WAIT || inviter === null) { // 웨잇 아니면, 소켓 못찾으면
			socket.emit("lost", data.inviterName); // 초대자가 연결이 끊김. (로그아웃 등등) 잃어버렸음을 알려줌
			return ;
		}
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);
		this.memberRepository.updateStatus(data.inviterName, MemberConstants.INGAME);
		socket.emit("startGame", new GameInfoDto(data.type, data.inviterName, socket.data.nickname));
		inviter.emit("startGame", new GameInfoDto(data.type, data.inviterName, socket.data.nickname));
	}

	@SubscribeMessage('inviteReject') // 거절 버튼 누름
	async rejectGame(@MessageBody() inviterName: string, @ConnectedSocket() socket: Socket) {
		const inviter = await this.channelService.findSocketByName(inviterName);
		if (inviter === null)
			return ; // 초대자 사라지면 암것도 안함. 접속 끊기면서 offline 처리 됐겠지;
		this.memberRepository.updateStatus(inviterName, MemberConstants.ONLINE);
		inviter.emit("rejectedGame", socket.data.nickname); // 초대자에게 게임 거절 당함 알려줌
	}

	@SubscribeMessage('spectator') // 채널 리스트 or 친구 중 상태가 ingame인 사람만 관전 버튼이 떠야함
	watchGame(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
		this.memberRepository.updateStatus(socket.data.nickname, MemberConstants.INGAME);
		// 요 사이에 넘겨받은 roomid로 바꿔주는 작업 필요 chatsungkim아 알려줘
		socket.emit("startWatch", roomId); // 이제 이거 보내면 프론트 게임 화면으로 옮겨?? 줘??
	}

	updateGameResult(result: GameResultDto): void { // api로 할지 소켓으로 할지 
		this.memberService.updateWinGameResult(result.winner, result.type, result.winScore, result.loser); // 위너 게임 결과 기록
		this.memberService.updateLoseGameResult(result.loser, result.type); // 루저 게임 결과 기록
		this.gameRepository.createHistory(result.winner, result.loser, result.winScore, result.loseScore, true, result.type); // 게임 결과 디비 저장
		this.gameRepository.createHistory(result.loser, result.winner, result.loseScore, result.winScore, false, result.type); // 게임 결과 디비 저장
		this.memberRepository.updateStatus(result.winner, MemberConstants.ONLINE); // 인게임->온라인
		this.memberRepository.updateStatus(result.loser, MemberConstants.ONLINE); // 인게임->온라인
	}

}