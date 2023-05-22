export interface ITask {
  id: number;
  lessonId: number;
  title: string;
  statement: string;
  description: string;
  spoilerVideo: string;
  resolutionType: 'Link' | 'Code';
}
