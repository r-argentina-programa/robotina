import { createAuth0Id } from '../../utils/createAuth0Id'
import { sendSubmission } from '../../api/sendSubmission'
import { getUser } from '../../api/getUser'
import { ISubmission } from '../../interfaces/ISubmission'
import { getTasks } from '../../api/getTasks'
import { createUserStudent, ICreateUserStudent } from '../../api/createStudent'

export interface IUploadTarea {
  slackId: string
  delivery: string
  classNumber: string
  firstName: string | undefined
  lastName: string | undefined
  email: string
}

export const uploadTarea = async ({
  classNumber,
  delivery,
  email,
  firstName,
  lastName,
  slackId,
}: IUploadTarea) => {
  const auth0Id = createAuth0Id(slackId)
  try {
    let submission: ISubmission
    const userResponse = await getUser(auth0Id)
    const taskResponse = await getTasks(classNumber)

    if (!taskResponse.length) {
      throw new Error('Task not found')
    }
    const taskId = taskResponse[0]!.id
    if (!userResponse.length) {
      console.log('usuario nuevo')
      const user: ICreateUserStudent = {
        firstName: firstName || email,
        email,
        externalId: auth0Id,
        lastName: lastName || email,
        roles: 'Student',
      }
      const student = await createUserStudent(user)

      submission = {
        taskId,
        studentId: student.id,
        delivery,
      }

      return await sendSubmission(submission)
    }
    console.log('usuario ya existe')
    const studentId = userResponse[0].student!.id
    submission = {
      taskId,
      studentId,
      delivery,
    }
    return await sendSubmission(submission)
  } catch (error) {
    console.log(error)
    throw error
  }
}
