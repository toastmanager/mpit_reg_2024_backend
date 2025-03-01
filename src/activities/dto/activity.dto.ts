import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import { IsEnum, IsInt, IsISO8601, IsNumber, IsString } from 'class-validator';

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
    type: String,
    isArray: true,
  })
  extraPostersUrls: string[];

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
  @IsNumber()
  score: number;

  @ApiProperty()
  @IsISO8601()
  createdAt: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt: Date;
}
