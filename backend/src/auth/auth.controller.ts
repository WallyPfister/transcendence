import {
	Controller,
	Get,
	UseGuards,
	Query,
	HttpException,
	Req,
	ForbiddenException
} from '@nestjs/common';
import { Request } from 'express';
import { Payload } from './decorators/payload';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshAuthGuard } from './guards/jwt.refresh.guard';
import { JwtLimitedAuthGuard } from './guards/jwt.limited.guard';
import { AuthService } from './auth.service';
import { RefreshJwtTokenDTO } from './dto/jwt.refresh.dto';
import { JwtTokenInfo } from '../utils/type';
import { JwtAccessTokenDTO } from './dto/jwt.access.dto';
import { ConfigService } from '@nestjs/config';
import { MemberRepository } from '../member/member.repository';
import {
	ApiOperation,
	ApiOkResponse,
	ApiUnauthorizedResponse,
	ApiForbiddenResponse,
	ApiTags,
	ApiBearerAuth,
	ApiQuery,
	ApiParam,
} from '@nestjs/swagger';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly config: ConfigService,
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
			'JWT token issued successfully. Redirect to homepage or tfa if checked.',
	})
	@ApiUnauthorizedResponse({
		description:
			'Not a registered member yet. Please redirect to signup page.',
	})
	@Get('callback')
	async ft_login(@Query() code: string): Promise<any> {
		// const token = await this.authService.getFortyTwoToken(code);
		// console.log(token);
		// const profile = this.authService.getFortyTwoProfile(token);
		// console.log(profile);
		// const intraId = profile.login;
		const intraId = 'sokim';
		const member = await this.memberRepository.findOneByIntraId(intraId);
		if (!member)
			throw new ForbiddenException(intraId);
		if (member.twoFactor) {
			const token = await this.authService.issueLimitedAccessToken(member.name);
			return { limitedToken: token }
		}
		const atoken = await this.authService.issueAccessToken(member.name, member.twoFactor);
		const rtoken = await this.authService.issueRefreshToken(member.name, member.twoFactor);
		return { accessToken: atoken, refreshToken: rtoken }
	}

	@ApiOperation({
		summary: 'Two-factor authentication sending code',
		description: 'Send two-factor authentication code by e-mail.',
	})
	@ApiOkResponse({
		description:
			'Two-factor authentication code has been sent.',
	})
	@ApiForbiddenResponse({
		description:
			'Two-factor authentication code has failed to be sent.',
	})
	@ApiBearerAuth()
	@Get('tfa-send')
	@UseGuards(JwtLimitedAuthGuard)
	async sendTwoFactorAuthCode(@Payload() payload: any): Promise<void> {
		const member = await this.memberRepository.getMemberInfo(payload.userName);
		const result = await this.authService.sendTfaCode(member.name, member.email);
		if (!result)
			throw new ForbiddenException('Failed to send tfa code.');
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
			'Two-factor authentication code has been verified.',
	})
	@ApiForbiddenResponse({
		description:
			'Two-factor authentication has failed.',
	})
	@ApiBearerAuth()
	@Get('tfa-verify')
	@UseGuards(JwtLimitedAuthGuard)
	async verifyTwoFactorAuthCode(@Query('code') code: string, @Payload() payload: any): Promise<void> {
		const match = await this.authService.verifyTfaCode(payload.userName, code);
		if (!match)
			throw new ForbiddenException('Two-factor authentication failed.');
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
			'JWT access token is not validate. Try 42 login again.',
	})
	@ApiBearerAuth()
	@Get('jwt-verify')
	@UseGuards(JwtAuthGuard)
	async verifyAccessToken(
		@Payload() payload: JwtAccessTokenDTO
	): Promise<any> { }

	@ApiOperation({
		summary: 'JWT refresh',
		description: 'Refresh JWT access token.',
	})
	@ApiOkResponse({
		description:
			'JWT access token reissued successfully.',
	})
	@ApiUnauthorizedResponse({
		description:
			'JWT refresh token is not validate.',
	})
	@ApiBearerAuth()
	@Get('jwt-refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshJwtToken(
		@Payload() payload: RefreshJwtTokenDTO,
	): Promise<any> {
		const token = await this.authService.refreshAccessToken(
			payload.userName,
			payload.refreshToken,
			payload.tfa
		);
		return { accessToken: token };
	}

	@ApiOperation({
		summary: 'logout',
		description: 'Delete refresh token.',
	})
	@ApiOkResponse({
		description: 'Logout has been successful.',
	})
	@ApiUnauthorizedResponse({
		description:
			'JWT access token is not validate.',
	})
	@ApiBearerAuth()
	@Get('logout')
	@UseGuards(JwtAuthGuard)
	async logout(@Payload() payload: JwtAccessTokenDTO): Promise<void> {
		this.authService.logout(payload.userName);
	}
}


