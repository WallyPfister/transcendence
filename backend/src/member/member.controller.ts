import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';
import { FriendProfile } from './dto/friendProfile.dto';
import { MemberRepository } from './member.repository';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("Member")
@Controller('member')
export class MemberController {
	constructor(
		private readonly memberService: MemberService,
		private memberRepository: MemberRepository,
	) {};

	@ApiOperation({
		summary: 'Create a member',
		description: 'Create a member with information. \
					Except \'CreateMemberDto\' information, all other columns of the member are initialized to their default values.'
	})
	@ApiBody({ 
		description: 'The information of the user to be made into a member.',
		required: true,
		type: CreateMemberDto
	})
	@ApiCreatedResponse({
		description: `Member created successfully.`
	})
	@Post('member')
	createMember(@Body() memberInfo: CreateMemberDto): Promise<string> {
		return this.memberRepository.createMember(memberInfo);
	}

	@ApiOperation({
		summary: 'Get the member information by name',
		description: 'It returns the currently authenticated member\'s own profile information.'
	})
	@ApiQuery({
		name: 'name', // 나중에 accessToken으로 조회?
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member.',
		type: CreateMemberDto
	})
	@ApiNotFoundResponse({
		status: 404,
		description: 'Cannot find a memeber.'
	})
	@Get('member')
	async getMemberInfo(@Query('name') name: string): Promise<MemberProfileDto> {
		return await this.memberService.getMemberInfo(name);
	}

	@ApiOperation({
		summary: 'Update the member status',
		description: 'It updates status based on the member connection status.'
	})
	@ApiParam({
		name: 'name',
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiParam({
		name: 'status',
		description: 'The current status of the member',
		required: true,
		type: Number
	})
	@ApiOkResponse({
		description: 'Update the member status successfully.'
	})
	@Post('status/:name/:status')
	async updateStatus(@Param('name') name: string, @Param('status', ParseIntPipe) status: number): Promise<void> {
		await this.memberRepository.updateStatus(name, status);
	}

	@ApiOperation({
		summary: 'Update member ping game information',
		description: 'It updates member information related to the ping game. \
					When a member wins a game, the win column is incremented by 1 and the score column is incremented by 5. \
					Conversely, when a member loses a game, the lose column is incremented by 1 and the score column is decremented by 3. \
					The level column is the quotient obtained by dividing the score column by 10.'
	})
	@ApiParam({
		name: 'name',
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiParam({
		name: 'result',
		description: 'The game result of the member.',
		required: true,
		type: Boolean
	})
	@ApiOkResponse({
		description: 'Update the member status successfully.'
	})
	@Post('score/:name/:result')
	async updateGameScore(@Param('name') name: string, @Param('result', ParseBoolPipe) result: boolean): Promise<void> {
		await this.memberService.updateGameScore(name, result);
	}

	@ApiOperation({
		summary: 'Delete a member',
		description: 'It deletes a member.'
	})
	@ApiParam({
		name: 'name',
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Delete a member successfully.'
	})
	@Delete('member/:name')
	async deleteMember(@Param('name') name: string): Promise<void> {
		return await this.memberRepository.deleteMember(name);
	}

	@ApiOperation({
		summary: 'Add a friend',
		description: 'It adds a friend to the requester.'
	})
	@ApiParam({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	@ApiParam({
		name: 'friendName',
		description: 'The name of the member that the requester wants to add as a friend',
		required: true,
		type: String
	})
	@ApiResponse({
		description: 'Add a friend successfully.'
	})
	@Post('friend/:name/:friendName')
	async addFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.addFriend(name, friendName);
	}

	@ApiOperation({
		summary: 'Get a friend information',
		description: 'It returns one friend\'s information'
	})
	@ApiParam({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	@ApiParam({
		name: 'friendName',
		description: 'The name of the member that the requester wants to know',
		required: true,
		type: String
	})
	@Get('friend')
	async findOneFriend(@Query('name') name: string, @Query('friendName') friendName: string): Promise<FriendProfile[]> {
		return await this.memberRepository.findOneFriend(name, friendName);
	}

	@ApiOperation({
		summary: 'Get all friends information',
		description: 'It returns all friends\' informations.'
	})
	@ApiParam({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	@Get('friend/all')
	async findAllFriends(@Query('name') name: string): Promise<any> {
		return await this.memberRepository.findAllFriends(name);
	}

	@ApiOperation({
		summary: 'Delete a friend',
		description: 'It deletes a friend from the requester.',		
	})
	@ApiParam({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	@ApiParam({
		name: 'friendName',
		description: 'The name of the member that the requester deletes from friend.',
		required: true,
		type: String
	})
	@Delete('friend/:name/:friendName')
	async deleteFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.deleteFriend(name, friendName);
	}
}
