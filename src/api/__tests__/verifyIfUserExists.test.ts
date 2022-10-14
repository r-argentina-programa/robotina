import { expect, jest, test } from '@jest/globals'
import { marketplaceApi } from '../index'
import { verifyIfUserExists } from '../verifyIfUserExists'

jest.mock('../index', () => {
  return {
    marketplaceApi: {
      get: jest.fn(),
    },
  }
})

const mockedMarketplaceApi = marketplaceApi as jest.MockedFunction<
  typeof marketplaceApi
>

describe('verifyIfUserExists', () => {
  it('should check in marketplace api if user exists', async () => {
    const USER_ID = 'USER_ID'
    const API_URL = `/api/bot/profile/`
    mockedMarketplaceApi.get.mockResolvedValue({ data: { success: true } })
    await verifyIfUserExists(USER_ID)
    expect(marketplaceApi.get).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.get).toHaveBeenCalledWith(API_URL + USER_ID)
  })
})
