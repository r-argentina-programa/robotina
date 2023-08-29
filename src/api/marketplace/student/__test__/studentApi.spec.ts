import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import { ICreateStudentDto } from '../ICreateStudentDto';
import studentApi from '../studentApi';

describe('Marketplace Student API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new student', async () => {
      const newStudent: ICreateStudentDto = {
        email: 'test@test.com',
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
      };

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: newStudent });

      const response = await studentApi.create(newStudent);

      expect(response).toEqual(newStudent);
      expect(postMock).toHaveBeenCalledWith('/api/student', newStudent);
    });

    it('should throw an error when creating a student fails', async () => {
      const newStudent: ICreateStudentDto = {
        email: 'test@test.com',
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
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

      await expect(studentApi.create(newStudent)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/student', newStudent);
    });
  });
});
