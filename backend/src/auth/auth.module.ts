import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	imports: [JwtModule.register({
		secret: process.env.JWT_SECRET,
		signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME }
	}),
		PassportModule],
	controllers: [AuthController],
	providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy,
		ConfigService, PrismaService],
	exports: [AuthService]
})
export class AuthModule { }

