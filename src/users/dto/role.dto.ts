import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class RoleDto {
  @ApiProperty()
  @IsEnum($Enums.Role)
  role: $Enums.Role;
}
