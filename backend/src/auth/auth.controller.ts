import {
	Controller,
	Get,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAccessAuthGuard } from './guards/jwt.access.guard';
import { JwtRefreshAuthGuard } from './guards/jwt.refresh.guard';
import { AuthService } from './auth.service';
import { PayloadDTO } from './dto/payload.dto';
import { Payload } from './decorators/payload';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private config: ConfigService,
	) { }

	@Get('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refresh(
		@Payload() payload: PayloadDTO,
	): Promise<string> {
		return this.authService.issueRefreshToken(
			payload.userName
		);
	}

	// TODO: login() 구현
	// TODO: logout() 구현
	// TODO: tfaLogin() 구현 -> issueAccessToken() + issueRefreshToken()
}


