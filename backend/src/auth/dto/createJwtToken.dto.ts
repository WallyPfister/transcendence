import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateJwtTokenDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsBoolean()
  tfa: boolean;
}
