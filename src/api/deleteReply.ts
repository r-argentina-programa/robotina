import { marketplaceApi } from '.'

export const deleteReply = async (timestamp: string) => {
  const { data } = await marketplaceApi.delete(`/api/bot/reply/${timestamp}`)
  return data
}
