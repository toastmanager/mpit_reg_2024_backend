import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsISO8601 } from 'class-validator';
import { UserDto } from '../../../users/dto/user.dto';

export class ActivityReviewDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsInt()
  score: number;

  @ApiProperty({
    default: '',
  })
  @IsString()
  text: string;

  @ApiProperty({
    type: UserDto,
  })
  author: UserDto;

  @ApiProperty()
  @IsISO8601()
  createdAt: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt: Date;
}
