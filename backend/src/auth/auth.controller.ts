import { Controller, Get, Post, UseGuards, Query, Body, InternalServerErrorException, UnauthorizedException, ConflictException, Session } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiTags, ApiBearerAuth, ApiQuery, ApiTooManyRequestsResponse, ApiInternalServerErrorResponse, ApiConflictResponse } from '@nestjs/swagger';
import { Payload } from './decorators/payload';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshAuthGuard } from './guards/jwt.refresh.guard';
import { JwtLimitedAuthGuard } from './guards/jwt.limited.guard';
import { AuthService } from './auth.service';
import { JwtTokenDTO } from './dto/jwt.dto';
import { MemberRepository } from '../member/member.repository';
import { IssueJwtTokenDTO } from './dto/issue.jwt';
import { IssueAccessTokenDTO } from './dto/issue.access.token';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly memberRepository: MemberRepository,
	) { }

	@ApiOperation({
		summary: '42 OAuth callback url',
		description: '42 OAuth will be redirected here.',
	})
	@ApiQuery({
		name: 'code',
		description: 'Code received from 42 API.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description:
			'(1) { limitedToken: ___ } Two-factor authentication is needed. \
			(2) { accessToken: ___, refreshToken: ___ } JWT token issued successfully. Login completed.',
	})
	@ApiUnauthorizedResponse({
		description:
			'[Limited Token] Not a registered member yet. Redirect to signup page.',
	})
	@ApiTooManyRequestsResponse({
		description: 'Too many requests in a given amount of time(2 per second).',
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error.',
	})
	@Get('callback')
	async ft_login(@Query('code') code: string): Promise<any> {
		try {
			const info = await this.authService.getMemberInfo(code);
			if (info.member.twoFactor)
				return { limitedToken: info.token };
			else {
				await this.authService.login(info.member.name);
				return await this.authService.issueJwtTokens(info.member.name);
			}
		} catch (err) {
			const intraId = (err as Error).message;
			const token = await this.authService.issueLimitedAccessToken(intraId);
			throw new UnauthorizedException(`${token}`);
		}
	}

	@ApiOperation({
		summary: 'Two-factor authentication sending code for signup',
		description: 'Send two-factor authentication code by e-mail.',
	})
	@ApiOkResponse({
		description:
			'Two-factor authentication code has been sent.',
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid limited jwt token',
	})
	@ApiInternalServerErrorResponse({
		description:
			'Two-factor authentication code has failed to be sent.',
	})
	@ApiBearerAuth()
	@Post('/signup/tfa-send')
	@UseGuards(JwtLimitedAuthGuard)
	async sendTfaCodeForSignUp(@Body() body: { email: string }, @Session() session: { code?: string }): Promise<void> {
		session.code = await this.authService.sendTfaCodeForSignUp(body.email);
		if (session.code === "")
			throw new InternalServerErrorException('Failed to send tfa code.');
	}

	@ApiOperation({
		summary: 'Two-factor authentication sending code for signin',
		description: 'Send two-factor authentication code by e-mail.',
	})
	@ApiOkResponse({
		description:
			'Two-factor authentication code has been sent.',
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid limited jwt token',
	})
	@ApiInternalServerErrorResponse({
		description:
			'Two-factor authentication code has failed to be sent.',
	})
	@ApiBearerAuth()
	@Post('/signin/tfa-send')
	@UseGuards(JwtLimitedAuthGuard)
	async sendTfaCodeForSignIn(@Payload() payload: JwtTokenDTO): Promise<void> {
		const member = await this.memberRepository.getMemberInfo(payload.userName);
		const result = await this.authService.sendTfaCodeForSignIn(member.name, member.email);
		if (!result)
			throw new InternalServerErrorException('Failed to send tfa code.');
	}

	@ApiOperation({
		summary: 'Two-factor authentication',
		description: 'Verify two-factor authentication code sent by e-mail.',
	})
	@ApiQuery({
		name: 'code',
		description: 'Two-factor authentication code validate for 3 minutes.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description:
			'Two-factor authentication code has been verified. Temporary JWT token for signup issued.',
	})
	@ApiConflictResponse({
		description:
			'Two-factor authentication code does not match.',
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Unauthorized] The limited jwt token is invalid. \
			(2) [The code has been expired.] Two-factor authentication code has been expired.',
	})
	@ApiBearerAuth()
	@Get('/signup/tfa-verify')
	@UseGuards(JwtLimitedAuthGuard)
	async verifyTfaCodeForSignUp(@Payload() payload: JwtTokenDTO, @Query('code') code: string, @Session() session: { code?: string }): Promise<any> {
		const match = this.authService.verifyTfaCodeForSignUp(session.code, code);
		if (!match)
			throw new ConflictException('Two-factor authentication code does not match.');
		const token = await this.authService.issueSignUpAccessToken(payload.userName);
		return { limitedToken: token };
	}

	@ApiOperation({
		summary: 'Two-factor authentication',
		description: 'Verify two-factor authentication code sent by e-mail.',
	})
	@ApiQuery({
		name: 'code',
		description: 'Two-factor authentication code validate for 3 minutes.',
		required: true,
		type: String
	})
	@ApiOkResponse({
		description:
			'Two-factor authentication code has been verified. JWT token is issued.',
	})
	@ApiConflictResponse({
		description:
			'Two-factor authentication code does not match.',
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Unauthorized] The limited jwt token is invalid. \
			(2) [The code has been expired.] Two-factor authentication code has been expired.',
	})
	@ApiBearerAuth()
	@Get('/signin/tfa-verify')
	@UseGuards(JwtLimitedAuthGuard)
	async verifyTfaCodeForSignIn(@Query('code') code: string, @Payload() payload: JwtTokenDTO): Promise<IssueJwtTokenDTO> {
		const match = await this.authService.verifyTfaCodeForSignIn(payload.userName, code);
		if (!match)
			throw new ConflictException('Two-factor authentication code does not match.');
		else
			return await this.authService.issueJwtTokens(payload.userName);
	}

	@ApiOperation({
		summary: 'JWT Access Token verification',
		description: 'Login if access token is validate.',
	})
	@ApiOkResponse({
		description:
			'JWT access token verified. Login has been successful.',
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('jwt-verify')
	@UseGuards(JwtAuthGuard)
	async verifyAccessToken(
		@Payload() payload: any
	): Promise<void> {
		await this.authService.login(payload['sub']);
	}

	@ApiOperation({
		summary: 'JWT refresh',
		description: 'Refresh access token.',
	})
	@ApiOkResponse({
		description:
			'JWT access token reissued successfully.',
	})
	@ApiUnauthorizedResponse({
		description:
			'JWT refresh token is invalid.',
	})
	@ApiBearerAuth()
	@Get('jwt-refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshJwtToken(
		@Payload() payload: JwtTokenDTO,
	): Promise<IssueAccessTokenDTO> {
		const token = await this.authService.issueAccessToken(payload.userName);
		return { accessToken: token };
	}

	@ApiOperation({
		summary: 'logout',
		description: 'Member status changed to be offline.',
	})
	@ApiOkResponse({
		description: 'Logout has been successful.',
	})
	@ApiUnauthorizedResponse({
		description:
			'(1) [Invalid access token] Redirect to 42 login. \
			(2) [Expired access token] Refresh the access token.',
	})
	@ApiBearerAuth()
	@Get('logout')
	@UseGuards(JwtAuthGuard)
	async logout(@Payload() payload: any): Promise<void> {
		await this.authService.logout(payload['sub']);
	}
}


