import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';
import { MemberGameInfoDto } from './dto/memberGameInfo.dto';
import { MemberGameHistoryDto } from './dto/memberGameHistory.dto';
import { ChUserProfileDto } from './dto/chUserProfile.dto';
import { FriendProfileDto } from './dto/friendProfile.dto';

@ApiTags("Member")
@Controller('member')
export class MemberController {
	constructor(
		private readonly memberService: MemberService,
		private memberRepository: MemberRepository,
	) { };

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
		description: `Member created successfully.`,
		type: String
	})
	@ApiBadRequestResponse({
		description: 'There is a member with the same Intra Id.'
	})
	@Post()
	createMember(@Body() memberInfo: CreateMemberDto): Promise<string> {
		return this.memberRepository.createMember(memberInfo);
	}

	@ApiOperation({
		summary: 'Check for duplicate name.',
		description: 'Checks whether a user-entered name is duplicated or not. \
			Returns true if there is no member with the given name, \
			and false if there is already a member with the same name.'
	})
	@ApiQuery({
		name: 'name',
		description: 'The name that the user wants to use',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Whether the given name is available or not',
		type: Boolean
	})
	@Get('checkName')
	async checkDuplicateName(@Query('name') name: string): Promise<boolean> {
		const check = await this.memberRepository.checkDuplicateName(name);
		if (check)
			return false;
		return true;
	}

	@ApiOperation({
		summary: 'Get the member information by name',
		description: 'It returns the currently authenticated member\'s own profile information.'
	})
	@ApiQuery({
		name: 'name',
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member.',
		type: MemberProfileDto
	})
	@Get()
	async getMemberInfo(@Query('name') name: string): Promise<MemberProfileDto> {
		return await this.memberRepository.getMemberInfo(name);
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
		summary: 'Get member\'s game history.',
		description: 'It gets member\'s game history what sorted in aescending order of created time. '
	})
	@ApiQuery({
		name: 'name',
		description: 'The member name.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member.',
		type: MemberGameHistoryDto,
		isArray: true
	})
	@Get('history')
	async getGameHistory(@Query('name') name: string): Promise<MemberGameHistoryDto[]> {
		return await this.memberRepository.getMemberHistory(name);
	}

	@ApiOperation({
		summary: 'Get ranking information.',
		description: 'It brings game ranking information of all members. \
			They are sorted in descending order of level. \
			If the levels are the same, they are sorted in ascending alphabetical order of name.'
	})
	@ApiOkResponse({
		description: 'Get ranking information successfully.',
		type: MemberGameInfoDto,
		isArray: true
	})
	@ApiBadRequestResponse({
		description: 'There is no member.'
	})
	@Get('ranking')
	getRangkingInfo(): Promise<MemberGameInfoDto[]> {
		const ranking = this.memberRepository.getRankingInfo();
		if (!ranking)
			throw new BadRequestException(`There is no member.`);
		return ranking;
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
	@ApiBadRequestResponse({
		description: 'There is no such member with the given name.'
	})
	@Delete('/:name')
	async deleteMember(@Param('name') name: string): Promise<void> {
		return await this.memberRepository.deleteMember(name);
	}

	@ApiOperation({
		summary: 'Get channel user information.',
		description: 'It gets a channel user information.'
	})
	@ApiQuery({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	// @ApiBody({
	// 	description: 'List of the channel user names.',
	// 	required: true,

	// 	examples: {

	// 	}

	// })
	@ApiOkResponse({
		description: 'List of the channel users information.',
		type: ChUserProfileDto,
		isArray: true
	})
	@Get('chUser')
	async getChUserInfo(@Body() data: { name: string, chUsers: string[] }): Promise<ChUserProfileDto[]> {
		let ret: ChUserProfileDto[] = [];
		for (let i = 0; i < data.chUsers.length; i++) {
			const chUserInfo = await this.memberService.getChUserInfo(data.name, data.chUsers[i]);
			if (!chUserInfo)
				continue;
			ret.push(chUserInfo);
		}
		return ret;
	} // 프론트: 따로 이름 솔팅은 하지 않고 있는데 필요한지 확인

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
	@ApiBadRequestResponse({
		description: 'There is no such member with the given name.'
	})
	@Post('friend/:name/:friendName')
	async addFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.addFriend(name, friendName);
	} // 프론트: 배열로 받아서 한꺼번에 여러명을 삭제 해줘야 하는지 확인 필요.

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
	@ApiOkResponse({
		description: 'The requester\'s friend information.',
		type: FriendProfileDto
	})
	@Get('friend')
	async findOneFriend(@Query('name') name: string, @Query('friendName') friendName: string): Promise<FriendProfileDto[]> {
		return await this.memberRepository.findOneFriend(name, friendName);
	}

	@ApiOperation({
		summary: 'Get all friends information',
		description: 'It returns all friends information sorted in ascending alphabetical order of name.'
	})
	@ApiQuery({
		name: 'name',
		description: 'The requester name.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The requester\'s all friends information.',
		type: FriendProfileDto,
		isArray: true
	})
	@Get('friend/all')
	async findAllFriends(@Query('name') name: string): Promise<FriendProfileDto[]> {
		return await this.memberRepository.findAllFriends(name);
	}

	@ApiOperation({
		summary: 'Delete a friend',
		description: 'It deletes a friend from the requester.'
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
	@ApiResponse({
		description: 'Delete a friend successfully.'
	})
	@Delete('friend/:name/:friendName')
	async deleteFriend(@Param('name') name: string, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.deleteFriend(name, friendName);
	} // 프론트: 배열로 받아서 한꺼번에 여러명을 삭제 해줘야 하는지 확인 필요.
}
