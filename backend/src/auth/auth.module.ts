import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/jwt.refresh.strategy';
import { FTOauthStrategy } from './strategies/ft.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRepository } from '../member/member.repository';
import memberConfig from 'src/config/member.config';
import oauthConfig from 'src/config/oauth.config';
import jwtConfig from 'src/config/jwt.config';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME }
		}),
		PassportModule,
		ConfigModule.forFeature(oauthConfig), ConfigModule.forFeature(jwtConfig), ConfigModule.forFeature(memberConfig)
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, RefreshTokenStrategy, FTOauthStrategy,
		ConfigService, PrismaService, MemberRepository,],
	exports: [AuthService]
})
export class AuthModule { }

