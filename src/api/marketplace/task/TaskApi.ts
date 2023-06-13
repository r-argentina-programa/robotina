/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { Task } from './entity/Task';
import { ErrorResponse } from '../interface/ErrorResponse';
import { RequestOptions } from '../interface/RequestOptions';
import { mapOptionsToQueryString } from '../helper/url';

interface TaskFilters {
  lessonId?: number;
}

interface TaskAssociations {
  submissions?: true;
}

export const getAll = async (
  options?: RequestOptions<TaskFilters, TaskAssociations>
): Promise<Task[]> => {
  try {
    let queryString = '';

    if (options) {
      queryString = mapOptionsToQueryString(options);
    }

    const { data: tasks } = await marketplaceClient.get<Task[]>(
      `/api/task${queryString}`
    );

    return tasks;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[taskApi Error: GetAll]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
    } else {
      console.error('[taskApi Error: GetAll]', error);
      throw new Error(`Getting tasks failed, check logs for more information.`);
    }
  }
};

const taskApi = {
  getAll,
};

export default taskApi;
