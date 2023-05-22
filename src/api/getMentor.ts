import { AxiosResponse } from 'axios';
import { marketplaceApi } from '.';
import { IGetUserResponse } from './getUser';

export const getMentor = async (externalId: string) => {
  const { data } = (await marketplaceApi.get(
    `/api/user?filter[externalId]=${externalId}`
  )) as AxiosResponse<IGetUserResponse>;
  return data.results;
};
