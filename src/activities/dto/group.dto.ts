import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { ActivityDto } from './activity.dto';

export class GroupDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    type: ActivityDto,
    isArray: true,
  })
  activities: ActivityDto[];
}
