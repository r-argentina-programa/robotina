import { Role } from '../entity/Role';

export interface CreateUserDto {
  username?: string;
  externalId: string;
  roles: Role[];
}
