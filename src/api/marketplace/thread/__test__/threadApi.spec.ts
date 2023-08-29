import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import { ICreateThreadDto } from '../ICreateThreadDto';
import threadApi from '../threadApi';

describe('Marketplace Thread API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new thread', async () => {
      const newThread: ICreateThreadDto = {
        authorId: '123',
        studentId: 1,
        taskId: 1,
        text: 'Lorem Ipsum',
        timestamp: '123456',
      };

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: newThread });

      const response = await threadApi.create(newThread);

      expect(response).toEqual(newThread);
      expect(postMock).toHaveBeenCalledWith('/api/thread', newThread);
    });

    it('should throw an error when creating a thread fails', async () => {
      const newThread: ICreateThreadDto = {
        authorId: '123',
        studentId: 1,
        taskId: 1,
        text: 'Lorem Ipsum',
        timestamp: '123456',
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

      await expect(threadApi.create(newThread)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/thread', newThread);
    });
  });
});
