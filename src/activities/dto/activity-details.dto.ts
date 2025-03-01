import { ApiProperty } from '@nestjs/swagger';
import { ActivityDto } from './activity.dto';
import { ActivityDateDto } from './activity-date.dto';

export class ActivityDetailsDto extends ActivityDto {
  @ApiProperty({
    type: ActivityDateDto,
    isArray: true,
  })
  dates: ActivityDateDto[];
}
