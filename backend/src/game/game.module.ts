import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';
import { MemberService } from 'src/member/member.service';
import { MemberRepository } from 'src/member/member.repository';

@Module({
  controllers: [GameController],
  providers: [GameService, GameRepository, MemberService, MemberRepository],
  exports: [GameService]
})
export class GameModule { }
