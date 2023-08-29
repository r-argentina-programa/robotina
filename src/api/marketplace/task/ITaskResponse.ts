export interface ITaskResponse {
  id: number;
  title: string;
  lessonId: number;
  statement?: string;
  description: string;
  spoilerVideo?: string;
  resolutionType: string;
}
