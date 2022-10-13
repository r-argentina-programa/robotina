import axios from 'axios'
import { marketplaceApi } from '.'
import { IFullSubmission } from '../interfaces/IFullSubmission'
import { ISubmission } from '../interfaces/ISubmission'

interface IUploadTarea {
  userId: string | undefined
  delivery: string
  classNumber: string
  firstName: string | undefined
  lastName: string | undefined
  email: string | undefined
}

export const uploadTarea = async ({
  classNumber,
  delivery,
  email,
  firstName,
  lastName,
  userId,
}: IUploadTarea) => {
  const authOUserId = `oauth2|slack|${process.env.SLACK_TEAM_ID}-${userId}`
  try {
    const user = await getExistentUser(authOUserId)
    if (user) {
      const submission = {
        lessonId: Number(classNumber),
        userExternalId: authOUserId,
        delivery,
      }
      return sendSubmission(submission)
    } else {
      const fullSubmission: IFullSubmission = {
        lessonId: Number(classNumber),
        firstName,
        lastName,
        email,
        delivery,
      }
      return sendUserAndSubmission(fullSubmission)
    }
  } catch (error) {
    throw new Error()
  }
}

const getExistentUser = async (authUserId: string) => {
  const { data } = await axios.get(
    `${process.env.API_URL}/api/user/id/${authUserId}`
  )
  return data
}

const sendSubmission = async (submission: ISubmission) => {
  const { data } = await marketplaceApi.post('/api/bot/submission', submission)
  return data
}

const sendUserAndSubmission = async (submission: IFullSubmission) => {
  const { data } = await marketplaceApi.post(
    '/api/bot/profile-submission',
    submission
  )
  return data
}
