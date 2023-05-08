import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class IssueAccessTokenDTO {
  @ApiProperty({ description: 'JWT access token' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
