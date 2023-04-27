import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { HistoryModule } from './history/history.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [PrismaModule, AuthModule, MemberModule, HistoryModule,
    MailerModule.forRoot({
      transport: {
        service: 'Google',
        host: 'smtp.google.com',
        port: 465, // for SSL. 587 for TLS
        auth: {
          user: process.env.MAILER_NAME,
          pass: process.env.MAILER_PASS,
        },
      },
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}