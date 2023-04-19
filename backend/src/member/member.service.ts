import { Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { CreateMemberDto } from './dto/create-member.dto/create-member.dto';

@Injectable()
export class MemberService {
	constructor(private memberRepository: MemberRepository){};

	async createMember(memberInfo: CreateMemberDto) {
		return await this.memberRepository.createMember(memberInfo);
	}

	findOneByIntraId(intraId: string) {
		return this.memberRepository.findOneByIntraId(intraId);
	}

	async addFriend(ownerIntra: string, friendIntra: string) { // 토큰으로 찾는 방식으로 변경
		return await this.memberRepository.addFriend(ownerIntra, friendIntra);
	}
}
