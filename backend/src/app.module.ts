import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [PrismaModule, AuthModule, MemberModule, HistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
