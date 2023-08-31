import { createAuth0Id } from '../../utils/createAuth0Id';
import { ICreateUserDto } from '../../api/marketplace/user/ICreateUserDto';
import userApi from '../../api/marketplace/user/userApi';
import studentApi from '../../api/marketplace/student/studentApi';
import { ICreateStudentDto } from '../../api/marketplace/student/ICreateStudentDto';
import { ICreateSubmissionDto } from '../../api/marketplace/submission/ICreateSubmissionDto';
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
  let createSubmissionDto: ICreateSubmissionDto;

  const { data: users } = await userApi.getAllPaginated({
    filter: { externalId: auth0Id },
    include: { student: true },
  });

  const { data: tasks } = await taskApi.getAllPaginated({
    filter: { lessonId: +classNumber },
  });

  if (!tasks.length) {
    throw new Error('Task not found');
  }

  const taskId = tasks[0].id;

  if (!users.length) {
    const createUserDto: ICreateUserDto = {
      externalId: auth0Id,
      roles: ['Student'],
    };

    const user = await userApi.create(createUserDto);

    const createStudentDto: ICreateStudentDto = {
      userId: user.id,
      email,
      firstName: firstName || email,
      lastName: lastName || email,
    };

    const student = await studentApi.create(createStudentDto);

    createSubmissionDto = {
      taskId,
      studentId: student.id,
      delivery,
    };

    return submissionApi.create(createSubmissionDto);
  }

  const studentId = users[0].student!.id;

  createSubmissionDto = {
    taskId,
    studentId,
    delivery,
  };

  return submissionApi.create(createSubmissionDto);
};
