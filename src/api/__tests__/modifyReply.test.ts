import { expect, jest } from '@jest/globals'
import { marketplaceApi } from '../index'
import { IReply } from '../../interfaces/IReply'
import { modifyReply } from '../modifyReply'

jest.mock('../index', () => ({
  marketplaceApi: {
    post: jest.fn(),
  },
}))

const mockedMarketplaceApi = marketplaceApi as jest.MockedFunction<
  typeof marketplaceApi
>

describe('modifyReply', () => {
  it('should modify a reply in marketplace api', async () => {
    const TIMESTAMP = '2343254.345345'
    const API_URL = '/api/bot/reply/'
    const EXPECTED_URL = API_URL + TIMESTAMP
    const newReply: IReply = {
      authorId: 'author-id',
      text: 'reply-text',
      threadTS: '234234.456456',
      timestamp: '2343254.345345',
      username: 'slack-username',
    }
    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } })
    await modifyReply(TIMESTAMP, newReply)
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.post).toHaveBeenCalledWith(EXPECTED_URL, newReply)
  })
})
