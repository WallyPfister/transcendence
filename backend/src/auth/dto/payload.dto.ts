import { IsNotEmpty, IsString } from 'class-validator';

export class PayloadDTO {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
