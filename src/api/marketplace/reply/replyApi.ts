/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { IReplyResponse } from './IReplyResponse';
import { IErrorResponse } from '../common/IErrorResponse';
import { ICreateReplyDto } from './ICreateReplyDto';
import { IUpdateReplyDto } from './IUpdateReplyDto';

export const create = async (
  newReply: ICreateReplyDto
): Promise<IReplyResponse> => {
  try {
    const { data } = await marketplaceClient.post<IReplyResponse>(
      '/api/reply',
      newReply
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Create]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[replyApi Error: Create]', error);
      throw new Error(
        `Creating reply failed, check logs for more information.`
      );
    }
  }
};

export const update = async (
  timestamp: string,
  updates: IUpdateReplyDto
): Promise<IReplyResponse> => {
  try {
    const { data } = await marketplaceClient.patch<IReplyResponse>(
      `/api/reply/timestamp/${timestamp}`,
      updates
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Update]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[replyApi Error: Update]', error);
      throw new Error(
        `Updating reply failed, check logs for more information.`
      );
    }
  }
};

export const remove = async (timestamp: string): Promise<void> => {
  try {
    await marketplaceClient.delete(`/api/reply/timestamp/${timestamp}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Remove]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[replyApi Error: Remove]', error);
      throw new Error(
        `Removing reply failed, check logs for more information.`
      );
    }
  }
};

const replyApi = {
  create,
  update,
  remove,
};

export default replyApi;
