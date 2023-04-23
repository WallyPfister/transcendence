import { Injectable, HttpException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-42';
import { MemberRepository } from '../../member/member.repository';

@Injectable()
export class FTOauthStrategy extends PassportStrategy(Strategy, 'ft') {
	constructor(
		private readonly config: ConfigService,
		private readonly memberRepository: MemberRepository
	) {
		super({
			clientID: config.get<string>('FT_OAUTH_CLIENT_ID'),
			clientSecret: config.get<string>('FT_OAUTH_SECRET'),
			callbackURL: config.get<string>('FT_OAUTH_CALLBACK'),
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
	) {
		const member = await this.memberRepository.findOneByIntraId(profile.username);
		if (!member)
			throw new HttpException(`Not registered as a pong member yet(${profile.username}).`, 401);
		return member;
	}
}

/* Properties of profile
*
*   - `provider`         always set to `42`
*   - `id`               the user's 42 ID(number)
*   - `username`         the user's 42 xlogin(Intra ID)
*   - `displayName`      the user's full name
*   - `name.familyName`  the user's last name
*   - `name.givenName`   the user's first name
*   - `profileUrl`       the URL of the profile for the user on 42 intra
*   - `emails`           the user's email address
*   - `photos      `     the user's photo
*   - `phoneNumbers`     the user's phone number
*/
