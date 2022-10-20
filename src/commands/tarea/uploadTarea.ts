import { IFullSubmission } from '../../interfaces/IFullSubmission'
import { createAuth0Id } from '../../utils/createAuth0Id'
import { sendSubmission } from '../../api/sendSubmission'
import { sendSubmissionAndUserCreation } from '../../api/sendSubmissionAndUserCreation'
import { verifyIfUserExists } from '../../api/verifyIfUserExists'

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
      return await sendSubmission(submission)
    }
    const fullSubmission: IFullSubmission = {
      lessonId: Number(classNumber),
      userExternalId: authOUserId,
      firstName,
      lastName,
      email,
      delivery,
    }
    return await sendSubmissionAndUserCreation(fullSubmission)
  } catch (error) {
    // @ts-ignore
    throw new Error()
  }
}