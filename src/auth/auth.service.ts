import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

import { DefaultResponse } from 'common/interfaces/interface';
import { UsersService } from 'users/users.service';
import { CreateUserDto } from 'users/dto/create-user.dto';
import { AuthTokens } from './interfaces/auth.interface';
import { EnumUserRole } from '../users/interfaces/users.interface';
import { RefreshToken } from './models/refresh-token.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(['Пользователь с таким email не найден']);
    }

    const { id, email: emailUser, role, password } = user;
    const passwordValid = await bcrypt.compare(pass, password);

    if (!passwordValid) {
      throw new UnauthorizedException(['Не верный пароль']);
    }

    return this.createTokens(id, emailUser, role);
  }

  async registerUser(createUserDto: CreateUserDto): Promise<DefaultResponse> {
    return await this.usersService.create(createUserDto);
  }

  async createTokens(id: number, email: string, role: EnumUserRole): Promise<AuthTokens> {
    const tokenVersion = randomUUID();
    const payload = { id, email, role, tokenVersion };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.saveRefreshToken(id, refreshToken, tokenVersion, expiresAt);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<{ id: number; email: string; role: EnumUserRole; tokenVersion: string }> {
    try {
      return this.jwtService.verify<{
        id: number;
        email: string;
        role: EnumUserRole;
        tokenVersion: string;
      }>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(['Не валидный или проcроченный токен']);
    }
  }

  async saveRefreshToken(
    userId: number,
    token: string,
    tokenVersion: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.refreshTokenModel.create({ userId, token, tokenVersion, expiresAt });
  }

  async validateRefreshToken(token: RefreshToken): Promise<boolean> {
    if (!token) return false;

    const isExpired = new Date() > token.expiresAt;
    if (isExpired) {
      await token.destroy();
      return false;
    }
    return true;
  }

  async getRefreshTokenByTokenVersion(userId: number, tokenVersion: string): Promise<RefreshToken> {
    return await this.refreshTokenModel.findOne({ where: { userId, tokenVersion } });
  }

  async removeRefreshToken(userId: number, token: string): Promise<void> {
    const response = await this.refreshTokenModel.destroy({ where: { userId, token } });
  }

  async removeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenModel.destroy({ where: { userId } });
  }
}
