import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import { IsEnum, IsISO8601, IsNumber, IsString } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({
    default: '',
  })
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsISO8601()
  date: Date;

  @ApiProperty({
    enum: ActivityType,
  })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty()
  @IsString()
  paymentUrl: string;
}
