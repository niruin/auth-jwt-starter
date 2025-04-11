import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Query, Request } from '@nestjs/common';

import { DefaultResponse } from 'common/interfaces/interface';
import { UsersService } from './users.service';
import {
  GetUsersListQueryParams,
  UserProfileResponse,
  UsersListResponse,
} from './interfaces/users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/list')
  @ApiOkResponse({ type: UsersListResponse })
  findAll(@Query() query: GetUsersListQueryParams): Promise<UsersListResponse> {
    const { page = 1, size = 10 } = query;
    return this.usersService.findAll(Number(page), Number(size));
  }

  @Get('/profile')
  @ApiOkResponse({ type: UserProfileResponse })
  getUser(@Request() req): Promise<UserProfileResponse> {
    const userId: number = req.user.id;
    return this.usersService.findOne(userId);
  }

  @Patch('/:id/update')
  @ApiOkResponse({ type: DefaultResponse })
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<DefaultResponse> {
    return this.usersService.update(updateUserDto, Number(id));
  }

  @Delete('/:id/remove')
  @ApiOkResponse({ type: DefaultResponse })
  remove(@Param('id') id: string): Promise<DefaultResponse> {
    return this.usersService.remove(id);
  }
}
