import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class LoginMemberDTO {
	@ApiProperty({ description: 'User nickname' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: 'User e-mail' })
	@IsNotEmpty()
	@IsString()
	email: string;

	@ApiProperty({ description: 'Two-factor authentication checked' })
	@IsNotEmpty()
	@IsBoolean()
	twoFactor: boolean;
}
