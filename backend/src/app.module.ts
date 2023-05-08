import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, AuthModule, MemberModule, GameModule,
    MailerModule.forRoot({
      transport: {
        service: 'Naver',
        host: 'smtp.naver.com',
        port: 587, // for TLS
        auth: {
          user: process.env.MAILER_NAME,
          pass: process.env.MAILER_PASS,
        },
      },
    }),
    ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
