/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { Reply } from './entity/Reply';
import { ErrorResponse } from '../interface/ErrorResponse';
import { CreateReplyDto } from './dto/CreateReplyDto';
import { UpdateReplyDto } from './dto/UpdateReplyDto';

export const create = async (newReply: CreateReplyDto): Promise<Reply> => {
  try {
    const { data: reply } = await marketplaceClient.post<Reply>(
      '/api/reply',
      newReply
    );
    return reply;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Create]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
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
  updates: UpdateReplyDto
): Promise<Reply> => {
  try {
    const { data: reply } = await marketplaceClient.post<Reply>(
      `/api/bot/reply/${timestamp}`,
      updates
    );
    return reply;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Update]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
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
    await marketplaceClient.delete(`/api/bot/reply/${timestamp}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[replyApi Error: Remove]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
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
