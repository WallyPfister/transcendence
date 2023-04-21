import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';

@Controller('member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {};

	@Post('member')
	createMember(@Body() memberInfo: CreateMemberDto): Promise<string> {
		return this.memberService.createMember(memberInfo);
	}

	@Get('member')
	async getMemberInfo(@Query('name') name: string): Promise<MemberProfileDto> {
		return await this.memberService.getMemberInfo(name);
	}

	@Get('intraId')
	async getMemberByIntraId(@Query('intraId') intraId: string): Promise<string> {
		return await this.memberService.findOneByIntraId(intraId);
	} // 인트라 아이디로 멤버 여부 검색 시 돌려줄 값 협의 필요

	@Post('status/:name/:status')
	async updateStatus(@Param('name') name: string, @Param('status', ParseIntPipe) status: number): Promise<void> {
		await this.memberService.updateStatus(name, status);
	}

	@Post('score/:name/:result')
	async updateGameScore(@Param('name') name: string, @Param('result', ParseBoolPipe) result: boolean): Promise<void> {
		await this.memberService.updateGameScore(name, result);
	}

	@Delete('member/:name')
	async deleteMember(@Param('name') name: string) {
		return await this.memberService.deleteMember(name);
	}

	@Post('friend/:name/:friendName')
	async addFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<boolean> {
		return await this.memberService.addFriend(name, friendName);
	}

	@Get('friend')
	async findOneFriend(@Query('name') name: string, @Query('friendName') friendName: string): Promise<any> {
		return await this.memberService.findOneFriend(name, friendName);
	}

	@Get('friend/all')
	async findAllFriend(@Query('name') name: string): Promise<any> {
		console.log(`name = ${name}`);
		const friend = this.memberService.findAllFriend(name);
		console.log(friend);
		return await friend;
	}

	@Delete('friend/:name/:friendName')
	async deleteFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<boolean> {
		return await this.memberService.deleteFriend(name, friendName);
	}
}
