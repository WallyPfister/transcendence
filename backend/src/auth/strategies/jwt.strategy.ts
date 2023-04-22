import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_ACCESS_SECRET,
		});
	}

	async validate(payload: any) {
		return payload;
	}
}

/* JWT strategy options
*
* `jwtFromRequest` (REQUIRED) Function that accepts a request as the only
  parameter and returns either the JWT as a string or *null*.
* `secretOrKey` is a string or buffer containing the secret (symmetric) or
  PEM-encoded public key (asymmetric) for verifying the token's signature.
  REQUIRED unless `secretOrKeyProvider` is provided.
*/
