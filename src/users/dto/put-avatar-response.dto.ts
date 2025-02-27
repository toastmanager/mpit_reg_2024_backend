import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PutAvatarResponseDto {
  @ApiProperty()
  @IsString()
  isUpdated: boolean;
}
