import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtLimitedStrategy } from './strategies/jwt.limited.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/jwt.refresh.strategy';
import { JwtSignUpStrategy } from './strategies/jwt.signup.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRepository } from '../member/member.repository';
import oauthConfig from 'src/config/oauth.config';
import jwtConfig from 'src/config/jwt.config';
import tfaConfig from 'src/config/tfa.config';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME }
		}),
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
		}),
		PassportModule,
		ConfigModule.forFeature(oauthConfig),
		ConfigModule.forFeature(jwtConfig),
		ConfigModule.forFeature(tfaConfig),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtLimitedStrategy, JwtStrategy, RefreshTokenStrategy,
		JwtSignUpStrategy, ConfigService, PrismaService, MemberRepository,],
	exports: [AuthService]
})
export class AuthModule { }

