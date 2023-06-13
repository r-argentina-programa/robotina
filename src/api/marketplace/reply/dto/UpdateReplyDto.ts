import { CreateReplyDto } from './CreateReplyDto';

export interface UpdateReplyDto
  extends Omit<CreateReplyDto, 'threadTS' | 'authorId'> {}
