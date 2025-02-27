import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty()
  @IsISO8601()
  createdAt: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt: Date;
}
