import { expect, jest } from '@jest/globals'
import { sendSubmission } from '../sendSubmission'
import { marketplaceApi } from '../index'
import { ISubmission } from '../../interfaces/ISubmission'

jest.mock('../index')

const mockedMarketplaceApi = jest.mocked(marketplaceApi)

describe('sendSubmission', () => {
  it('should send a submission to marketplace api', async () => {
    const API_URL = '/api/submission'
    const newSubmission: ISubmission = {
      delivery: 'new-submission-delivery',
      taskId: 1,
      studentId: 1,
    }
    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } })
    await sendSubmission(newSubmission)
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.post).toHaveBeenCalledWith(API_URL, newSubmission)
  })
})
