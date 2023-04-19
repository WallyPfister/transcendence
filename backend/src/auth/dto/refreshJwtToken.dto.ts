import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class refreshJwtTokenDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsBoolean()
  tfa: boolean;
}
