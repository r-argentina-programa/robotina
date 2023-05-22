import { AxiosResponse } from 'axios';
import { marketplaceApi } from '.';

export const deleteReply = async (timestamp: string) => {
  const { data } = (await marketplaceApi.delete(
    `/api/bot/reply/${timestamp}`
  )) as AxiosResponse<boolean>;
  return data;
};
