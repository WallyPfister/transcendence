import { ApiProperty } from "@nestjs/swagger";

export class MemberGameInfoDto {
	@ApiProperty({ description: 'user-set name' })
	name: string;

	@ApiProperty({ description: 'the number of wins' })
	win: number;

	@ApiProperty({ description: 'the number of loses' })
	lose: number;

	@ApiProperty({ description: 'total earned game points' })
	score: number;

	@ApiProperty({ description: 'game tier' })
	level: number;

	@ApiProperty({ description: 'game achievements earned' })
	achieve: number;
}