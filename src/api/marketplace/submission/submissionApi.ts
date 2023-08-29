/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { ISubmissionResponse } from './ISubmissionResponse';
import { IErrorResponse } from '../common/IErrorResponse';
import { ICreateSubmissionDto } from './ICreateSubmissionDto';

export const create = async (
  newSubmission: ICreateSubmissionDto
): Promise<ISubmissionResponse> => {
  try {
    const { data } = await marketplaceClient.post<ISubmissionResponse>(
      '/api/submission',
      newSubmission
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[submissionApi Error: Create]', error.response);
      throw new Error((error.response?.data as IErrorResponse).message);
    } else {
      console.error('[submissionApi Error: Create]', error);
      throw new Error(
        `Creating submission failed, check logs for more information.`
      );
    }
  }
};

const submissionApi = {
  create,
};

export default submissionApi;
