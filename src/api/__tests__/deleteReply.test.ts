import { expect, jest } from '@jest/globals'
import { marketplaceApi } from '../index'
import { deleteReply } from '../deleteReply'

jest.mock('../index')

const mockedMarketplaceApi = jest.mocked(marketplaceApi)

describe('deleteReply', () => {
  it('should delete a reply in marketplace api', async () => {
    const TIMESTAMP = '2343254.345345'
    const API_URL = '/api/bot/reply/'
    const EXPECTED_URL = API_URL + TIMESTAMP
    mockedMarketplaceApi.delete.mockResolvedValue({ data: { success: true } })
    const response = await deleteReply(TIMESTAMP)
    expect(marketplaceApi.delete).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.delete).toHaveBeenCalledWith(EXPECTED_URL)
    expect(response.success).toBe(true)
  })
})
