import { marketplaceApi } from '.'
import { IFullSubmission } from '../interfaces/IFullSubmission'

export const sendSubmissionAndUserCreation = async (
  submission: IFullSubmission
) => {
  const { data } = await marketplaceApi.post(
    '/api/bot/profile-submission',
    submission
  )
  return data
}
