import { IMessage } from './IMessage';

export interface IReply extends IMessage {
  threadTS: string;
  username: string;
}
