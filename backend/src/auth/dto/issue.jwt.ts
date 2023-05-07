import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class IssueJwtTokenDTO {
  @ApiProperty({ description: 'JWT access token' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
