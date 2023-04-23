import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
} from '@nestjs/common';
import { Payload } from './decorators/payload';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtRefreshAuthGuard } from './guards/jwt.refresh.guard';
import { FortyTwoAuthGuard } from './guards/ft.guard';
import { AuthService } from './auth.service';
import { RefreshJwtTokenDTO } from './dto/refreshJwtToken.dto';
import { LoginMemberDTO } from './dto/loginMember.dto';
import { JwtTokenInfo, JwtAccessTokenInfo } from '../utils/type';
import { ConfigService } from '@nestjs/config';
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly config: ConfigService,
	) { }

	@ApiOperation({
		summary: 'Login Entrypoint',
		description: 'Redirect to callback page.',
	})
	@ApiResponse({
		status: 302,
		description: 'Redirect to callback URL if user agreed to authorize.',
	})
	@Get('ft_login')
	@UseGuards(FortyTwoAuthGuard)
	ft_login(): void { }

	@ApiOperation({
		summary: '42 OAuth callback url',
		description: '42 OAuth will be redirected here.',
	})
	@ApiResponse({
		status: 401,
		description:
			'Not a registered member yet. Redirect to signup page.',
	})
	@ApiResponse({
		status: 200,
		description:
			'JWT token issued and login has been successful.',
	})
	@Get('callback')
	@UseGuards(FortyTwoAuthGuard)
	async login(@Payload() member: LoginMemberDTO): Promise<JwtTokenInfo> {
		const atoken = await this.authService.issueAccessToken(member.name, member.twoFactor);
		const rtoken = await this.authService.issueRefreshToken(member.name, member.twoFactor);
		const time = +this.config.get<string>('JWT_REFRESH_EXPIRE_TIME');
		return { accessToken: atoken, refreshToken: rtoken, expiresIn: time }
	}

	// TODO: Implement two-factor authentication
	@ApiOperation({
		summary: 'Two-factor authentication',
		description: 'Send authentication code to user by e-mail.',
	})
	@Post('tfa')
	// TODO: member DTO 정의 필요
	// TODO: Guard 필요
	async twoFactorAuthentication(@Payload() member: any): Promise<void> {
		// TODO: Implement sendTwoFactorCode
		// this.authService.sendTwoFactorCode(member.email);
		// // TODO: Implement issueLimitedTimeToken
		// const limitedTimeToken =
		// 	this.authService.issueLimitedTimeToken(member.intraId);
		console.log(member.email);
		// return await 'code';
	}

	@ApiOperation({
		summary: 'JWT refresh',
		description: 'Refresh JWT access token.',
	})
	@ApiResponse({
		status: 401,
		description:
			'JWT refresh token is not validate.',
	})
	@ApiResponse({
		status: 200,
		description:
			'JWT access token reissued successfully.',
	})
	@Get('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshJwtToken(
		@Payload() payload: RefreshJwtTokenDTO,
	): Promise<JwtAccessTokenInfo> {
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
	@ApiBearerAuth('token')
	@Get('logout')
	@UseGuards(JwtAuthGuard)
	async logout(@Payload() payload: any): Promise<void> {
		console.log(payload.name);
		this.authService.logout(payload.name);
	}
}


