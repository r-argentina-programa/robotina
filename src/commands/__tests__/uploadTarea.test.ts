import { expect, jest } from '@jest/globals';
import { IUploadTarea, uploadTarea } from '../tarea/uploadTarea';
import taskApi from '../../api/marketplace/task/TaskApi';
import userApi from '../../api/marketplace/user/userApi';
import submissionApi from '../../api/marketplace/submission/submissionApi';
import studentApi from '../../api/marketplace/student/studentApi';
import { User } from '../../api/marketplace/user/entity/User';
import { Role } from '../../api/marketplace/user/entity/Role';
import { Student } from '../../api/marketplace/student/entity/Student';
import { Task } from '../../api/marketplace/task/entity/Task';
import { ResolutionType } from '../../api/marketplace/task/entity/ResolutionType';
import { Submission } from '../../api/marketplace/submission/entity/Submission';
import { CreateStudentDto } from '../../api/marketplace/student/dto/CreateStudentDto';
import { CreateUserDto } from '../../api/marketplace/user/dto/CreateUserDto';

jest.mock('../../api/marketplace/submission/submissionApi');
jest.mock('../../api/marketplace/user/userApi');
jest.mock('../../api/marketplace/student/studentApi');
jest.mock('../../api/marketplace/task/TaskApi');

const mockedUserGetAll = userApi.getAll as jest.Mocked<typeof userApi.getAll>;
const mockedStudentApiCreate = studentApi.create as jest.Mocked<
  typeof studentApi.create
>;
const mockedTaskApiGetAll = taskApi.getAll as jest.Mocked<
  typeof taskApi.getAll
>;
const mockedSubmissionApiCreate = submissionApi.create as jest.Mocked<
  typeof submissionApi.create
>;
const mockedUserCreate = userApi.create as jest.Mocked<typeof userApi.create>;

const EXPECTED_AXIOS_DATA: Submission = {
  fkTaskId: 11,
  fkStudentId: 11,
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

  const MOCKED_USER: User = {
    externalId: 'external-id-test',
    id: 1,
    roles: [Role.STUDENT],
    username: 'username-test',
    student: {
      email: 'mail@mail.com',
      firstName: 'firstname',
      id: 1,
      lastName: 'lastname',
    },
  };

  const MOCKED_TASK: Task = {
    id: 3,
    resolutionType: ResolutionType.CODE,
    title: 'test-title',
    description: 'test-description',
    lessonId: 1,
    spoilerVideo: 'test-spoiler-video',
    statement: 'test-statement',
  };

  const MOCKED_STUDENT: Student = {
    email: 'test-email',
    firstName: 'firstName-test',
    id: 1,
    lastName: 'lastName-test',
  };

  it('should just send submission + user id ', async () => {
    expect.assertions(3);
    mockedUserGetAll.mockResolvedValueOnce([MOCKED_USER]);

    mockedTaskApiGetAll.mockResolvedValueOnce([MOCKED_TASK]);
    await uploadTarea(MOCKED_TAREA);
    expect(mockedTaskApiGetAll).toHaveBeenCalledTimes(1);
    expect(mockedUserGetAll).toHaveBeenCalledTimes(1);
    expect(mockedSubmissionApiCreate).toHaveBeenCalledTimes(1);
  });

  it("should send submission and create user if it doesn't exist ", async () => {
    expect.assertions(5);
    mockedUserGetAll.mockResolvedValueOnce([]);
    mockedUserCreate.mockResolvedValueOnce(MOCKED_USER);
    mockedStudentApiCreate.mockResolvedValue(MOCKED_STUDENT);
    mockedTaskApiGetAll.mockResolvedValueOnce([MOCKED_TASK]);

    mockedSubmissionApiCreate.mockResolvedValueOnce({
      fkTaskId: 11,
      fkStudentId: 11,
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
    mockedUserGetAll.mockResolvedValueOnce([]);
    mockedUserCreate.mockResolvedValueOnce(MOCKED_USER);
    mockedStudentApiCreate.mockResolvedValue(MOCKED_STUDENT);
    mockedTaskApiGetAll.mockResolvedValueOnce([MOCKED_TASK]);
    await uploadTarea(MOCKED_TAREA_WITH_UNDEFINED_USERNAME_AND_LASTNAME);

    const expectedUser: CreateUserDto = {
      roles: [Role.STUDENT],
      username: undefined,
      externalId: `oauth2|sign-in-with-slack|${MOCKED_SLACK_TEAM_ID}-mockId`,
    };

    const expectedStudent: CreateStudentDto = {
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
    mockedUserGetAll.mockResolvedValueOnce([MOCKED_USER]);
    mockedTaskApiGetAll.mockResolvedValueOnce([]);
    try {
      await uploadTarea(MOCKED_TAREA);
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR);
    }
  });
});
