import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import taskApi from '../TaskApi';
import { ITaskResponse } from '../ITaskResponse';
import { IPaginatedResponse } from '../../common/IPaginatedResponse';

describe('Marketplace Task API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all tasks paginated', async () => {
      const mockedResponse: IPaginatedResponse<ITaskResponse> = {
        data: [
          {
            id: 1,
            description: 'test',
            lessonId: 1,
            resolutionType: 'Code',
            title: 'Clase 1',
          },
          {
            id: 12,
            description: 'test',
            lessonId: 12,
            resolutionType: 'Link',
            title: 'Clase 12',
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

      const { data } = await taskApi.getAllPaginated();

      expect(data[0]).toEqual(mockedResponse.data[0]);
      expect(data[1]).toEqual(mockedResponse.data[1]);
      expect(getMock).toHaveBeenCalledWith('/api/task');
    });

    it('should filter tasks', async () => {
      const mockedResponse: IPaginatedResponse<ITaskResponse> = {
        data: [
          {
            id: 1,
            description: 'test',
            lessonId: 1,
            resolutionType: 'Code',
            title: 'Clase 1',
          },
        ],
        meta: {
          page: 1,
          itemCount: 1,
          pageCount: 1,
          take: 10,
        },
      };

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce(mockedResponse);

      const { data } = await taskApi.getAllPaginated({
        filter: { lessonId: 1 },
      });

      expect(data.length).toBe(1);
      expect(data[0]).toEqual(mockedResponse.data[0]);
      expect(getMock).toHaveBeenCalledWith('/api/task?filter%5BlessonId%5D=1');
    });

    it('should throw an error when creating a task fails', async () => {
      const expectedErrorMessage = 'Not found';

      const postMock = jest
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

      await expect(taskApi.getAllPaginated()).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/task');
    });
  });
});
