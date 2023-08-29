/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { ITaskResponse } from './ITaskResponse';
import { IErrorResponse } from '../common/IErrorResponse';
import { mapQueryOptionsToQueryString } from '../common/url';
import { IGetAllOptions } from '../common/IGetAllOptions';
import { IPaginatedResponse } from '../common/IPaginatedResponse';
import { IBaseFilterOptions } from '../common/IBaseFilterOptions';

interface ITaskFilterOptions extends IBaseFilterOptions {
  lessonId?: number;
}

interface ITaskIncludeOptions {
  submissions?: true;
}

export const getAllPaginated = async (
  options?: IGetAllOptions<ITaskFilterOptions, ITaskIncludeOptions>
): Promise<IPaginatedResponse<ITaskResponse>> => {
  try {
    const { data } = await marketplaceClient.get<
      IPaginatedResponse<ITaskResponse>
    >(`/api/task${mapQueryOptionsToQueryString(options)}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[taskApi Error: GetAll]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[taskApi Error: GetAll]', error);
      throw new Error(`Getting tasks failed, check logs for more information.`);
    }
  }
};

const taskApi = {
  getAllPaginated,
};

export default taskApi;
