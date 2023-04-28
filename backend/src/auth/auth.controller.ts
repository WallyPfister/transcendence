import {
	Controller,
	Get,
	UseGuards,
	Query,
	HttpException,
	Req,
	ForbiddenException
} from '@nestjs/common';
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
	ApiResponse,
	ApiTags,
	ApiBearerAuth
} from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly config: ConfigService,
		private readonly memberRepository: MemberRepository,
	) { }

	// @ApiOperation({
	// 	summary: 'Login Entrypoint',
	// 	description: 'Redirect to callback page.',
	// })
	// @ApiResponse({
	// 	status: 302,
	// 	description: 'Redirect to callback URL if user agreed to authorize.',
	// })
	// @Get('ft_login')
	// @UseGuards(FortyTwoAuthGuard)
	// ft_login(): void { }

	@ApiOperation({
		summary: '42 OAuth callback url',
		description: '42 OAuth will be redirected here.',
	})
	@ApiResponse({
		status: 200,
		description:
			'JWT token issued successfully. Redirect to homepage or tfa if checked.',
	})
	@ApiResponse({
		status: 401,
		description:
			'Not a registered member yet. Please redirect to signup page.',
	})
	@Get('callback')
	async ft_login(@Query('code') code: string): Promise<any> {
		const token = await this.authService.getFortyTwoToken(code);
		const intraId = await this.authService.getFortyTwoProfile(token);
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
	@ApiResponse({
		status: 200,
		description:
			'Two-factor authentication code has been sent.',
	})
	@ApiResponse({
		status: 403,
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
			throw new HttpException('Failed to send tfa code.', 403);
		console.log('TFA code sent.');
	}

	@ApiOperation({
		summary: 'Two-factor authentication',
		description: 'Verify two-factor authentication code sent by e-mail.',
	})
	@ApiResponse({
		status: 200,
		description:
			'Two-factor authentication code has been verified.',
	})
	@ApiResponse({
		status: 403,
		description:
			'Two-factor authentication has failed.',
	})
	@ApiBearerAuth()
	@Get('tfa-verify')
	@UseGuards(JwtLimitedAuthGuard)
	async twoFactorAuth(@Query() code: string, @Payload() payload: JwtAccessTokenDTO): Promise<void> {
		const match = await this.authService.verifyTfaCode(payload.userName, code);
		if (!match)
			throw new HttpException('Two-factor authentication failed.', 403);
	}

	@ApiOperation({
		summary: 'JWT Access Token verification',
		description: 'Login if access token is validate.',
	})
	@ApiResponse({
		status: 200,
		description:
			'JWT access token verified. Login has been successful.',
	})
	@ApiResponse({
		status: 401,
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
	@ApiResponse({
		status: 200,
		description:
			'JWT access token reissued successfully.',
	})
	@ApiResponse({
		status: 401,
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
		const time = +this.config.get<string>('JWT_REFRESH_EXPIRE_TIME');
		return { accessToken: token, expiresIn: time };
	}

	@ApiOperation({
		summary: 'logout',
		description: 'Delete refresh token.',
	})
	@ApiResponse({
		status: 200,
		description: 'Logout has been successful.',
	})
	@ApiResponse({
		status: 401,
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


