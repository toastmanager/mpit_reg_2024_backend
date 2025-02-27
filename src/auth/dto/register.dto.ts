import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'example@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
