export interface ISubmissionResponse {
  id: number;
  fkTaskId: number;
  fkStudentId: number;
  completed: boolean;
  viewer?: any;
  delivery: string;
  isActive: boolean;
}
