import { SetMetadata } from '@nestjs/common';

import { EnumUserRole } from 'users/interfaces/users.interface';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EnumUserRole[]) => SetMetadata(ROLES_KEY, roles);
