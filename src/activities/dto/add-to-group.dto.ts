import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddToGroupDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  id: number;
}
