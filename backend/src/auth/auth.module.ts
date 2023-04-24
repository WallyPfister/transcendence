import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/jwt.refresh.strategy';
import { FTOauthStrategy } from './strategies/ft.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRepository } from '../member/member.repository';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME }
		}),
		PassportModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, RefreshTokenStrategy, FTOauthStrategy,
		ConfigService, PrismaService, MemberRepository,],
	exports: [AuthService]
})
export class AuthModule { }

