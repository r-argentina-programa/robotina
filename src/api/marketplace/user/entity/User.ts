import { Student } from '../../student/entity/Student';
import { Role } from './Role';

export interface User {
  id: number;
  username: string;
  externalId: string;
  roles: Role[];
  student?: Student;
}
