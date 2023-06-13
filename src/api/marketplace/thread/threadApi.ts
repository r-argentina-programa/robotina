/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { Thread } from './entity/Thread';
import { ErrorResponse } from '../interface/ErrorResponse';
import { CreateThreadDto } from './dto/CreateThreadDto';

export const create = async (newThread: CreateThreadDto): Promise<Thread> => {
  try {
    const { data: thread } = await marketplaceClient.post<Thread>(
      '/api/thread',
      newThread
    );
    return thread;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[threadApi Error: Create]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
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
