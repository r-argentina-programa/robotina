import { marketplaceApi } from '.'
import { IReply } from '../interfaces/IReply'

export const submitReply = async (reply: IReply) => {
  const { data } = await marketplaceApi.post('/api/reply', reply)
  return data
}
