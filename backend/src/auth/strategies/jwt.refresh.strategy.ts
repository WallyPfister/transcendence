import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(private readonly config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: any) {
		const rToken = req.get('Authorization').replace('Bearer ', '').trim();
		return { userName: payload.sub, refreshToken: rToken };
	}
}

/* JWT strategy options
*
* `jwtFromRequest` (REQUIRED) Function that accepts a request as the only
  parameter and returns either the JWT as a string or *null*.
* `secretOrKey` is a string or buffer containing the secret (symmetric) or
  PEM-encoded public key (asymmetric) for verifying the token's signature.
  REQUIRED unless `secretOrKeyProvider` is provided.
* `passReqToCallback`: If true the request will be passed to the verify
  callback. i.e. verify(request, jwt_payload, done_callback).
*/
