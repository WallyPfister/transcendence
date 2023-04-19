import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtAccessAuthGuard } from './guards/jwt.access.guard';
import { JwtRefreshAuthGuard } from './guards/jwt.refresh.guard';
import { AuthService } from './auth.service';
import { createJwtTokenDTO } from './dto/createJwtToken.dto';
import { refreshJwtTokenDTO } from './dto/refreshJwtToken.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
	) { }

	@Post('create')
	// @UseGuards(JwtAccessAuthGuard)
	async createJwtToken(@Body() payload: createJwtTokenDTO): Promise<{ accessToken: string, refreshToken: string }> {
		const at = await this.authService.issueAccessToken(payload.userName, payload.tfa);
		const rt = await this.authService.issueRefreshToken(payload.userName);
		return { accessToken: at, refreshToken: rt }
	}

	@Post('refresh')
	// @UseGuards(JwtRefreshAuthGuard)
	async refreshJwtToken(
		@Body() payload: refreshJwtTokenDTO,
	): Promise<{ accessToken: string }> {
		console.log(payload);
		const token = await this.authService.refreshAccessToken(
			payload.userName,
			payload.refreshToken,
			payload.tfa
		);
		return token;
	}

	// TODO: login() 구현
	// TODO: logout() 구현
	// TODO: tfaLogin() 구현 -> issueAccessToken() + issueRefreshToken()
}


