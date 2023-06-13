import { ResolutionType } from './ResolutionType';

export interface Task {
  id: number;
  title: string;
  lessonId: number;
  statement?: string;
  description: string;
  spoilerVideo?: string;
  resolutionType: ResolutionType;
}
