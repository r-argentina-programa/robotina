import { IReplyResponse } from '../reply/IReplyResponse';
import { IStudentResponse } from '../student/IStudentResponse';
import { ITaskResponse } from '../task/ITaskResponse';

export interface IThreadResponse {
  id: number;
  authorId: string;
  text: string;
  timestamp: string;
  studentId: number;
  taskId: number;
  student?: IStudentResponse;
  task?: ITaskResponse;
  replies?: IReplyResponse[];
}
