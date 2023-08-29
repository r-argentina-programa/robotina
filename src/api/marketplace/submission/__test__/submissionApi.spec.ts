import { AxiosError } from 'axios';
import marketplaceClient from '../../config/client';
import { ICreateSubmissionDto } from '../ICreateSubmissionDto';
import submissionApi from '../submissionApi';

describe('Marketplace Submission API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new submission', async () => {
      const newSubmission: ICreateSubmissionDto = {
        delivery: '```console.log("Hello World!")```',
        studentId: 1,
        taskId: 1,
      };

      const postMock = jest
        .spyOn(marketplaceClient, 'post')
        .mockResolvedValueOnce({ data: newSubmission });

      const response = await submissionApi.create(newSubmission);

      expect(response).toEqual(newSubmission);
      expect(postMock).toHaveBeenCalledWith('/api/submission', newSubmission);
    });

    it('should throw an error when creating a submission fails', async () => {
      const newSubmission: ICreateSubmissionDto = {
        delivery: '```console.log("Hello World!")```',
        studentId: 1,
        taskId: 1,
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

      await expect(submissionApi.create(newSubmission)).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/api/submission', newSubmission);
    });
  });
});
