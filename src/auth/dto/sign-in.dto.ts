import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'email@email.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @ApiProperty({ example: 'Qwerty123' })
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Пароль должен содержать хотя бы одну цифру',
  })
  readonly password: string;
}
