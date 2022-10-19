import { marketplaceApi } from '.'
import { IModifyReply } from '../interfaces/IModifyReply'

export const modifyReply = async (timestamp: string, reply: IModifyReply) => {
  const { data } = await marketplaceApi.post(`/api/reply/${timestamp}`, reply)
  return data
}
