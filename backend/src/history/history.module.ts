import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { HistoryRepository } from './history.repository';
import { MemberService } from 'src/member/member.service';
import { MemberRepository } from 'src/member/member.repository';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository, MemberService, MemberRepository]
})
export class HistoryModule {}
