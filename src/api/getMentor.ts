import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { IUser } from '../interfaces/marketplaceApi/user'

export const getMentor = async (externalId: string) => {
  const { data } = (await marketplaceApi.get(
    `/api/user?filter[externalId]=${externalId}`
  )) as AxiosResponse<IUser[]>
  return data
}