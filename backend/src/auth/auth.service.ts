import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private config: ConfigService,
		private prisma: PrismaService,
	) { }

	verifyAccessToken(token: string) {
		try {
			return this.jwtService.verify(token);
		} catch (err) {
			console.log('JWT access token verification failed.');
			return;
		}
	}

	verifyRefreshToken(token: string) {
		try {
			return this.jwtService.verify(token, {
				secret: this.config.get<string>('JWTREF_SECRET'),
			});
		} catch (err) {
			console.log('JWT refresh token verification failed.');
			return;
		}
	}

	// TODO: RefreshToken의 변조 여부 검사(다른 유저의 토큰으로 바꿔치기 여부)

	async saveRefreshToken(userName: string, token: string): Promise<void> {
		await this.prisma.member.update({
			where: {
				name: userName,
			},
			data: {
				refreshToken: token,
			},
		});
	}

	async issueAccessToken(userName: string, tfa: boolean): Promise<string> {
		const payload = {
			sub: userName,
			tfa_done: tfa,
		};
		const token = this.jwtService.signAsync(
			payload,
			{
				secret: this.config.get<string>('JWT_SECRET'),
				expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRE_TIME'),
			},
		);
		return token;
	}

	async issueRefreshToken(username: string): Promise<string> {
		const token = this.jwtService.sign(
			{},
			{
				secret: this.config.get<string>('JWT_SECRET'),
				expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRE_TIME'),
			},
		);
		// TODO: 유저 생성 기능 적용 후에 활성화
		// await this.saveRefreshToken(username, token);
		return token;
	}

	async refreshAccessToken(
		userName: string,
		refreshToken: string,
		tfa: boolean
	): Promise<{ accessToken: string }> {
		if (!this.verifyRefreshToken(refreshToken)) throw new HttpException('Refresh token is invalid.', 401);
		// TODO: RefreshToken 변조 여부 검사(다른 유저와 바꿔치기 여부)
		const token = await this.issueAccessToken(userName, tfa);
		return {
			accessToken: token,
		};
	}

	// TODO: login() 구현
	// TODO: logout() 구현 -> 질문: accessToken & refreshToken 멤버에서 삭제?
	// TODO: twoFactorAuthentication() 구현
}
