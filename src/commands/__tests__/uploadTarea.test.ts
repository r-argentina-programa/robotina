import { expect, jest } from '@jest/globals';
import { IUploadTarea, uploadTarea } from '../tarea/uploadTarea';
import taskApi from '../../api/marketplace/task/TaskApi';
import userApi from '../../api/marketplace/user/userApi';
import submissionApi from '../../api/marketplace/submission/submissionApi';
import studentApi from '../../api/marketplace/student/studentApi';
import { IStudentResponse } from '../../api/marketplace/student/IStudentResponse';
import { ITaskResponse } from '../../api/marketplace/task/ITaskResponse';
import { ISubmissionResponse } from '../../api/marketplace/submission/ISubmissionResponse';
import { ICreateStudentDto } from '../../api/marketplace/student/ICreateStudentDto';
import { ICreateUserDto } from '../../api/marketplace/user/ICreateUserDto';
import { IUserResponse } from '../../api/marketplace/user/IUserResponse';

jest.mock('../../api/marketplace/submission/submissionApi');
jest.mock('../../api/marketplace/user/userApi');
jest.mock('../../api/marketplace/student/studentApi');
jest.mock('../../api/marketplace/task/TaskApi');

const mockedUserGetAll = userApi.getAllPaginated as jest.Mocked<
  typeof userApi.getAllPaginated
>;
const mockedStudentApiCreate = studentApi.create as jest.Mocked<
  typeof studentApi.create
>;
const mockedTaskApiGetAll = taskApi.getAllPaginated as jest.Mocked<
  typeof taskApi.getAllPaginated
>;
const mockedSubmissionApiCreate = submissionApi.create as jest.Mocked<
  typeof submissionApi.create
>;
const mockedUserCreate = userApi.create as jest.Mocked<typeof userApi.create>;

const EXPECTED_AXIOS_DATA: ISubmissionResponse = {
  taskId: 11,
  studentId: 11,
  completed: false,
  viewer: null,
  delivery: 'https://github.com/r-argentina-programa/robotina',
  id: 20,
  isActive: true,
};

