import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { IUser } from '../interfaces/IUser'

export interface IGetUserResponse {
  count: number
  next: string | null
  previous: string | null
  results: IUser[]
}

export const getUser = async (externalId: string) => {
  const { data } = (await marketplaceApi.get(
    `/api/user?filter[externalId]=${externalId}&include[student]=true`
  )) as AxiosResponse<IGetUserResponse>
  return data.results
}
