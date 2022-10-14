import { IFullSubmission } from '../interfaces/IFullSubmission'
import { sendSubmission } from './sendSubmission'
import { sendSubmissionAndUserCreation } from './sendSubmissionAndUserCreation'
import { verifyIfUserExists } from './verifyIfUserExists'

export interface IUploadTarea {
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
    const user = await verifyIfUserExists(authOUserId)
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
        userExternalId: authOUserId,
        firstName,
        lastName,
        email,
        delivery,
      }
      return sendSubmissionAndUserCreation(fullSubmission)
    }
  } catch (error) {
    //@ts-ignore
    console.log(error.response)
    throw new Error()
  }
}
