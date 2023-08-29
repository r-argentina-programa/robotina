import { IStudentResponse } from '../student/IStudentResponse';

export interface IUserResponse {
  id: number;
  username: string;
  externalId: string;
  roles: string[];
  student?: IStudentResponse;
}
