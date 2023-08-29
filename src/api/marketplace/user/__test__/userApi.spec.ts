import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import { ICreateUserDto } from '../ICreateUserDto';
import userApi from '../userApi';
import { IPaginatedResponse } from '../../common/IPaginatedResponse';
import { IUserResponse } from '../IUserResponse';

describe('Marketplace User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all users', async () => {
      const mockedResponse: IPaginatedResponse<IUserResponse> = {
        data: [
          {
            id: 1,
            externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000001',
            roles: ['Student'],
            username: 'john.doe@test.com',
          },
          {
            id: 2,
            externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000002',
            roles: ['student'],
            username: 'jane.doe@test.com',
          },
        ],
        meta: {
          page: 1,
          itemCount: 2,
          pageCount: 1,
          take: 10,
        },
      };

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce(mockedResponse);

      const { data } = await userApi.getAllPaginated();

      expect(data[0]).toEqual(mockedResponse.data[0]);
      expect(data[1]).toEqual(mockedResponse.data[1]);
      expect(getMock).toHaveBeenCalledWith('/api/user');
    });

    it('should filter users', async () => {
      const mockedResponse: IPaginatedResponse<IUserResponse> = {
        data: [
          {
            id: 1,
            externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000001',
            roles: ['Student'],
            username: 'john.doe@test.com',
          },
        ],
        meta: {
          page: 1,
          itemCount: 2,
          pageCount: 1,
          take: 10,
        },
      };

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce(mockedResponse);

      const { data } = await userApi.getAllPaginated({
        filter: {
          externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000001',
        },
      });

      expect(data.length).toBe(1);
      expect(data[0]).toEqual(mockedResponse.data[0]);
      expect(getMock).toHaveBeenCalledWith(
        '/api/user?filter%5BexternalId%5D=oauth2%7Csign-in-with-slack%7CT00000000-U0000000001'
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

      await expect(userApi.getAllPaginated()).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(getMock).toHaveBeenCalledWith('/api/user');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser: ICreateUserDto = {
        externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000001',
        roles: ['Student'],
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
      const newUser: ICreateUserDto = {
        externalId: 'oauth2|sign-in-with-slack|T00000000-U0000000001',
        roles: ['Student'],
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
