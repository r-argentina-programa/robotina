/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { Student } from './entity/Student';
import { ErrorResponse } from '../interface/ErrorResponse';
import { CreateStudentDto } from './dto/CreateStudentDto';

export const create = async (
  newStudent: CreateStudentDto
): Promise<Student> => {
  try {
    const { data: student } = await marketplaceClient.post<Student>(
      '/api/student',
      newStudent
    );
    return student;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[studentApi Error: Create]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
    } else {
      console.error('[studentApi Error: Create]', error);
      throw new Error(
        `Creating student failed, check logs for more information.`
      );
    }
  }
};

const studentApi = {
  create,
};

export default studentApi;
