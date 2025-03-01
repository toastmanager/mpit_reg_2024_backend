import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class DeleteFromGroupDto {
  @ApiProperty({
    type: 'integer',
  })
  @IsInt()
  id: number;
}
