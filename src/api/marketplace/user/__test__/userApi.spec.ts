import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import { CreateUserDto } from '../dto/CreateUserDto';
import { Role } from '../entity/Role';
import userApi from '../userApi';
import { User } from '../entity/User';
import { PaginatedResponse } from '../../interface/PaginatedResponse';

describe('Marketplace User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all users', async () => {
      const paginatedUsers: PaginatedResponse<User> = {
        count: 2,
        next: 'next',
        previous: 'previous',
        results: [
          {
            id: 1,
            externalId: 'oauth|sign-in-with-slack|000000-000000',
            roles: [Role.STUDENT],
            username: 'john.doe@test.com',
          },
          {
            id: 2,
            externalId: 'oauth|sign-in-with-slack|000000-000001',
            roles: [Role.STUDENT],
            username: 'jane.doe@test.com',
          },
        ],
      };

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce({ data: paginatedUsers });

      const response = await userApi.getAll();

      expect(response[0]).toEqual(paginatedUsers.results[0]);
      expect(response[1]).toEqual(paginatedUsers.results[1]);
      expect(getMock).toHaveBeenCalledWith('/api/user');
    });

    it('should filter users', async () => {
      const paginatedUsers: PaginatedResponse<User> = {
        count: 1,
        next: 'next',
        previous: 'previous',
        results: [
          {
            id: 1,
            externalId: 'oauth|sign-in-with-slack|000000-000000',
            roles: [Role.STUDENT],
            username: 'john.doe@test.com',
          },
        ],
      };

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce({ data: paginatedUsers });

      const response = await userApi.getAll({
        filter: { externalId: 'oauth|sign-in-with-slack|000000-000000' },
      });

      expect(response.length).toBe(1);
      expect(response[0]).toEqual(paginatedUsers.results[0]);
      expect(getMock).toHaveBeenCalledWith(
        '/api/user?filter%5BexternalId%5D=oauth%7Csign-in-with-slack%7C000000-000000'
      );
    });

    it('should throw an error when getting users fails', async () => {
      const expectedErrorMessage = 'Not found';

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockRejectedValueOnce(
          new AxiosError(
            undefined,
            undefined,
            {},
            {},
            {
              status: 404,
              statusText: 'Not found',
              headers: {},
              data: {
                message: expectedErrorMessage,
              },
              config: {},
            }
          )
        );

      await expect(userApi.getAll()).rejects.toThrowError(expectedErrorMessage);
      expect(getMock).toHaveBeenCalledWith('/api/user');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser: CreateUserDto = {
        externalId: 'oauth|sign-in-with-slack|000000-000000',
        roles: [Role.STUDENT],
        username: 'john.doe@test.com',
      };

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: newUser });

      const response = await userApi.create(newUser);

      expect(response).toEqual(newUser);
      expect(postMock).toHaveBeenCalledWith('/api/user', newUser);
    });

    it('should throw an error when creating an user fails', async () => {
      const newUser: CreateUserDto = {
        externalId: 'oauth|sign-in-with-slack|000000-000000',
        roles: [Role.STUDENT],
        username: 'john.doe@test.com',
      };

      const expectedErrorMessage = 'Bad Request';

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockRejectedValueOnce(
          new AxiosError(
            undefined,
            undefined,
            {},
            {},
            {
              status: 400,
              statusText: 'Bad Request',
              headers: {},
              data: {
                message: expectedErrorMessage,
              },
              config: {},
            }
          )
        );

      await expect(userApi.create(newUser)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/user', newUser);
    });
  });
});
