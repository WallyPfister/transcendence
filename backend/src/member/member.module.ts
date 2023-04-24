import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { ConfigModule } from '@nestjs/config';
import memberConfig from 'src/config/member.config';

@Module({
  imports: [ConfigModule.forFeature(memberConfig)],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository]
})
export class MemberModule {}
