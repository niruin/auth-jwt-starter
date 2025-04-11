import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { SKIP_AUTH_KEY } from '../decorator/skip-auth.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkipAuth) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Токен отсутствует');

    const payload = await this.verifyToken(token);
    console.log(payload);

    const storedToken = await this.authService.getRefreshTokenByTokenVersion(
      payload.id,
      payload.tokenVersion,
    );

    if (!storedToken) throw new UnauthorizedException('Недействительный токен1');

    const isValidStoredRefreshToken = await this.authService.validateRefreshToken(storedToken);

    if (!isValidStoredRefreshToken || storedToken.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Недействительный токен2');
    }

    request.user = payload;

    return true;
  }

  private async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
