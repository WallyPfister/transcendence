import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, "42") {
	constructor(
		private readonly authService: AuthService,
	) {
		super(
			{ passReqToCallback: true, }
		);
	}

	async validate(req: Request): Promise<{ intraId: string }> {
		const token = req.get('Authorization').replace('Bearer ', '').trim();
		try {
			const profile = await this.authService.getFortyTwoProfile(token);
			return { intraId: profile.username };
		}
		catch (e) {
			throw new UnauthorizedException('Invalid 42 Oauth token.');
		}
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
