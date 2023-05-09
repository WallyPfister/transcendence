import { ApiProperty } from "@nestjs/swagger";

export class memberProfileDto {
	@ApiProperty({ description: 'user-set name' })
	name: string;

	@ApiProperty({ description: 'user avatar' })
	avatar: string;

	@ApiProperty({ description: 'user connection status' })
	status: number;
	
	@ApiProperty({ description: 'the number of wins'})
	win: number;

	@ApiProperty({ description: `the number of loses`})
	lose: number;

	@ApiProperty({ description: 'total earned game points' })
	score: number;

	@ApiProperty({ description: 'game tier' })
	level: number;

	@ApiProperty({ description: 'game achievements earned' })
	achieve: number;

	@ApiProperty({ description: 'friend or not'})
	whois?: number;
}