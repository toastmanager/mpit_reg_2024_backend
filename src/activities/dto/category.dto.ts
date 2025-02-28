import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { ActivityDto } from './activity.dto';

export class CategoryDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    type: ActivityDto,
    isArray: true,
  })
  activities: ActivityDto[];

  @ApiProperty({
    default: true,
  })
  @IsBoolean()
  isHorizontal: boolean = true;
}
