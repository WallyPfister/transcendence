import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository, ChannelService]
})
export class MemberModule { }
