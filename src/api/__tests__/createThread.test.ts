import { expect, jest } from '@jest/globals'
import { createThread, ICreateThread } from '../createThread'
import { marketplaceApi } from '../index'

jest.mock('../index', () => ({
  marketplaceApi: {
    post: jest.fn(),
  },
}))

const mockedMarketplaceApi = marketplaceApi as jest.MockedFunction<
  typeof marketplaceApi
>

describe('createThread', () => {
  it('should submit a new thread to marketplace api', async () => {
    const API_URL = '/api/thread'
    const newThread: ICreateThread = {
      authorId: 'slack-id-string',
      studentId: 1,
      taskId: 1,
      text: 'test-text',
      timestamp: '2342345.0345',
    }
    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } })
    await createThread(newThread)
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.post).toHaveBeenCalledWith(API_URL, newThread)
  })
})
