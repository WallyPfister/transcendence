import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class JwtAccessTokenDTO {
  @ApiProperty({ description: 'User nickname' })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ description: 'Two-factor authentication checked' })
  @IsNotEmpty()
  @IsBoolean()
  tfa: boolean;
}
