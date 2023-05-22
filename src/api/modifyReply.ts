import { AxiosResponse } from 'axios';
import { marketplaceApi } from '.';
import { IReply } from '../interfaces/IReply';

export type IModifyReply = Omit<IReply, 'threadTS' | 'authorId'>;

export const modifyReply = async (timestamp: string, reply: IModifyReply) => {
  const { data } = (await marketplaceApi.post(
    `/api/bot/reply/${timestamp}`,
    reply
  )) as AxiosResponse<IReply>;
  return data;
};
