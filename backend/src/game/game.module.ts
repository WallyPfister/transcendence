import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { MemberRepository } from 'src/member/member.repository';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  controllers: [GameController],
  providers: [GameService, MemberRepository, ChannelService]
})
export class GameModule {}
