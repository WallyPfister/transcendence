import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class GameResultDto {
	@IsString()
	@ApiProperty({ description: 'winner name' })
	winner: string;

	@IsString()
	@ApiProperty({ description: 'loser name' })
	loser: string;

	@IsNumber()
	@ApiProperty({ description: 'the winner\'s score' })
	winScore: number;

	@IsNumber()
	@ApiProperty({ description: 'the loser\'s score name' })
	loseScore: number;

	@IsNumber()
	@ApiProperty({ description: 'the type of the game' })
	type: number;
}