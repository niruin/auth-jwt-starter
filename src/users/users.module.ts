import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from './models/users.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { IsEmailUnique } from './validators/is-email-unique.validator';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService, IsEmailUnique],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
