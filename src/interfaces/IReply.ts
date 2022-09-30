import { IMessage } from './IMessage'

export interface IReply extends IMessage {
  threadId: string
  user: string
}
