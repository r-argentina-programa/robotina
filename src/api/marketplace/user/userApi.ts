/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { IErrorResponse } from '../common/IErrorResponse';
import { mapQueryOptionsToQueryString } from '../common/url';
import { ICreateUserDto } from './ICreateUserDto';
import { IGetAllOptions } from '../common/IGetAllOptions';
import { IPaginatedResponse } from '../common/IPaginatedResponse';
import { IUserResponse } from './IUserResponse';

interface IUserFilterOptions {
  externalId?: string;
}

interface IUserIncludeOptions {
  student?: boolean;
}

export const getAllPaginated = async (
  options?: IGetAllOptions<IUserFilterOptions, IUserIncludeOptions>
): Promise<IPaginatedResponse<IUserResponse>> => {
  try {
    const { data } = await marketplaceClient.get<
      IPaginatedResponse<IUserResponse>
    >(`/api/user${mapQueryOptionsToQueryString(options)}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[userApi Error: GetAll]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[userApi Error: GetAll]', error);
      throw new Error(`Getting users failed, check logs for more information.`);
    }
  }
};

export const create = async (
  newUser: ICreateUserDto
): Promise<IUserResponse> => {
  try {
    const { data } = await marketplaceClient.post<IUserResponse>(
      '/api/user',
      newUser
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[userApi Error: Create]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[userApi Error: Create]', error);
      throw new Error(`Creating user failed, check logs for more information.`);
    }
  }
};

const userApi = {
  getAllPaginated,
  create,
};

export default userApi;
