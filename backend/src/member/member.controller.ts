import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';
import { FriendProfile } from './dto/friendProfile.dto';
import { MemberRepository } from './member.repository';

@Controller('member')
export class MemberController {
	constructor(
		private readonly memberService: MemberService,
		private memberRepository: MemberRepository,
	) {};

	@Post('member')
	createMember(@Body() memberInfo: CreateMemberDto): Promise<string> {
		return this.memberRepository.createMember(memberInfo);
	}

	@Get('member')
	async getMemberInfo(@Query('name') name: string): Promise<MemberProfileDto> {
		return await this.memberService.getMemberInfo(name);
	}

	@Get('intraId')
	async getMemberByIntraId(@Query('intraId') intraId: string): Promise<string> {
		return this.memberService.findOneByIntraId(intraId);
	} // 인트라 아이디로 멤버 여부 검색 시 돌려줄 값 협의 필요

	@Post('status/:name/:status')
	async updateStatus(@Param('name') name: string, @Param('status', ParseIntPipe) status: number): Promise<void> {
		await this.memberRepository.updateStatus(name, status);
	}

	@Post('score/:name/:result')
	async updateGameScore(@Param('name') name: string, @Param('result', ParseBoolPipe) result: boolean): Promise<void> {
		await this.memberService.updateGameScore(name, result);
	}

	@Delete('member/:name')
	async deleteMember(@Param('name') name: string): Promise<void> {
		return await this.memberRepository.deleteMember(name);
	}

	@Post('friend/:name/:friendName')
	async addFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.addFriend(name, friendName);
	}

	@Get('friend')
	async findOneFriend(@Query('name') name: string, @Query('friendName') friendName: string): Promise<FriendProfile[]> {
		return await this.memberRepository.findOneFriend(name, friendName);
	}

	@Get('friend/all')
	async findAllFriend(@Query('name') name: string): Promise<any> {
		return await this.memberRepository.findAllFriend(name);
	}

	@Delete('friend/:name/:friendName')
	async deleteFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.deleteFriend(name, friendName);
	}
}
