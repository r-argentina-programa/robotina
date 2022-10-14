import { expect, jest, test } from '@jest/globals'
import { sendSubmission } from '../sendSubmission'
import { marketplaceApi } from '../index'
import { ISubmission } from '../../interfaces/ISubmission'

jest.mock('../index', () => {
  return {
    marketplaceApi: {
      post: jest.fn(),
    },
  }
})

const mockedMarketplaceApi = marketplaceApi as jest.MockedFunction<
  typeof marketplaceApi
>

describe('createThread', () => {
  it('should submit a new thread to marketplace api', async () => {
    const API_URL = '/api/bot/submission'
    const newSubmission: ISubmission = {
      delivery: 'new-submission-delivery',
      lessonId: 1,
      userExternalId: 'user-external-id',
    }
    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } })
    await sendSubmission(newSubmission)
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.post).toHaveBeenCalledWith(API_URL, newSubmission)
  })
})
