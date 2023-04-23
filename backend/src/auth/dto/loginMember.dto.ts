import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
export class LoginMemberDTO {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsBoolean()
	twoFactor: boolean;
}
