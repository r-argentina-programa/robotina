import { ICreateReplyDto } from './ICreateReplyDto';

export interface IUpdateReplyDto
  extends Omit<ICreateReplyDto, 'threadTS' | 'authorId'> {}
