import { Injectable } from '@nestjs/common';
import { GameResultDto } from './dto/gameResult.dto';
import { MemberService } from 'src/member/member.service';
import { HistoryRepository } from './history.repository';
import { MemberRepository } from 'src/member/member.repository';
import { MemberConstants } from 'src/member/memberConstants';

@Injectable()
export class HistoryService {
	constructor(private historyRepository: HistoryRepository,
				private memberService: MemberService,
				private memberRepository: MemberRepository) {}

	updateGameResult(result: GameResultDto): void {
		this.memberService.updateWinGameResult(result.winner, result.type, result.winScore, result.loser);
		this.memberService.updateLoseGameResult(result.loser, result.type);
		this.historyRepository.createHistory(result.winner, result.loser, result.winScore, result.loseScore, true, result.type);
		this.historyRepository.createHistory(result.loser, result.winner, result.loseScore, result.winScore, false, result.type);
		this.memberRepository.updateStatus(result.winner, MemberConstants.ONLINE);
		this.memberRepository.updateStatus(result.loser, MemberConstants.ONLINE);
		// 관전자가 있을 경우 관전자의 스테이터스도 업데이트 쳐줘야 함
	}// 게임 컨트롤러로 옮겨야 할지 잘 모르겠음 감이 안 옴 히스토리말고 게임 리파지토리라고 해야하려나 프리즈마 스키마도 게임으로 바꾸고
}
