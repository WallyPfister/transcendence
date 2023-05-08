import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MemberConstants } from './memberConstants';
import { MemberRepository } from './member.repository';
import { LoginMemberDTO } from 'src/auth/dto/member.login.dto';
import { userProfileDto } from './dto/userProfile.dto';
import { MemberGameInfoDto } from './dto/memberGameInfo.dto';
import { MemberGameHistoryDto } from './dto/memberGameHistory.dto';
import { matches } from 'class-validator';

@Injectable()
export class MemberService {
	constructor(private memberRepository: MemberRepository) { }

	async checkName(name: string): Promise<{ name: string }> {
		const regex = /^[a-zA-Z0-9]{2,16}$/;
		const check = matches(name, regex);
		console.log(check);
		if (!check)
			throw new BadRequestException();
		return await this.memberRepository.checkDuplicateName(name);
	}

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

	async updateScoreAndLevel(member: MemberGameInfoDto, gameScore: number): Promise<MemberGameInfoDto> {
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

	async getChUserInfo(name: string, userName: string): Promise<userProfileDto> {
		const user: userProfileDto = await this.memberRepository.getChUserInfo(userName);
		if (!user)
			throw new BadRequestException();
		user.name = userName;
		if (name === userName)
			user.whois = 0;
		else {
			const isFriend = await this.memberRepository.isFriend(name, userName);
			if (isFriend.length !== 0)
				user.whois = 1;
			else
				user.whois = 2;
		}
		return user;
	}

	async getMemberHistory(name: string): Promise<MemberGameHistoryDto> {
		const history = await this.memberRepository.getMemberHistory(name);
		if (history === null)
			throw new NotFoundException(`There is no such member with name ${name}.`);
		if (history.length === 0)
			return null;
		const month = (history[0].date.getMonth() + 1).toString();
		const day = history[0].date.getDate().toString();
		history[0].time = month.padStart(2, '0')  + '.' + day.padStart(2, '0') ;
		return history[0];
	}
}
