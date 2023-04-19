import { Exclude } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateMemberDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	intraId: string;

	@IsString()
	avatar: string;

	@IsEmail()
	email: string;

	@IsBoolean()
	@IsNotEmpty()
	@Exclude()
	twoFactor: boolean;

	@IsString()
	@IsNotEmpty()
	@Exclude()
	refreshToken: string;
}
