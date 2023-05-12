import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';
import { MemberRepository } from 'src/member/member.repository';
import { ChannelService } from 'src/channel/channel.service';
import { MemberService } from 'src/member/member.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [GameController],
  providers: [GameService, GameRepository, MemberService, MemberRepository, ChannelService],
  exports: [GameService]
})
export class GameModule { }
