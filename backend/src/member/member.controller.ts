import { Body, ConflictException, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberGameInfoDto } from './dto/memberGameInfo.dto';
import { MemberGameHistoryDto } from './dto/memberGameHistory.dto';
import { memberProfileDto } from './dto/memberProfile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { Payload } from 'src/auth/decorators/payload';
import { JwtSignUpAuthGuard } from 'src/auth/guards/jwt.signup.guard';
import { IssueJwtTokenDTO } from 'src/auth/dto/issue.jwt';
import { JwtTokenDTO } from '../auth/dto/jwt.dto';
import { JwtLimitedAuthGuard } from 'src/auth/guards/jwt.limited.guard';

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
	async createMember(@Payload() payload: JwtTokenDTO, @Body(new ValidationPipe()) memberInfo: CreateMemberDto): Promise<IssueJwtTokenDTO> {
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
		description: 'Check whether the given name is available or not',
		type: Boolean
	})
	@ApiBadRequestResponse({
		description: "The name doesn't match with regular expression \'/^[a-zA-Z0-9]{2,16}$/\'."
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid limited jwt token',
	})
	@ApiBearerAuth()
	@Get('checkName')
	@UseGuards(JwtLimitedAuthGuard)
	async checkName(@Query('name') name: string): Promise<boolean> {
		const check = await this.memberService.checkName(name);
		if (check)
			return false;
		return true;
	}

	@ApiOperation({
		summary: 'Get login member name.',
		description: 'Returns the name of the member.'
	})
	@ApiOkResponse({
		description: 'The profile information for the authenticated member information.',
		type: String
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get()
	@UseGuards(JwtAuthGuard)
	async getMyInfo(@Payload() payload: any): Promise<string> {
		return payload['sub'];
	}

	@ApiOperation({
		summary: 'Get member information.',
		description: 'It gets a member information.'
	})
	@ApiQuery({
		name: 'name',
		description: 'The name that the member wants to know',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The profile information for the given name',
		type: memberProfileDto
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with the given name.'
	})
	@ApiBearerAuth()
	@Get('profile')
	@UseGuards(JwtAuthGuard)
	async getUserInfo(@Payload() payload: any, @Query('userName') userName: string): Promise<memberProfileDto> {
		return await this.memberService.getMemberInfo(payload['sub'], userName);
	}

	@ApiOperation({
		summary: 'Update the member status',
		description: 'It updates status based on the member connection status.'
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
	@ApiBearerAuth()
	@Post('status/:status')
	@UseGuards(JwtAuthGuard)
	async updateStatus(@Payload() payload: any, @Param('status', ParseIntPipe) status: number): Promise<void> {
		await this.memberRepository.updateStatus(payload['sub'], status);
	}

	@ApiOperation({
		summary: 'Get member\'s game history.',
		description: 'It gets member\'s game history what sorted in aescending order of created time. '
	})
	@ApiQuery({
		name: 'name',
		description: 'The name of the member that the requester wants to know the history.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'The game history for the authenticated member.',
		type: MemberGameHistoryDto,
		isArray: true
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with given name.'
	})
	@ApiBearerAuth()
	@Get('history')
	@UseGuards(JwtAuthGuard)
	async getGameHistory(@Query('name') name: string): Promise<MemberGameHistoryDto[]> {
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
	async deleteMember(@Param('name') name: string): Promise<void> {
		return await this.memberRepository.deleteMember(name);
	}

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
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiConflictResponse({
		description: 'The member has already been added as a friend.'
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with the given name.'
	})
	@ApiBearerAuth()
	@Post('friend/:friendName')
	@UseGuards(JwtAuthGuard)
	async addFriend(@Payload() payload: any, @Param('friendName') friendName: string): Promise<void> {
		const name = payload['sub']
		if (await this.memberRepository.isFriend(name, friendName))
			throw new ConflictException();
		return await this.memberRepository.addFriend(payload['sub'], friendName);
	}

	@ApiOperation({
		summary: 'get member\'s all friends',
		description: 'It gets member\'s all friends information.'
	})
	@ApiOkResponse({
		description: 'The friends list of the authenticated member.',
		type: memberProfileDto,
		isArray: true
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('friend')
	@UseGuards(JwtAuthGuard)
	async getAllFriends(@Payload() payload: any): Promise<memberProfileDto[]> {
		return await this.memberRepository.findAllFriends(payload['sub']);
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
	async deleteFriend(@Payload() payload: any, @Param('friendName') friendName: string): Promise<void> {
		return await this.memberRepository.deleteFriend(payload['sub'], friendName);
	}

	@ApiOperation({
		summary: 'Add a black member',
		description: 'It adds a black list to the requester.'
	})
	@ApiParam({
		name: 'blackName',
		description: 'The name of the member that the requester wants to add as a black list member',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Add a black member successfully.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiConflictResponse({
		description: 'The member has already been added as a black list member.'
	})
	@ApiNotFoundResponse({
		description: 'There is no such member with the given name.'
	})
	@ApiBearerAuth()
	@Post('black/:blackName')
	@UseGuards(JwtAuthGuard)
	async addBlackList(@Payload() payload: any, @Param('blackName') blackName: string): Promise<void> {
		const name = payload['sub']
		if (await this.memberRepository.isBlack(name, blackName))
			throw new ConflictException();
		return await this.memberRepository.addBlackList(payload['sub'], blackName);
	}

	@ApiOperation({
		summary: 'get member\'s black list',
		description: 'It gets member\'s black list.'
	})
	@ApiOkResponse({
		description: 'The black list of the authenticated member.',
		type: String,
		isArray: true
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('black')
	@UseGuards(JwtAuthGuard)
	async getAllBlackList(@Payload() payload: any): Promise<string[]> {
		return this.memberRepository.getBlackList(payload['sub']);
	}

	@ApiOperation({
		summary: 'Delete a black',
		description: 'It deletes a black from the requester.'
	})
	@ApiParam({
		name: 'blackName',
		description: 'The name of the member that the requester deletes from black.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description: 'Delete a black successfully.'
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Delete('black/:blackName')
	@UseGuards(JwtAuthGuard)
	async deleteBlackList(@Payload() payload: any, @Param('blackName') blackName: string): Promise<void> {
		return await this.memberRepository.deleteBlackList(payload['sub'], blackName);
	}
}
