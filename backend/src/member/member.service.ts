import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MemberConstants } from './memberConstants';
import { MemberRepository } from './member.repository';
import { LoginMemberDTO } from 'src/auth/dto/member.login';
import { ChUserProfileDto } from './dto/chUserProfile.dto';
import { MemberGameInfoDto } from './dto/memberGameInfo.dto';

@Injectable()
export class MemberService {
	constructor(private memberRepository: MemberRepository) {}

	async findOneByIntraId(intraId: string): Promise<LoginMemberDTO> {
		const member = await this.memberRepository.findOneByIntraId(intraId);
		if (!member)
			throw new UnauthorizedException(`There is no member with Intra Id [${intraId}]`)
		return member;
	}

	async checkAchieve(member: MemberGameInfoDto, score: number, opponentLevel: number): Promise<number> {
		if (member.win === 5)
			member.achieve = member.achieve | MemberConstants.FIVEWIN;
		if (member.win === 10)
			member.achieve = member.achieve | MemberConstants.TENWIN;
		if (score === 3 && ((member.achieve & MemberConstants.PERFECTGAME) === 0))
			member.achieve = member.achieve | MemberConstants.PERFECTGAME;
		if ((opponentLevel - member.level > 3) && ((member.achieve & MemberConstants.BIGGAMEHUNTER) === 0))
			member.achieve = member.achieve | MemberConstants.BIGGAMEHUNTER;
		return member.achieve;
	}

	async updateScoreAndLevel(member: MemberGameInfoDto, gameScore: number): Promise<MemberGameInfoDto>  {
		member.score += gameScore;
		if (member.score < 0)
			member.score = 0;
		member.level = Math.floor(member.score / 10);
		return member;
	}

	async updateWinGameResult(name: string, type: number, gameScore: number, opponent: string): Promise<void> {
		let member = await this.memberRepository.getGameInfo(name);
		member.win += 1;
		if (type === 1)
			member = await this.updateScoreAndLevel(member, 5);
		const opponentLevel = (await this.memberRepository.getGameInfo(opponent)).level;
		member.achieve = await this.checkAchieve(member, gameScore, opponentLevel);	
		this.memberRepository.updateGameResult(member);
	}

	async updateLoseGameResult(name: string, type: number): Promise<void> {
		let member = await this.memberRepository.getGameInfo(name);
		member.lose += 1;
		if (type === 1)
			member = await this.updateScoreAndLevel(member, -3);
		this.memberRepository.updateGameResult(member);
	}

	async getChUserInfo(name: string, chUser: string): Promise<ChUserProfileDto> {
		const user: ChUserProfileDto = await this.memberRepository.getChUserInfo(chUser);
		if (!user)
			return null;
		console.log(user);
		const isFriend = await this.memberRepository.isFriend(name, chUser);
		user.name = chUser;
		if (isFriend.length !== 0)
			user.isFriend = true;
		else
			user.isFriend = false;
		return user;
	}
}
