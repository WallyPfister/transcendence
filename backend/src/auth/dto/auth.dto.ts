import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDTO {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
