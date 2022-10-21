import { IReply } from './IReply'

export type IModifyReply = Omit<IReply, 'threadTS' | 'authorId'>
