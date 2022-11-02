import { AxiosResponse} from 'axios'
import { marketplaceApi } from '.'
import { User } from '../interfaces/marketplaceApi/user'

export const getUser = async (externalId: string) => {
  const { data } = (await marketplaceApi(
    `/api/user?filter[externalId]=${externalId}&include[student]=true`
  )) as AxiosResponse<User[]>
  return data
}
