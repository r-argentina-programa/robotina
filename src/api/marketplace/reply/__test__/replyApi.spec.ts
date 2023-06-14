import { AxiosError } from 'axios';
import replyApi from '../replyApi';
import marketplaceClient from '../../config/client';
import { CreateReplyDto } from '../dto/CreateReplyDto';
import { UpdateReplyDto } from '../dto/UpdateReplyDto';
import { Reply } from '../entity/Reply';

jest.mock('../../config/client');

describe('Marketplace Reply API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new reply', async () => {
      const newReply: CreateReplyDto = {
        authorId: '1',
        text: 'Lorem Ipsum',
        threadTS: '123456',
        timestamp: '123456',
        username: 'test@test.com',
      };

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: newReply });

      const response = await replyApi.create(newReply);

      expect(response).toEqual(newReply);
      expect(postMock).toHaveBeenCalledWith('/api/reply', newReply);
    });

    it('should throw an error when creating a reply fails', async () => {
      const newReply: CreateReplyDto = {
        authorId: '1',
        text: 'Lorem Ipsum',
        threadTS: '123456',
        timestamp: '123456',
        username: 'test@test.com',
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

      await expect(replyApi.create(newReply)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/reply', newReply);
    });
  });

  describe('update', () => {
    it('should update a reply', async () => {
      const originalReply: Reply = {
        id: 1,
        authorId: '1',
        text: 'Lorem Ipsum',
        threadTS: '123456',
        timestamp: '123456',
        username: 'test@test.com',
      };

      const updates: UpdateReplyDto = {
        text: 'Ipsum Lorem',
        timestamp: '654321',
        username: 'demo@test.com',
      };

      const expectedResponse = expect.objectContaining(updates);

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: { originalReply, ...updates } });

      const response = await replyApi.update(originalReply.timestamp, updates);

      expect(response).toEqual(expectedResponse);
      expect(postMock).toHaveBeenCalledWith(
        `/api/bot/reply/${originalReply.timestamp}`,
        updates
      );
    });

    it('should throw an error when updating a reply fails', async () => {
      const originalReply: Reply = {
        id: 1,
        authorId: '1',
        text: 'Lorem Ipsum',
        threadTS: '123456',
        timestamp: '123456',
        username: 'test@test.com',
      };

      const updates: UpdateReplyDto = {
        text: 'Ipsum Lorem',
        timestamp: '654321',
        username: 'demo@test.com',
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

      await expect(
        replyApi.update(originalReply.timestamp, updates)
      ).rejects.toThrowError(expectedErrorMessage);
      expect(postMock).toHaveBeenCalledWith(
        `/api/bot/reply/${originalReply.timestamp}`,
        updates
      );
    });
  });

  describe('remove', () => {
    it('should delete a reply', async () => {
      const timestamp = '123456';

      const deleteMock = jest
        .spyOn(marketplaceClient, 'delete')
        .mockResolvedValueOnce({ data: true });

      await replyApi.remove(timestamp);

      expect(deleteMock).toHaveBeenCalledWith(`/api/bot/reply/${timestamp}`);
    });

    it('should throw an error when deleting a reply fails', async () => {
      const timestamp = '123456';

      const expectedErrorMessage = 'Not found';

      const deleteMock = jest
        .spyOn(marketplaceClient, 'delete')
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

      await expect(replyApi.remove(timestamp)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(deleteMock).toHaveBeenCalledWith(`/api/bot/reply/${timestamp}`);
    });
  });
});
