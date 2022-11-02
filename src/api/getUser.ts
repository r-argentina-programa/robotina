import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { IUser } from '../interfaces/marketplaceApi/user'

export const getUser = async (externalId: string) => {
  const { data } = (await marketplaceApi.get(
    `/api/user?filter[externalId]=${externalId}&include[student]=true`
  )) as AxiosResponse<IUser[]>
  return data
}
