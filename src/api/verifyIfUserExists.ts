import { marketplaceApi } from '.'

export const verifyIfUserExists = async (authUserId: string) => {
  const { data } = await marketplaceApi.get(`/api/bot/profile/${authUserId}`)
  return data
}
