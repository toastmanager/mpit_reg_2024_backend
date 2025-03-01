import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601 } from 'class-validator';

export class ActivityDateDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  id: number;

  @ApiProperty()
  @IsISO8601()
  date: Date;
}
