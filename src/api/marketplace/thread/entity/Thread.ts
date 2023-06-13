import { Reply } from '../../reply/entity/Reply';
import { Student } from '../../student/entity/Student';
import { Task } from '../../task/entity/Task';

export interface Thread {
  id: number;
  authorId: string;
  text: string;
  timestamp: string;
  studentId: number;
  taskId: number;
  student?: Student;
  task?: Task;
  replies?: Reply[];
}
