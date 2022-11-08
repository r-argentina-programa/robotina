import { getMentor } from "../getMentor";
import { marketplaceApi } from '../index'

jest.mock('..')

const mockedMarketplaceApi = jest.mocked(marketplaceApi)

describe('getUser', () => {
  it('should call marketplace api once', async () => {
    const EXTERNAL_ID = '12345'
    const MOCKED_DATA = { success: true }
    mockedMarketplaceApi.get.mockResolvedValueOnce({ data: MOCKED_DATA })
    const response = await getMentor(EXTERNAL_ID)
    expect(response).toBe(MOCKED_DATA)
  })
})
