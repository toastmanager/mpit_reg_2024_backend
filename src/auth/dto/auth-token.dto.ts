import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthToken {
  @ApiProperty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  @IsString()
  token_type: 'Bearer';
}
