import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, Matches, MinLength, Validate } from 'class-validator';

import { EnumUserRole } from '../interfaces/users.interface';
import { IsEmailUnique } from '../validators/is-email-unique.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Qwerty123' })
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Пароль должен содержать хотя бы одну цифру',
  })
  readonly password: string;

  @ApiProperty({ example: 'email@email.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  @Validate(IsEmailUnique)
  readonly email: string;

  @ApiProperty({ example: EnumUserRole.EMPLOYEE, required: false })
  @IsOptional()
  @IsEnum(EnumUserRole, {
    message: `Роль должна быть одной из: ${EnumUserRole.ADMIN}, ${EnumUserRole.EMPLOYEE}`,
  })
  readonly role?: EnumUserRole;
}
