export interface Submission {
  id: number;
  fkTaskId: number;
  fkStudentId: number;
  completed: boolean;
  viewer?: any;
  delivery: string;
  isActive: boolean;
}
