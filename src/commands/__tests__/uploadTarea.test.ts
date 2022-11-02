import { expect, jest } from '@jest/globals'
import { IUploadTarea, uploadTarea } from '../tarea/uploadTarea'
import { sendSubmission } from '../../api/sendSubmission'
import { getUser } from '../../api/getUser'
import { IUser } from '../../interfaces/marketplaceApi/user'

jest.mock('../../api/sendSubmission')

jest.mock('../../api/sendSubmissionAndUserCreation')

jest.mock('../../api/getUser')

const mockedGetUser = getUser as jest.Mocked<typeof getUser>

const mockedSendSubmission = sendSubmission as jest.Mocked<
  typeof sendSubmission
>

const EXPECTED_AXIOS_DATA = {
  taskId: 11,
  studentId: 11,
  completed: false,
  viewer: null,
  delivery: 'https://github.com/r-argentina-programa/robotina',
  deletedAt: null,
  id: 20,
  createdAt: '2022-10-06T11:33:58.000Z',
  updatedAt: '2022-10-06T11:33:58.000Z',
}

describe('uploadTarea test', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  const MOCKED_TAREA: IUploadTarea = {
    slackId: 'mockId',
    delivery: 'mockTarea',
    classNumber: '12',
    firstName: 'john',
    lastName: 'doe',
    email: 'fake@email.com',
  }

  const MOCKED_USER: IUser = {
    externalId: 'external-id-test',
    id: 1,
    roles: 'Student',
    username: 'username-test',
    student: {
      email: 'mail@mail.com',
      firstName: 'firstname',
      id: 1,
      lastName: 'lastname',
    },
  }

  it('should just send submission + user id ', async () => {
    expect.assertions(1)
    mockedGetUser.mockResolvedValueOnce([MOCKED_USER])
    await uploadTarea(MOCKED_TAREA)
    expect(mockedSendSubmission).toHaveBeenCalledTimes(1)
  })

  it("should send submission and create user if it doesn't exist ", async () => {
    expect.assertions(2)
    mockedGetUser.mockResolvedValueOnce([])
    // mockedSendSubmissionAndUserCreation.mockResolvedValueOnce({
    //   taskId: 11,
    //   studentId: 11,
    //   completed: false,
    //   viewer: null,
    //   delivery: 'https://github.com/r-argentina-programa/robotina',
    //   deletedAt: null,
    //   id: 20,
    //   createdAt: '2022-10-06T11:33:58.000Z',
    //   updatedAt: '2022-10-06T11:33:58.000Z',
    // })

    const returnedValues = await uploadTarea(MOCKED_TAREA)
    // expect(mockedSendSubmissionAndUserCreation).toHaveBeenCalledTimes(1)
    expect(returnedValues).toEqual(EXPECTED_AXIOS_DATA)
  })

  it('should throw error when gets bad response', async () => {
    expect.assertions(1)
    const ERROR = new Error()
    mockedGetUser.mockResolvedValue([])
    // mockedSendSubmissionAndUserCreation.mockRejectedValueOnce(ERROR)

    try {
      await uploadTarea(MOCKED_TAREA)
    } catch (err) {
      expect(err).toEqual(ERROR)
    }
  })
})
