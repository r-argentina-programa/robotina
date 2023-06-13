import { createAuth0Id } from '../../utils/createAuth0Id';
import { CreateUserDto } from '../../api/marketplace/user/dto/CreateUserDto';
import { Role } from '../../api/marketplace/user/entity/Role';
import userApi from '../../api/marketplace/user/userApi';
import studentApi from '../../api/marketplace/student/studentApi';
import { CreateStudentDto } from '../../api/marketplace/student/dto/CreateStudentDto';
import { CreateSubmissionDto } from '../../api/marketplace/submission/dto/CreateSubmissionDto';
import submissionApi from '../../api/marketplace/submission/submissionApi';
import taskApi from '../../api/marketplace/task/TaskApi';

export interface IUploadTarea {
  slackId: string;
  delivery: string;
  classNumber: string;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string;
}

export const uploadTarea = async ({
  classNumber,
  delivery,
  email,
  firstName,
  lastName,
  slackId,
}: IUploadTarea) => {
  const auth0Id = createAuth0Id(slackId);
  let createSubmissionDto: CreateSubmissionDto;

  const users = await userApi.getAll({
    filter: { externalId: auth0Id },
    include: { student: true },
  });

  const tasks = await taskApi.getAll({ filter: { lessonId: +classNumber } });

  /* const userResponse = await getUser(auth0Id);
  const taskResponse = await getTasks(classNumber); */

  if (!tasks.length) {
    throw new Error('Task not found');
  }

  const taskId = tasks[0].id;

  if (!users.length) {
    const createUserDto: CreateUserDto = {
      externalId: auth0Id,
      roles: [Role.STUDENT],
    };

    /* const user: CreateUserDto = {
      firstName: firstName || email,
      email,
      externalId: auth0Id,
      lastName: lastName || email,
      roles: [Role.STUDENT],
    }; */

    const user = await userApi.create(createUserDto);

    const createStudentDto: CreateStudentDto = {
      userId: user.id,
      email,
      firstName: firstName || email,
      lastName: lastName || email,
    };

    const student = await studentApi.create(createStudentDto);

    /* const student = await createUserStudent(user); */

    createSubmissionDto = {
      taskId,
      studentId: student.id,
      delivery,
    };

    return submissionApi.create(createSubmissionDto);

    /* return sendSubmission(submission); */
  }

  const studentId = users[0].student!.id;

  createSubmissionDto = {
    taskId,
    studentId,
    delivery,
  };

  return submissionApi.create(createSubmissionDto);
};
