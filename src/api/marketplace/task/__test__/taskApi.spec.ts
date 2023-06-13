import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import taskApi from '../TaskApi';
import { ResolutionType } from '../entity/ResolutionType';
import { Task } from '../entity/Task';

describe('Marketplace Task API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all tasks', async () => {
      const tasks: Task[] = [
        {
          id: 1,
          description: 'test',
          lessonId: 1,
          resolutionType: ResolutionType.CODE,
          title: 'Clase 1',
        },
        {
          id: 12,
          description: 'test',
          lessonId: 12,
          resolutionType: ResolutionType.LINK,
          title: 'Clase 12',
        },
      ];

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce({ data: tasks });

      const response = await taskApi.getAll();

      expect(response[0]).toEqual(tasks[0]);
      expect(response[1]).toEqual(tasks[1]);
      expect(getMock).toHaveBeenCalledWith('/api/task');
    });

    it('should filter tasks', async () => {
      const tasks: Task[] = [
        {
          id: 1,
          description: 'test',
          lessonId: 1,
          resolutionType: ResolutionType.CODE,
          title: 'Clase 1',
        },
      ];

      const getMock = jest
        .spyOn(marketplaceClient, 'get')
        .mockResolvedValueOnce({ data: tasks });

      const response = await taskApi.getAll({ filter: { lessonId: 1 } });

      expect(response.length).toBe(1);
      expect(response[0]).toEqual(tasks[0]);
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

      await expect(taskApi.getAll()).rejects.toThrowError(expectedErrorMessage);
      expect(postMock).toHaveBeenCalledWith('/api/task');
    });
  });
});
