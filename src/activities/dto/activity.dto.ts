import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsString } from 'class-validator';

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

  @ApiProperty()
  @IsISO8601()
  createdAt: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt: Date;
}
