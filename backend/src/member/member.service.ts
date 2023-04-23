import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';
import { FriendProfile } from './dto/friendProfile.dto';

@Injectable()
export class MemberService {
	constructor(private memberRepository: MemberRepository){};

	// async createMember(memberInfo: CreateMemberDto): Promise<string> {
	// 	return await this.memberRepository.createMember(memberInfo);
	// }

	// async saveRefreshToken(name: string, refreshToken: string): Promise<boolean> {
	// 	return await this.memberRepository.updateRefreshToken(name, refreshToken);
	// }

	async getMemberInfo(name: string): Promise<MemberProfileDto> { // 향후 토큰으로 멤버 찾는 것으로 대체?
		const member: MemberProfileDto = await this.memberRepository.getMemberInfo(name);
		if (!member)
			throw new NotFoundException(`${name} 이름을 가진 멤버를 찾을 수 없습니다.`); // nestjs 에러 핸들러같은 것이 있는 지 확인 필요
			// notFound? conflict? badRequest?
		return member;
	}
	
	async findOneByIntraId(intraId: string): Promise<string> {
		const member = await this.memberRepository.findOneByIntraId(intraId);
		if (!member)
			throw new UnauthorizedException(`[${intraId}]: 가입되지 않은 회원입니다.`)
		return member;
	}

	// async updateStatus(name: string, status: number): Promise<void> {
	// 	this.memberRepository.updateStatus(name, status);
	// }
	
	async updateGameScore(name: string, result: boolean): Promise<void> {
		const member = await this.memberRepository.getMemberInfo(name);
		let win, lose, score, level: number;
		if (result) {
			win = member.win + 1;
			lose = member.lose;
			score = member.score + 5;
		} else {
			win = member.win;
			lose = member.lose + 1;
			score = member.score - 3;
		}
		level = Math.floor(score / 10);
		this.memberRepository.updateGameScore(name, win, lose, score, level);
	}

	async updateAchieve(name: string) {
		// 어떤 식으로 Achieve를 만들지?
	}

	// async deleteMember(name: string) {
	// 	return this.memberRepository.deleteMember(name);
	// }

	// async addFriend(name: string, friendName: string): Promise<any> {
	// 	return await this.memberRepository.addFriend(name, friendName);
	// }

	// async findOneFriend(name: string, friendName: string): Promise<FriendProfile[]> {
	// 	return await this.memberRepository.findOneFriend(name, friendName);
	// }

	// async findAllFriend(name: string): Promise<any> {
	// 	return await this.memberRepository.findAllFriend(name);
	// }

	// async deleteFriend(name: string, friendName: string): Promise<boolean> {
	// 	return this.memberRepository.deleteFriend(name, friendName);
	// }
}
