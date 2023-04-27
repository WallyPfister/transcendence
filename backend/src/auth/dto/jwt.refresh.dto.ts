import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class RefreshJwtTokenDTO {
  @ApiProperty({ description: 'User nickname' })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({ description: 'Two-factor authenticaation checked' })
  @IsNotEmpty()
  @IsBoolean()
  tfa: boolean;
}