describe('uploadTarea test', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  const MOCKED_TAREA: IUploadTarea = {
    slackId: 'mockId',
    delivery: 'mockTarea',
    classNumber: '12',
    firstName: 'john',
    lastName: 'doe',
    email: 'fake@email.com',
  };

  const MOCKED_USER: IUserResponse = {
    externalId: 'external-id-test',
    id: 1,
    roles: ['Student'],
    username: 'username-test',
    student: {
      email: 'mail@mail.com',
      firstName: 'firstname',
      id: 1,
      lastName: 'lastname',
    },
  };

  const MOCKED_TASK: ITaskResponse = {
    id: 3,
    resolutionType: 'Code',
    title: 'test-title',
    description: 'test-description',
    lessonId: 1,
    spoilerVideo: 'test-spoiler-video',
    statement: 'test-statement',
  };

  const MOCKED_STUDENT: IStudentResponse = {
    email: 'test-email',
    firstName: 'firstName-test',
    id: 1,
    lastName: 'lastName-test',
  };

  it('should just send submission + user id ', async () => {
    expect.assertions(3);
    mockedUserGetAll.mockResolvedValueOnce({
      data: [MOCKED_USER],
      meta: { itemCount: 1, pageCount: 1, page: 1, take: 10 },
    });

    mockedTaskApiGetAll.mockResolvedValueOnce({
      data: [MOCKED_TASK],
      meta: { itemCount: 1, pageCount: 1, page: 1, take: 10 },
    });
    await uploadTarea(MOCKED_TAREA);
    expect(mockedTaskApiGetAll).toHaveBeenCalledTimes(1);
    expect(mockedUserGetAll).toHaveBeenCalledTimes(1);
    expect(mockedSubmissionApiCreate).toHaveBeenCalledTimes(1);
  });

  it("should send submission and create user if it doesn't exist ", async () => {
    expect.assertions(5);
    mockedUserGetAll.mockResolvedValueOnce({
      data: [],
      meta: { itemCount: 0, pageCount: 1, page: 1, take: 10 },
    });
    mockedUserCreate.mockResolvedValueOnce(MOCKED_USER);
    mockedStudentApiCreate.mockResolvedValue(MOCKED_STUDENT);
    mockedTaskApiGetAll.mockResolvedValueOnce({
      data: [MOCKED_TASK],
      meta: { itemCount: 1, pageCount: 1, page: 1, take: 10 },
    });

    mockedSubmissionApiCreate.mockResolvedValueOnce({
      taskId: 11,
      studentId: 11,
      completed: false,
      viewer: null,
      delivery: 'https://github.com/r-argentina-programa/robotina',
      id: 20,
      isActive: true,
    });

    const submission = await uploadTarea(MOCKED_TAREA);
    expect(mockedTaskApiGetAll).toHaveBeenCalledTimes(1);
    expect(mockedUserGetAll).toHaveBeenCalledTimes(1);
    expect(mockedUserCreate).toHaveBeenCalledTimes(1);
    expect(mockedStudentApiCreate).toHaveBeenCalledTimes(1);
    expect(submission).toEqual(EXPECTED_AXIOS_DATA);
  });

  it('should create an user with email as username and lastname when username and lastname is undefined', async () => {
    const MOCKED_SLACK_TEAM_ID = 'test-slack-id';
    process.env.SLACK_TEAM_ID = MOCKED_SLACK_TEAM_ID;
    expect.assertions(2);
    const MOCKED_TAREA_WITH_UNDEFINED_USERNAME_AND_LASTNAME: IUploadTarea = {
      slackId: 'mockId',
      delivery: 'mockTarea',
      classNumber: '12',
      firstName: undefined,
      lastName: undefined,
      email: 'fake@email.com',
    };
    mockedUserGetAll.mockResolvedValueOnce({
      data: [],
      meta: { itemCount: 0, pageCount: 1, page: 1, take: 10 },
    });
    mockedUserCreate.mockResolvedValueOnce(MOCKED_USER);
    mockedStudentApiCreate.mockResolvedValue(MOCKED_STUDENT);
    mockedTaskApiGetAll.mockResolvedValueOnce({
      data: [MOCKED_TASK],
      meta: { itemCount: 1, pageCount: 1, page: 1, take: 10 },
    });
    await uploadTarea(MOCKED_TAREA_WITH_UNDEFINED_USERNAME_AND_LASTNAME);

    const expectedUser: ICreateUserDto = {
      roles: ['Student'],
      username: undefined,
      externalId: `oauth2|sign-in-with-slack|${MOCKED_SLACK_TEAM_ID}-mockId`,
    };

    const expectedStudent: ICreateStudentDto = {
      userId: 1,
      email: 'fake@email.com',
      firstName: 'fake@email.com',
      lastName: 'fake@email.com',
    };

    expect(mockedUserCreate).toHaveBeenCalledWith(expectedUser);
    expect(mockedStudentApiCreate).toHaveBeenCalledWith(expectedStudent);
  });

  it('should throw error when gets bad response', async () => {
    expect.assertions(1);
    const ERROR = new Error();
    mockedUserGetAll.mockRejectedValueOnce(ERROR);
    try {
      await uploadTarea(MOCKED_TAREA);
    } catch (err) {
      expect(err).toEqual(ERROR);
    }
  });

  it('should throw when task with given lesson id is not found', async () => {
    const EXPECTED_ERROR = new Error('Task not found');
    mockedUserGetAll.mockResolvedValueOnce({
      data: [MOCKED_USER],
      meta: { itemCount: 1, pageCount: 1, page: 1, take: 10 },
    });
    mockedTaskApiGetAll.mockResolvedValueOnce({
      data: [],
      meta: { itemCount: 0, pageCount: 1, page: 1, take: 10 },
    });
    try {
      await uploadTarea(MOCKED_TAREA);
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR);
    }
  });
});
