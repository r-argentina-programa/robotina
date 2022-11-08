import { expect, jest } from '@jest/globals'
import { IUploadTarea, uploadTarea } from '../tarea/uploadTarea'
import { sendSubmission } from '../../api/sendSubmission'
import { getUser } from '../../api/getUser'
import { IUser } from '../../interfaces/IUser'
import { createUserStudent, ICreateUserStudent } from '../../api/createStudent'
import { getTasks } from '../../api/getTasks'
import { ITask } from '../../interfaces/ITask'
import { IStudent } from '../../interfaces/IStudent'
import { ISubmission } from '../../interfaces/ISubmission'

jest.mock('../../api/sendSubmission')
jest.mock('../../api/getUser')
jest.mock('../../api/createStudent')
jest.mock('../../api/getTasks')

const mockedGetUser = getUser as jest.Mocked<typeof getUser>
const mockedCreateUserStudent = createUserStudent as jest.Mocked<
  typeof createUserStudent
>
const mockedGetTasks = getTasks as jest.Mocked<typeof getTasks>
const mockedSendSubmission = sendSubmission as jest.Mocked<
  typeof sendSubmission
>

const EXPECTED_AXIOS_DATA: ISubmission = {
  fkTaskId: 11,
  fkStudentId: 11,
  completed: false,
  viewer: null,
  delivery: 'https://github.com/r-argentina-programa/robotina',
  id: 20,
  isActive: true,
}

describe('uploadTarea test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
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

  const MOCKED_TASK: ITask = {
    id: 3,
    resolutionType: 'Code',
    title: 'test-title',
    description: 'test-description',
    lessonId: 1,
    spoilerVideo: 'test-spoiler-video',
    statement: 'test-statement',
  }

  const MOCKED_STUDENT: IStudent = {
    email: 'test-email',
    firstName: 'firstName-test',
    id: 1,
    lastName: 'lastName-test',
  }

  it('should just send submission + user id ', async () => {
    expect.assertions(3)
    mockedGetUser.mockResolvedValueOnce([MOCKED_USER])

    mockedGetTasks.mockResolvedValueOnce([MOCKED_TASK])
    await uploadTarea(MOCKED_TAREA)
    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedGetUser).toHaveBeenCalledTimes(1)
    expect(mockedSendSubmission).toHaveBeenCalledTimes(1)
  })

  it("should send submission and create user if it doesn't exist ", async () => {
    expect.assertions(4)
    mockedGetUser.mockResolvedValueOnce([])
    mockedCreateUserStudent.mockResolvedValue(MOCKED_STUDENT)
    mockedGetTasks.mockResolvedValueOnce([MOCKED_TASK])

    mockedSendSubmission.mockResolvedValueOnce({
      fkTaskId: 11,
      fkStudentId: 11,
      completed: false,
      viewer: null,
      delivery: 'https://github.com/r-argentina-programa/robotina',
      id: 20,
      isActive: true,
    })

    const submission = await uploadTarea(MOCKED_TAREA)
    expect(mockedGetTasks).toHaveBeenCalledTimes(1)
    expect(mockedGetUser).toHaveBeenCalledTimes(1)
    expect(mockedCreateUserStudent).toHaveBeenCalledTimes(1)
    expect(submission).toEqual(EXPECTED_AXIOS_DATA)
  })

  it('should create an user with email as username and lastname when username and lastname is undefined', async () => {
    const MOCKED_SLACK_TEAM_ID = 'test-slack-id'
    process.env.SLACK_TEAM_ID = MOCKED_SLACK_TEAM_ID
    expect.assertions(1)
    const MOCKED_TAREA_WITH_UNDEFINED_USERNAME_AND_LASTNAME: IUploadTarea = {
      slackId: 'mockId',
      delivery: 'mockTarea',
      classNumber: '12',
      firstName: undefined,
      lastName: undefined,
      email: 'fake@email.com',
    }
    mockedGetUser.mockResolvedValueOnce([])
    mockedCreateUserStudent.mockResolvedValue(MOCKED_STUDENT)
    mockedGetTasks.mockResolvedValueOnce([MOCKED_TASK])
    await uploadTarea(MOCKED_TAREA_WITH_UNDEFINED_USERNAME_AND_LASTNAME)
    const EXPECTED_PARAMS: ICreateUserStudent = {
      email: 'fake@email.com',
      firstName: 'fake@email.com',
      lastName: 'fake@email.com',
      roles: 'Student',
      username: undefined,
      externalId: `oauth2|slack|${MOCKED_SLACK_TEAM_ID}-mockId`,
    }
    expect(mockedCreateUserStudent).toHaveBeenCalledWith(EXPECTED_PARAMS)
  })

  it('should throw error when gets bad response', async () => {
    expect.assertions(1)
    const ERROR = new Error()
    mockedGetUser.mockRejectedValueOnce(ERROR)
    try {
      await uploadTarea(MOCKED_TAREA)
    } catch (err) {
      expect(err).toEqual(ERROR)
    }
  })

  it('should throw when task with given lesson id is not found', async () => {
    const EXPECTED_ERROR = new Error('Task not found')
    mockedGetUser.mockResolvedValueOnce([MOCKED_USER])
    mockedGetTasks.mockResolvedValueOnce([])
    try {
      await uploadTarea(MOCKED_TAREA)
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })
})
