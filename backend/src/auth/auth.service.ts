import { HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MemberRepository } from 'src/member/member.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom, map, lastValueFrom, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import oauthConfig from 'src/config/oauth.config';
import jwtConfig from 'src/config/jwt.config';
import tfaConfig from 'src/config/tfa.config';
import { MemberConstants } from '../member/memberConstants';
import { LoginMemberDTO } from './dto/member.login.dto';

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
		private jwt: ConfigType<typeof jwtConfig>,
		@Inject(tfaConfig.KEY)
		private tfa: ConfigType<typeof tfaConfig>
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
						if (response.status == 429) {
							throw new HttpException('Too many requests.', 429);
						}
						else if (response.status !== 200) {
							throw new InternalServerErrorException('Failed to get 42 token.');
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
				tap((response: AxiosResponse) => {
					if (response.status == 429) {
						throw new HttpException('Too many requests.', 429);
					}
					else if (response.status !== 200) {
						throw new InternalServerErrorException('Failed to get 42 profile.');
					}
				}),
			));
		return profile.data.login;
	}

	async getMemberInfo(code: string): Promise<{ member: LoginMemberDTO, token: string }> {
		const token = await this.getFortyTwoToken(code);
		const intraId = await this.getFortyTwoProfile(token);
		const member = await this.memberRepository.findOneByIntraId(intraId);
		if (!member)
			throw new UnauthorizedException(intraId);
		else if (member.twoFactor) {
			const token = await this.issueLimitedAccessToken(member.name);
			return { member: member, token: token };
		}
		else
			return { member: member, token: "" };
	}

	verifyAccessToken(token: string): any {
		try {
			return this.jwtService.verify(token, {
				secret: this.jwt.accessSecret,
			});
		} catch (err) {
			throw err;
		}
	}

	verifyRefreshToken(token: string): any {
		try {
			return this.jwtService.verify(token, {
				secret: this.jwt.refreshSecret,
			});
		} catch (err) {
			throw new UnauthorizedException('JWT refresh token verification failed.');
		}
	}

	async issueLimitedAccessToken(userName: string): Promise<string> {
		const bodyFormData = {
			sub: userName,
		};
		const token = await this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.limitedSecret,
				expiresIn: this.jwt.limitedExpireTime,
			},
		);
		return token;
	}

	async issueSignUpAccessToken(userName: string): Promise<string> {
		const bodyFormData = {
			sub: userName,
		};
		const token = await this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.signupSecret,
				expiresIn: this.jwt.signupExpireTime,
			},
		);
		return token;
	}

	async issueAccessToken(userName: string): Promise<string> {
		const bodyFormData = {
			sub: userName,
		};
		const token = await this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.accessSecret,
				expiresIn: this.jwt.accessExpireTime,
			},
		);
		return token;
	}

	async issueRefreshToken(userName: string): Promise<string> {
		const bodyFormData = {
			sub: userName,
		};
		const token = await this.jwtService.signAsync(
			bodyFormData,
			{
				secret: this.jwt.refreshSecret,
				expiresIn: this.jwt.refreshExpireTime,
			},
		);
		return token;
	}

	async issueJwtTokens(name: string): Promise<{ accessToken: string, refreshToken: string }> {
		const atoken = await this.issueAccessToken(name);
		const rtoken = await this.issueRefreshToken(name);
		await this.login(name);
		return { accessToken: atoken, refreshToken: rtoken };
	}

	async login(name: string): Promise<void> {
		await this.memberRepository.updateStatus(name, MemberConstants.ONLINE);
	}

	async logout(name: string): Promise<void> {
		await this.memberRepository.updateStatus(name, MemberConstants.OFFLINE);
	}

	async sendTfaCodeForSignUp(email: string): Promise<string> {
		const code = this.memberRepository.generateTfaCodeForSignUp();
		const success = await this.mailerService.
			sendMail({
				to: email,
				from: 'tspong@naver.com',
				subject: 'Pong Two-factor Authentication Code',
				html: `Your two-factor authentication code is [ ${code} ].`,
			})
			.then(() => { return code; })
			.catch((err) => {
				console.log('Failed to send email.');
				return "";
			}
			);
		if (!success)
			return "";
		return code;
	}

	async sendTfaCodeForSignIn(name: string, email: string): Promise<string> {
		const code = await this.memberRepository.generateTfaCodeForSignIn(name);
		const success = await this.mailerService.
			sendMail({
				to: email,
				from: 'tspong@naver.com',
				subject: 'Pong Two-factor Authentication Code',
				html: `Your two-factor authentication code is [ ${code} ].`,
			})
			.then(() => { return code; })
			.catch((err) => {
				console.log('Failed to send email.');
				return "";
			}
			);
		if (!success)
			return "";
		return code;
	}

	verifyTfaCodeForSignUp(savedCode: string, inputCode: string): boolean {
		if (savedCode != inputCode)
			return false;
		return true;
	}

	async verifyTfaCodeForSignIn(name: string, code: string): Promise<boolean> {
		const time = await this.memberRepository.getTfaTime(name);
		const now = new Date();
		const diff = (now.getTime() - time.tfaTime.getTime()) / 1000;
		if (diff > +this.tfa.tfaExpireTime)
			throw new UnauthorizedException('The code has been expired.');
		const info = await this.memberRepository.getTfaCode(name);
		if (info.tfaCode != code)
			return false;
		return true;
	}
}
