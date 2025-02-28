import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsString,
} from 'class-validator';

export class ActivityDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({
    default: '',
  })
  @IsString()
  mainPosterUrl: string;

  @ApiProperty({
    enum: ActivityType,
  })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({
    default: '',
  })
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsISO8601()
  date: Date;

  @ApiProperty()
  @IsISO8601()
  createdAt: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt: Date;
}
