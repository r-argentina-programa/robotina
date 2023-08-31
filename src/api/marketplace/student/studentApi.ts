/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { IStudentResponse } from './IStudentResponse';
import { IErrorResponse } from '../common/IErrorResponse';
import { ICreateStudentDto } from './ICreateStudentDto';

export const create = async (
  newStudent: ICreateStudentDto
): Promise<IStudentResponse> => {
  try {
    const { data } = await marketplaceClient.post<IStudentResponse>(
      '/api/student',
      newStudent
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[studentApi Error: Create]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
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
