import { AxiosResponse } from 'axios';
import { marketplaceApi } from '.';
import { IReply } from '../interfaces/IReply';

export const submitReply = async (reply: IReply) => {
  const { data } = (await marketplaceApi.post(
    '/api/reply',
    reply
  )) as AxiosResponse<IReply>;
  return data;
};
