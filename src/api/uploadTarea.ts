import { IFullSubmission } from '../interfaces/IFullSubmission'
import { createAuth0Id } from '../utils/createAuth0Id'
import { sendSubmission } from './sendSubmission'
import { sendSubmissionAndUserCreation } from './sendSubmissionAndUserCreation'
import { verifyIfUserExists } from './verifyIfUserExists'

export interface IUploadTarea {
  userId: string
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
  const authOUserId = createAuth0Id(userId)
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
