import { marketplaceApi } from '.'
import { ISubmission } from '../interfaces/ISubmission'

export const sendSubmission = async (submission: ISubmission) => {
  const { data } = await marketplaceApi.post('/api/bot/submission', submission)
  return data
}
