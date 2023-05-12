import { ApiProperty } from "@nestjs/swagger";

export class GameResultDto {
	@ApiProperty({ description: 'winner name' })
	winner: string;

	@ApiProperty({ description: 'loser name' })
	loser: string;

	@ApiProperty({ description: 'the winner\'s score' })
	winScore: number;

	@ApiProperty({ description: 'the loser\'s score name' })
	loseScore: number;

	@ApiProperty({ description: 'the type of the game' })
	type: number;

	constructor() {
		this.winner = "";
		this.loser = "";
		this.winScore = 0;
		this.loseScore = 0;
		this.type = 0;
	}
}