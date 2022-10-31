import { expect, jest } from '@jest/globals'
import { marketplaceApi } from '../index'
import { verifyIfUserExists } from '../verifyIfUserExists'

jest.mock('../index')

const mockedMarketplaceApi = jest.mocked(marketplaceApi)

describe('verifyIfUserExists', () => {
  it('should check if user exists in marketplace api ', async () => {
    const USER_ID = 'USER_ID'
    const API_URL = `/api/bot/profile/`
    mockedMarketplaceApi.get.mockResolvedValue({ data: { success: true } })
    await verifyIfUserExists(USER_ID)
    expect(marketplaceApi.get).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.get).toHaveBeenCalledWith(API_URL + USER_ID)
  })
})
