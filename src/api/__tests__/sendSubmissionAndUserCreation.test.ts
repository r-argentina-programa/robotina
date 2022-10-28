import { expect, jest } from '@jest/globals'
import { marketplaceApi } from '../index'
import { IFullSubmission } from '../../interfaces/IFullSubmission'
import { sendSubmissionAndUserCreation } from '../sendSubmissionAndUserCreation'

jest.mock('../index')

const mockedMarketplaceApi = jest.mocked(marketplaceApi)

describe('sendSubmissionAndUserCreation', () => {
  it('should send a submission with user creation to marketplace api', async () => {
    const API_URL = '/api/bot/profile-submission'
    const newSubmission: IFullSubmission = {
      email: 'test-email@gmail.com',
      firstName: 'firt-name',
      lastName: 'last-name',
      delivery: 'new-submission-delivery',
      lessonId: 1,
      userExternalId: 'user-external-id',
    }
    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } })
    await sendSubmissionAndUserCreation(newSubmission)
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1)
    expect(marketplaceApi.post).toHaveBeenCalledWith(API_URL, newSubmission)
  })
})
