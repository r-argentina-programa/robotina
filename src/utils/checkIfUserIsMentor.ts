import { Role } from '../api/marketplace/user/entity/Role';
import { User } from '../api/marketplace/user/entity/User';

export const checkIfUserIsMentor = (user: User) =>
  user.roles.includes(Role.MENTOR);
