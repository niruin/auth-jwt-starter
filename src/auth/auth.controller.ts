import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { DefaultResponse } from 'common/interfaces/interface';

import { CreateUserDto } from '../users/dto/create-user.dto';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SkipAuth } from './decorator/skip-auth.decorator';
import { SignInResponse } from './interfaces/auth.interface';
import { EnumUserRole } from '../users/interfaces/users.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @SkipAuth()
  @ApiOkResponse({ type: SignInResponse })
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<void> {
    const { email, password } = signInDto;
    const { accessToken, refreshToken } = await this.authService.signIn(email, password);

    this.setRefreshTokenCookie(res, refreshToken);

    const response: SignInResponse = {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: ['Токены созданы'],
      accessToken: accessToken,
    };

    res.json(response);
  }

  @Post('/register')
  @SkipAuth()
  @ApiOkResponse({ type: DefaultResponse })
  @HttpCode(HttpStatus.CREATED)
  registerUser(@Body() createUserDto: CreateUserDto): Promise<DefaultResponse> {
    return this.authService.registerUser(createUserDto);
  }

  @Post('refresh')
  @SkipAuth()
  @ApiOkResponse({ type: SignInResponse })
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    const { id: userId, email, role } = await this.verifyRefreshTokenAndGetPayload(refreshToken);
    await this.authService.removeRefreshToken(userId, refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.createTokens(
      userId,
      email,
      role,
    );

    this.setRefreshTokenCookie(res, newRefreshToken);

    const response: SignInResponse = {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: ['Токены обновлены'],
      accessToken: accessToken,
    };

    res.json(response);
  }

  @Post('logout')
  @SkipAuth()
  @ApiOkResponse({ type: DefaultResponse })
  async signOut(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    const { id: userId } = await this.verifyRefreshTokenAndGetPayload(refreshToken);
    const response = {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: ['Вы успешно вышли из системы'],
    };

    await this.authService.removeRefreshToken(userId, refreshToken);

    res.clearCookie('refresh_token');
    res.json(response);
  }

  @Post('logout-all')
  @SkipAuth()
  @ApiOkResponse({ type: DefaultResponse })
  async signOutAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    const { id: userId } = await this.verifyRefreshTokenAndGetPayload(refreshToken);
    const response = {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: ['Вы вышли из всех устройств'],
    };

    await this.authService.removeAllUserTokens(userId);

    res.clearCookie('refresh_token');
    res.json(response);
  }

  private async verifyRefreshTokenAndGetPayload(
    refreshToken: string,
  ): Promise<{ id: number; email: string; role: EnumUserRole; tokenVersion: string }> {
    if (!refreshToken) throw new UnauthorizedException('Refresh token not found');
    return await this.authService.verifyRefreshToken(refreshToken);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      //TODO сделать зависимым от локального окружения
      secure: false,
      sameSite: 'strict',
    });
  }
}
