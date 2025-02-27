import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { UserDto } from './user.dto';

export class UserSensitiveDto extends UserDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
