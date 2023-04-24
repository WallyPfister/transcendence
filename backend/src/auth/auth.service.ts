import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MemberRepository } from 'src/member/member.repository';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
		private readonly memberRepository: MemberRepository,
		private readonly mailer: MailerService,
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
				secret: this.config.get<string>('JWT_REFRESH_SECRET'),
			});
		} catch (err) {
			console.log('JWT refresh token verification failed.');
			return;
		}
	}

	// TODO: RefreshToken의 변조 여부 검사(다른 유저의 토큰으로 바꿔치기 여부)
	// 의문: 현재 로그인한 유저가 A라는 정보는 토큰의 payload 를 통해서 알 수 있는데,
	// 토큰 자체가 다른 유저로 바꿔치기 되었다면 그냥 다른 유저가 로그인한거로 인식되는게 아닌지?
	// 다른 유저의 토큰을 탈취했는지 여부는 애초에 판단 불가하고 유효/유효하지 않음만 판단 가능한게 아닌지...
	// 그래서 토큰에 유효기간이 있는 것이라고 생각(탈취 당하더라도 금방 만료됨)

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
		const payload = {
			sub: userName,
			tfaCheck: tfa,
		};
		const token = this.jwtService.sign(
			payload,
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
		const token = await this.issueAccessToken(userName, tfa);
		return token;
	}

	async logout(name: string): Promise<void> {
		await this.memberRepository.deleteRefreshToken(name);
		await this.memberRepository.updateStatus(name, 0);
	}

	async sendTfaCode(name: string, email: string): Promise<boolean> {
		// TODO: Implement generateCode()
		const code = await this.memberRepository.generateCode(name);
		// // TODO: Implement issueLimitedTimeToken
		// const limitedTimeToken = this.issueLimitedTimeToken(member.intraId);
		try {
			this.mailer.sendMail({
				to: email,
				from: 'tspong42@gmail.com',
				subject: 'Pong Two-factor Authentication Code',
				html: 'code: [' + code + ']\n',
			});
			return true;
		} catch (err) {
			console.log('Failed to send email.');
			return false;
		}
	}

	async verifyTfaCode(name: string, code: string): Promise<boolean> {
		// const info = await this.memberRepository.getTfaCode(name);
		// if (info.tfaCode != code)
		// 	return false;
		return true;
	}
}
