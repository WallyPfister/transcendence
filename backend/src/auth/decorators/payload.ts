import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * {
 *   name: 'Unique Nickname',
 *   email: '',
 *   intraId: 'Intra ID',
 *   avatar: '',
 *   status: 0,
 *   win: 0,
 *   lose: 0,
 *   level: 0,
 *   score: 0,
 *   achieve: 0,
 *   socket: 0,
 *   twoFactor: false,
 *   refreshToken: ''
 *  }
 */
export const Payload = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	}
);
