import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class RefreshJwtTokenDTO {
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
