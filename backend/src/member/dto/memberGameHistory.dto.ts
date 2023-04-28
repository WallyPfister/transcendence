import { ApiProperty } from "@nestjs/swagger";

export class MemberGameHistoryDto {
	@ApiProperty({ description: 'user-set name' })
	name: string;

	@ApiProperty({ description: 'opponent player name' })
	opponent: string;

	@ApiProperty({ description: 'the member\'s score' })
	scoreA: number;

	@ApiProperty({ description: 'the opponent\'s score' })
	scoreB: number;

	@ApiProperty({ description: 'the result of the game' })
	result: boolean;

	@ApiProperty({ description: 'type of the game' })
	type: number;

	@ApiProperty({ description: 'the date of the game' })
	date: Date;

	@ApiProperty({ description: 'the date of the game to string' })
	time?: string;
}