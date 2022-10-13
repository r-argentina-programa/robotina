import { marketplaceApi } from '.'

export const verifyIfUserExists = async (authUserId: string) => {
  const { data } = await marketplaceApi.get(
    `${process.env.API_URL}/api/bot/profile/${authUserId}`
  )
  return data
}
