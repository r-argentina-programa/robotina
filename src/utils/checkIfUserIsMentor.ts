import { IUserResponse } from '../api/marketplace/user/IUserResponse';

export const checkIfUserIsMentor = (user: IUserResponse) =>
  user.roles.includes('Student');
