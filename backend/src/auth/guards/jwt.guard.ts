import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(
		private readonly authService: AuthService,
	) { super(); }

	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const { authorization } = request.headers;
		if (authorization === undefined) {
			throw new UnauthorizedException('Invalid access token.');
		}
		const token = authorization.replace('Bearer ', '')
		request.user = this.validateToken(token);
		return true;
	}

	validateToken(token: string) {
		try {
			const payload = this.authService.verifyAccessToken(token);
			return payload;
		} catch (e) {
			switch (e.message) {
				case 'jwt expired':
					throw new UnauthorizedException('Expired access token.');
				default:
					throw new UnauthorizedException('Invalid access token.');
			}
		}
	}
}
