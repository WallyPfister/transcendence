import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class JwtTokenDTO {
  @ApiProperty({ description: 'User nickname' })
  @IsNotEmpty()
  @IsString()
  userName: string;
}
