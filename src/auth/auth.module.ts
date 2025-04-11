import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from 'users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './models/refresh-token.model';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    JwtModule.register({}),
    SequelizeModule.forFeature([RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
