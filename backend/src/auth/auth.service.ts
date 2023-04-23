import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRepository } from 'src/member/member.repository';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
		private readonly prisma: PrismaService,
		private readonly memberRepository: MemberRepository,
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
			tfaCheck: tfa,
		};
		const token = this.jwtService.signAsync(
			payload,
			{
				secret: this.config.get<string>('JWT_ACCESS_SECRET'),
				expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRE_TIME'),
			},
		);
		return token;
	}

	async issueRefreshToken(userName: string, tfa: boolean): Promise<string> {
		const token = this.jwtService.sign(
			{
				sub: userName,
				tfaCheck: tfa,
			},
			{
				secret: this.config.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRE_TIME'),
			},
		);
		await this.memberRepository.updateRefreshToken(userName, token);
		return token;
	}

	async refreshAccessToken(
		userName: string,
		refreshToken: string,
		tfa: boolean
	): Promise<string> {
		if (!this.verifyRefreshToken(refreshToken)) throw new HttpException('Refresh token is invalid.', 401);
		// TODO: RefreshToken 변조 여부 검사(다른 유저와 바꿔치기 여부)
		const token = await this.issueAccessToken(userName, tfa);
		return token;
	}

	async logout(name: string): Promise<void> {
		// await this.memberRepository.deleteRefreshToken(name);
		// status 가 0인게 offline?
		await this.memberRepository.updateStatus(name, 0);
	}

	// TODO: twoFactorAuthentication() 구현
}
