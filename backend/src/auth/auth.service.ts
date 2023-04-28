import { HttpException, Inject, Injectable, Request } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MemberRepository } from 'src/member/member.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom, catchError, map, lastValueFrom, tap } from 'rxjs';
import FormData = require('form-data');
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import oauthConfig from 'src/config/oauth.config';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly memberRepository: MemberRepository,
		private readonly mailerService: MailerService,
		private readonly httpService: HttpService,
		@Inject(oauthConfig.KEY)
		private oauth: ConfigType<typeof oauthConfig>,
		@Inject(jwtConfig.KEY)
		private jwt: ConfigType<typeof jwtConfig>
	) { }

	async getFortyTwoToken(code: string): Promise<any> {
		const headers = { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' };
		const params = new URLSearchParams();
		params.append('grant_type', 'authorization_code');
		params.append('client_id', this.oauth.clientId);
		params.append('client_secret', this.oauth.secret);
		params.append('code', code);
		params.append('redirect_uri', this.oauth.callBack);
		const config: AxiosRequestConfig = { headers };
		const url = this.oauth.tokenUrl;
		const data = params.toString();

		return lastValueFrom(
			this.httpService
				.post(url, data, config)
				.pipe(
					tap((response: AxiosResponse) => {
						if (response.status !== 200) {
							throw new Error(`HTTP Error: ${response.status}`);
						}
					}),
					map((response: AxiosResponse) => response.data.access_token),
				)
		);
	}

	/**
	 * Profile Properties
	 * 
	 * id, email, login, url, phone, displayname, image_url, ...
	 */
	async getFortyTwoProfile(token: string): Promise<any> {
		const requestConfig: AxiosRequestConfig = {
			headers: {
				Authorization: 'Bearer ' + token,
				"Content-Type": 'application/json;charset=utf-8'
			},
		}
		const url = this.oauth.me;
		const profile = await firstValueFrom(this.httpService.get(url, requestConfig)
			.pipe(
				catchError(e => {
					throw new HttpException(e.response.data, e.response.status);
				}),
			));
		return profile.data.login;
	}

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
				secret: this.jwt.refreshSecret,
			});
		} catch (err) {
			console.log('JWT refresh token verification failed.');
			return;
		}
	}

	async issueLimitedAccessToken(userName: string): Promise<string> {
		const bodyFormData = {
			sub: userName,
		};
		const token = this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.limitedSecret,
				expiresIn: this.jwt.limitedExpireTime,
			},
		);
		return token;
	}

	async issueAccessToken(userName: string, tfa: boolean): Promise<string> {
		const bodyFormData = {
			sub: userName,
			tfaCheck: tfa,
		};
		const token = this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.accessSecret,
				expiresIn: this.jwt.accessExpireTime,
			},
		);
		return token;
	}

	async issueRefreshToken(userName: string, tfa: boolean): Promise<string> {
		const bodyFormData = {
			sub: userName,
			tfaCheck: tfa,
		};
		const token = this.jwtService.sign(
			bodyFormData,
			{
				secret: this.jwt.refreshSecret,
				expiresIn: this.jwt.refreshExpireTime,
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
		const code = await this.memberRepository.generateTfaCode(name);
		// // TODO: Implement issueLimitedTimeToken
		// const limitedTimeToken = this.issueLimitedTimeToken(member.intraId);
		const success = await this.mailerService.
			sendMail({
				to: email,
				from: 'tspong@naver.com',
				subject: 'Pong Two-factor Authentication Code',
				html: `Your two-factor authentication code is [ ${code} ].`,
			})
			.then(() => { return true; })
			.catch((err) => {
				console.log('Failed to send email.');
				return false;
			}
			);
		if (!success)
			return false;
		return true;
	}

	async verifyTfaCode(name: string, code: string): Promise<boolean> {
		const info = await this.memberRepository.getTfaCode(name);
		if (info.tfaCode != code)
			return false;
		return true;
	}
}
