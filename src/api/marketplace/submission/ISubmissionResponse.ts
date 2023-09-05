export interface ISubmissionResponse {
  id: number;
  taskId: number;
  studentId: number;
  completed: boolean;
  viewer?: any;
  delivery: string;
  isActive: boolean;
}
