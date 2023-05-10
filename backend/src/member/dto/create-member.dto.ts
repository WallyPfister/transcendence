import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateMemberDto {
	@ApiProperty({ description: 'user-set name' })
	name: string;

	@ApiProperty({ description: 'user 42seoul intra ID' })
	intraId: string;

	@IsString()
	@ApiProperty({ description: `user avatar image` })
	avatar: string;

	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ description: `user two-factor authentication email address` })
	email: string;

	@ApiProperty({ description: 'user two-factor authentication status' })
	twoFactor: boolean;
}
