/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { User } from './entity/User';
import { ErrorResponse } from '../interface/ErrorResponse';
import { RequestOptions } from '../interface/RequestOptions';
import { mapOptionsToQueryString } from '../helper/url';
import { PaginatedResponse } from '../interface/PaginatedResponse';
import { CreateUserDto } from './dto/CreateUserDto';

interface UserFilters {
  externalId?: string;
}

interface UserAssociations {
  student?: boolean;
}

export const getAll = async (
  options?: RequestOptions<UserFilters, UserAssociations>
): Promise<User[]> => {
  try {
    let queryString = '';

    if (options) {
      queryString = mapOptionsToQueryString(options);
    }

    const { data: response } = await marketplaceClient.get<
      PaginatedResponse<User>
    >(`/api/user${queryString}`);

    return response.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[userApi Error: GetAll]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
    } else {
      console.error('[userApi Error: GetAll]', error);
      throw new Error(`Getting users failed, check logs for more information.`);
    }
  }
};

export const create = async (newUser: CreateUserDto): Promise<User> => {
  try {
    const { data: user } = await marketplaceClient.post<User>(
      '/api/user',
      newUser
    );
    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[userApi Error: Create]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
    } else {
      console.error('[userApi Error: Create]', error);
      throw new Error(`Creating user failed, check logs for more information.`);
    }
  }
};

const userApi = {
  getAll,
  create,
};

export default userApi;
