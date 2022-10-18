import { expect, jest } from '@jest/globals'
import { IUploadTarea, uploadTarea } from '../tarea/uploadTarea'
import { sendSubmission } from '../../api/sendSubmission'
import { sendSubmissionAndUserCreation } from '../../api/sendSubmissionAndUserCreation'
import { verifyIfUserExists } from '../../api/verifyIfUserExists'

jest.mock('../../api/sendSubmission', () => ({
  sendSubmission: jest.fn(),
}))

jest.mock('../../api/sendSubmissionAndUserCreation', () => ({
  sendSubmissionAndUserCreation: jest.fn(),
}))

jest.mock('../../api/verifyIfUserExists', () => ({
  verifyIfUserExists: jest.fn(),
}))

const mockedVerifyIfUserExists = verifyIfUserExists as jest.Mocked<
  typeof verifyIfUserExists
>

const mockedSendSubmission = sendSubmission as jest.Mocked<
  typeof sendSubmission
>

const mockedSendSubmissionAndUserCreation =
  sendSubmissionAndUserCreation as jest.Mocked<
    typeof sendSubmissionAndUserCreation
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
    userId: 'mockId',
    delivery: 'mockTarea',
    classNumber: '12',
    firstName: 'john',
    lastName: 'doe',
    email: 'fake@email.com',
  }

  it('should just send submission + user id ', async () => {
    mockedVerifyIfUserExists.mockResolvedValueOnce(true)
    await uploadTarea(MOCKED_TAREA)
    expect(mockedSendSubmission).toHaveBeenCalledTimes(1)
  })

  it("should send submission and create user if it doesn't exist ", async () => {
    mockedVerifyIfUserExists.mockResolvedValueOnce(false)
    mockedSendSubmissionAndUserCreation.mockResolvedValueOnce({
      taskId: 11,
      studentId: 11,
      completed: false,
      viewer: null,
      delivery: 'https://github.com/r-argentina-programa/robotina',
      deletedAt: null,
      id: 20,
      createdAt: '2022-10-06T11:33:58.000Z',
      updatedAt: '2022-10-06T11:33:58.000Z',
    })

    const returnedValues = await uploadTarea(MOCKED_TAREA)
    expect(mockedSendSubmissionAndUserCreation).toHaveBeenCalledTimes(1)
    expect(returnedValues).toEqual(EXPECTED_AXIOS_DATA)
  })

  it('should throw error when gets bad response', async () => {
    const ERROR = new Error('test error')
    mockedVerifyIfUserExists.mockResolvedValue({ data: true })
    mockedSendSubmissionAndUserCreation.mockRejectedValueOnce(ERROR)

    try {
      await uploadTarea(MOCKED_TAREA)
    } catch (err) {
      expect(err).toEqual(Error())
    }
  })
})
