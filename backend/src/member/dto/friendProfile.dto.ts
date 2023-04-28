import { ApiProperty } from "@nestjs/swagger";

export class FriendProfileDto {
	@ApiProperty({ description: 'user-set name' })
	name: string;

	@ApiProperty({ description: `user avatar image` })
	avatar: string;

	@ApiProperty({ description: `user connection status`})
	status: number;

	@ApiProperty({ description: 'game tier' })
	level: number;

	@ApiProperty({ description: 'game achievements earned'})
	achieve: number;
}