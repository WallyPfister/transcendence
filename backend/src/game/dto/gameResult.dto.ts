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

	constructor(winner, loser, winScore, loseScore, type) {
		this.winner = winner;
		this.loser = loser;
		this.winScore = winScore;
		this.loseScore = loseScore;
		this.type = type;
	}
}