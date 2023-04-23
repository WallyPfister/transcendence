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
import { refreshJwtTokenDTO } from './dto/refreshJwtToken.dto';
import { JwtTokenInfo, JwtAccessTokenInfo } from '../utils/type';
import { ConfigService } from '@nestjs/config';
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
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
	async login(@Payload() member: any): Promise<JwtTokenInfo> {
		// TODO: Two factor authentication
		if (member.twoFactor) {
			// TODO: Implement sendTwoFactorCode
			// this.authService.sendTwoFactorCode(member.email);
			// // TODO: Implement issueLimitedTimeToken
			// const limitedTimeToken =
			// 	this.authService.issueLimitedTimeToken(member.intraId);
			console.log(member.email);
		}
		const atoken = await this.authService.issueAccessToken(member.name, member.twoFactor);
		const rtoken = await this.authService.issueRefreshToken(member.name);
		const time = +this.config.get<string>('JWT_REFRESH_EXPIRE_TIME');
		return { accessToken: atoken, refreshToken: rtoken, expiresIn: time }
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
		@Payload() payload: refreshJwtTokenDTO,
	): Promise<JwtAccessTokenInfo> {
		const token = await this.authService.refreshAccessToken(
			payload.userName,
			payload.refreshToken,
			payload.tfa
		);
		const time = +this.config.get<string>('JWT_REFRESH_EXPIRE_TIME');
		return { accessToken: token, expiresIn: time };
	}

	// TODO: logout() 구현
	@Get('logout')
	@UseGuards(JwtAuthGuard)
	async logout() {

	}
	// TODO: tfa() 구현
}


