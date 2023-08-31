/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { IThreadResponse } from './IThreadResponse';
import { IErrorResponse } from '../common/IErrorResponse';
import { ICreateThreadDto } from './ICreateThreadDto';

export const create = async (
  newThread: ICreateThreadDto
): Promise<IThreadResponse> => {
  try {
    const { data } = await marketplaceClient.post<IThreadResponse>(
      '/api/thread',
      newThread
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[threadApi Error: Create]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[threadApi Error: Create]', error);
      throw new Error(
        `Creating thread failed, check logs for more information.`
      );
    }
  }
};

const threadApi = {
  create,
};

export default threadApi;
