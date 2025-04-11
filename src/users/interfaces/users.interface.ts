import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../models/users.model';

import { DefaultResponse } from 'common/interfaces/interface';

export enum EnumUserRole {
  GUEST = 'guest',
  USER = 'user',
  MODERATOR = 'moderator',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export const EnumUserRoleNames = {
  [EnumUserRole.GUEST]: 'Гость',
  [EnumUserRole.USER]: 'Пользователь',
  [EnumUserRole.MODERATOR]: 'Модератор',
  [EnumUserRole.EMPLOYEE]: 'Сотрудник',
  [EnumUserRole.ADMIN]: 'Администратор',
  [EnumUserRole.SUPER_ADMIN]: 'Супер-администратор',
};

export class UserResponseData implements Omit<IUser, 'password'> {
  @ApiProperty()
  id: number;
  @ApiProperty()
  email: string;
  @ApiProperty({
    enum: EnumUserRole,
    enumName: 'EnumUserRole',
    description: 'Роль пользователя',
    examples: Object.values(EnumUserRole),
  })
  role: EnumUserRole;
}

class UsersListMeta {
  @ApiProperty({ example: 120 })
  totalCount: number;
  @ApiProperty({ example: 2 })
  page: number;
  @ApiProperty({ example: 10 })
  size: number;
  @ApiProperty({ example: 12 })
  totalPages: number;
}

export class UsersListResponse extends DefaultResponse {
  @ApiProperty({ type: [UserResponseData] })
  data: UserResponseData[];
  @ApiProperty({ type: UsersListMeta })
  meta: UsersListMeta;
}

export interface GetUsersListQueryParams {
  page: number;
  size: number;
}

export class UserProfileResponse extends DefaultResponse {
  @ApiProperty({ type: UserResponseData })
  data: UserResponseData;
}
