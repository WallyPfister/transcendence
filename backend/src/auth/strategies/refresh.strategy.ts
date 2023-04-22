import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_REFRESH_SECRET,
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: any) {
		const refreshToken = req.get('authorization').split('Bearer ')[1];

		return {
			...payload,
			refreshToken,
		};
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
