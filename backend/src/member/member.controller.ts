import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberProfileDto } from './dto/memberProfile.dto';
import { MemberGameInfoDto } from './dto/memberGameInfo.dto';
import { MemberGameHistoryDto } from './dto/memberGameHistory.dto';
import { ChUserProfileDto } from './dto/chUserProfile.dto';
import { FriendProfileDto } from './dto/friendProfile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { Payload } from 'src/auth/decorators/payload';
import { JwtSignUpAuthGuard } from 'src/auth/guards/jwt.signup.guard';

@ApiTags("Member")
@Controller('member')
export class MemberController {
	constructor(
		private readonly memberService: MemberService,
		private memberRepository: MemberRepository,
		private readonly authService: AuthService,
	) { };

	@ApiOperation({
		summary: 'Create a member',
		description: 'Create a member with information. \
					Except \'CreateMemberDto\' information, all other columns of the member are initialized to their default values. \
					JWT token has been issued and login has been automatically completed.'
	})
	@ApiBody({
		description: 'The information of the user to be made into a member.',
		required: true,
		type: CreateMemberDto
	})
	@ApiCreatedResponse({
		description: `A member has been created successfully.`,
		type: String
	})
	@ApiConflictResponse({
		description: 'There is a member with the same Intra Id.'
	})
	@ApiUnauthorizedResponse({
		description: '(1) [Unauthorized] Invalid limited jwt token is used. Redirect to 42 login page. \
					(2) [token] Two-factor authentication is needed. Redirect to tfa page.',
	})
	@ApiBearerAuth()
	@Post()
	@UseGuards(JwtSignUpAuthGuard)
	async createMember(@Payload() payload: any, @Body() memberInfo: CreateMemberDto): Promise<{ accessToken: string, refreshToken: string }> {
		memberInfo.intraId = payload.userName;
		await this.memberRepository.createMember(memberInfo);
		await this.authService.login(memberInfo.name);
		return await this.authService.issueJwtTokens(memberInfo.name);
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
	@ApiBadRequestResponse({
		description: "The name don't match with regualr express \'/^[a-zA-Z0-9]{2,16}$/\'."
	})
	@Get('checkName')
	async checkName(@Query('name') name: string): Promise<boolean> {
		const check = await this.memberService.checkName(name);
		if (check)
			return false;
		return true;
	}

	@ApiOperation({
		summary: 'Get the member information by name',
		description: 'It returns the currently authenticated member\'s own profile information.'
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member.',
		type: MemberProfileDto
	})
	@ApiBearerAuth()
	@Get()
	@UseGuards(JwtAuthGuard)
	async getMemberInfo(@Req() req: Request): Promise<MemberProfileDto> {
		return await this.memberRepository.getMemberInfo(req.user['sub']);
	}

	@ApiOperation({
		summary: 'Update the member status',
		description: 'It updates status based on the member connection status.'
	})
	@ApiParam({
		name: 'status',
		description: 'The current status of the member.',
		required: true,
		type: Number
	})
	@ApiOkResponse({
		description: 'Update the member status successfully.'
	})
	@ApiBearerAuth()
	@Post('status/:status')
	@UseGuards(JwtAuthGuard)
	async updateStatus(@Req() req: Request, @Param('status', ParseIntPipe) status: number): Promise<void> {
		await this.memberRepository.updateStatus(req.user['sub'], status);
	}

	@ApiOperation({
		summary: 'Get member\'s game history.',
		description: 'It gets member\'s game history what sorted in aescending order of created time. '
	})
	@ApiParam({
		name: 'name',
		description: 'The name of the member that the requester wants to know the history.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member.',
		type: MemberGameHistoryDto
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with given name.'
	})
	@ApiBearerAuth()
	@Get('history')
	@UseGuards(JwtAuthGuard)
	async getGameHistory(@Req() req: Request, @Query('name') name: string): Promise<MemberGameHistoryDto> {
		return await this.memberService.getMemberHistory(name);
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
	@ApiBearerAuth()
	@Get('ranking')
	@UseGuards(JwtAuthGuard)
	getRangkingInfo(): Promise<MemberGameInfoDto[]> {
		return this.memberRepository.getRankingInfo();
	}

	@ApiOperation({
		summary: 'Delete a member',
		description: 'It deletes a member.'
	})
	@ApiParam({
		name: 'name',
		description: 'The name of the member that the requester wants to delete',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Delete a member successfully.'
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with the given name.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Delete('/:name')
	@UseGuards(JwtAuthGuard)
	async deleteMember(@Req() req: Request, @Param('name') name: string): Promise<void> {
		return await this.memberRepository.deleteMember(name);
	}

	@ApiOperation({
		summary: 'Get channel user information.',
		description: 'It gets a channel user information.'
	})
	@ApiBody({
		description: 'List of the channel user names.',
		required: true,
		type: String,
		isArray: true
	})
	@ApiOkResponse({
		description: 'List of the channel users information.',
		type: ChUserProfileDto,
		isArray: true
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('chUser')
	@UseGuards(JwtAuthGuard)
	async getChUserInfo(@Req() req: Request, @Body() data: { chUsers: string[] }): Promise<ChUserProfileDto[]> {
		let ret: ChUserProfileDto[] = [];
		for (let i = 0; i < data.chUsers.length; i++) {
			const chUserInfo = await this.memberService.getChUserInfo(req.user['sub'], data.chUsers[i]);
			if (!chUserInfo)
				continue;
			ret.push(chUserInfo);
		}
		return ret;
	} // 프론트: 따로 이름 솔팅은 하지 않고 있는데 필요한지 확인, 없는 멤버일 경우 걍 건너뜀 에러 반환 안함.

	@ApiOperation({
		summary: 'Add a friend',
		description: 'It adds a friend to the requester.'
	})
	@ApiParam({
		name: 'friendName',
		description: 'The name of the member that the requester wants to add as a friend',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Add a friend successfully.'
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with the given name.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Post('friend/:friendName')
	@UseGuards(JwtAuthGuard)
	async addFriend(@Req() req: Request, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.addFriend(req.user['sub'], friendName);
	}

	@ApiOperation({
		summary: 'Get a friend information',
		description: 'It returns one friend\'s information'
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
	@ApiNotFoundResponse({
		description: 'There is no such friend with the given name.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('friend')
	@UseGuards(JwtAuthGuard)
	async findOneFriend(@Req() req: Request, @Query('friendName') friendName: string): Promise<FriendProfileDto> {
		const friend = await this.memberRepository.findOneFriend(req.user['sub'], friendName);
		if (friend === undefined)
			throw new NotFoundException(`There is no friend with name ${friendName}.`);
		return friend;
	}

	@ApiOperation({
		summary: 'Get all friends information',
		description: 'It returns all friends information sorted in ascending alphabetical order of name.'
	})
	@ApiOkResponse({
		description: 'The requester\'s all friends information.',
		type: FriendProfileDto,
		isArray: true
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('friend/all')
	@UseGuards(JwtAuthGuard)
	async findAllFriends(@Req() req: Request): Promise<FriendProfileDto[]> {
		return await this.memberRepository.findAllFriends(req.user['sub']);
	}

	@ApiOperation({
		summary: 'Delete a friend',
		description: 'It deletes a friend from the requester.'
	})
	@ApiParam({
		name: 'friendName',
		description: 'The name of the member that the requester deletes from friend.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Delete a friend successfully.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Delete('friend/:friendName')
	@UseGuards(JwtAuthGuard)
	async deleteFriend(@Req() req: Request, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.deleteFriend(req.user['sub'], friendName);
	}
}
