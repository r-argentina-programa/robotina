import { marketplaceApi } from '.'
import { IReply } from '../interfaces/IReply'

export const submitReply = async (reply: IReply) => {
  const response = (await marketplaceApi.post('/api/reply', reply)).data
  return response
}
