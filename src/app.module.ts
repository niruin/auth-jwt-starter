import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import * as process from 'process';
import { join } from 'path';
import { config } from 'dotenv';

import { AuthGuard } from 'auth/guard/auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { AuthModule } from 'auth/auth.module';
import { UsersModule } from 'users/users.module';

const dotenvConfig = config({ path: join(__dirname, '..', '.env.development') });
const { MYSQLDB_HOST, MYSQLDB_PORT, MYSQLDB_USER, MYSQLDB_PASSWORD, MYSQLDB_DATABASE } =
  dotenvConfig.parsed;

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: MYSQLDB_HOST,
      port: parseInt(MYSQLDB_PORT),
      username: MYSQLDB_USER,
      password: MYSQLDB_PASSWORD,
      database: MYSQLDB_DATABASE,
      autoLoadModels: true,
      synchronize: true,
      define: {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
      },
    }),
    ConfigModule.forRoot({ envFilePath: process.env.BUILD_PATH }),
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
