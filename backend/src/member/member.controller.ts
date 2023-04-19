import { Body, Controller, Post, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto/create-member.dto';

@Controller('member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {};

	@Post('member')
	async createMember(@Body() memberInfo: CreateMemberDto) {
		return await this.memberService.createMember(memberInfo);
	}

	@Post('friend')
	addFriend(@Query('intraId') intraId: string, @Query('friendIntra') friendIntra: string) {
		this.memberService.addFriend(intraId, friendIntra);
	  }
}
