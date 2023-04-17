import { IsNotEmpty, IsString } from 'class-validator';

export class PayloadDTO {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
