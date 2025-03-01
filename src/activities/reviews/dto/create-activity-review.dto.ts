import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateActivityReviewDto {
  @ApiProperty()
  @IsInt()
  score: number;

  @ApiProperty({
    default: '',
  })
  @IsString()
  text: string;
}
