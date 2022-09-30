import { IReply } from '../interfaces/IReply'

export const submitReply = async (reply: IReply) => {
  const response = await Promise.resolve({ ok: true, reply })
  return response
}
