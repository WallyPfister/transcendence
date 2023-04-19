import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class createJwtTokenDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsBoolean()
  tfa: boolean;
}
