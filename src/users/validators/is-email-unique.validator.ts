import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUnique implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      throw new ConflictException('Email уже используется.');
    }

    return !user;
  }

  // defaultMessage(args: ValidationArguments): string {
  //   return 'Email уже используется.';
  // }
}
