import { ApiProperty } from '@nestjs/swagger';

import { DefaultResponse } from 'common/interfaces/interface';
import { IUser } from 'users/models/users.model';
import { EnumUserRole } from 'users/interfaces/users.interface';

export class AuthTokens {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}

export class SignInResponse extends DefaultResponse {
  @ApiProperty()
  accessToken: string;
}

class ProfileUserResponseData implements Pick<IUser, 'id' | 'role' | 'email'> {
  @ApiProperty()
  id: number;
  @ApiProperty()
  role: EnumUserRole;
  @ApiProperty()
  email: string;
}

export class ProfileUserResponse extends DefaultResponse {
  @ApiProperty({ type: ProfileUserResponseData })
  data: ProfileUserResponseData;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: EnumUserRole;
  iat?: number;
  exp?: number;
}

export class AuthRefreshRequestBody {
  @ApiProperty()
  refreshToken: string;
}
