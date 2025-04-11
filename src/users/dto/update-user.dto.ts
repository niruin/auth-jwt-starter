import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { EnumUserRole } from '../interfaces/users.interface';

export class UpdateUserDto {
  @ApiProperty({ example: 'Qwerty123', required: false })
  @IsOptional()
  readonly password?: string;

  @ApiProperty({ example: 'editemail@mail.com', required: false })
  @IsOptional()
  readonly email?: string;

  @ApiProperty({ example: EnumUserRole.EMPLOYEE, required: false })
  @IsString()
  @IsOptional()
  readonly role?: EnumUserRole;
}
