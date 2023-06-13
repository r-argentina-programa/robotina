/* eslint-disable no-console */
import axios from 'axios';
import marketplaceClient from '../config/client';
import { Submission } from './entity/Submission';
import { ErrorResponse } from '../interface/ErrorResponse';
import { CreateSubmissionDto } from './dto/CreateSubmissionDto';

export const create = async (
  submission: CreateSubmissionDto
): Promise<Submission> => {
  try {
    const { data: newSubmission } = await marketplaceClient.post<Submission>(
      '/api/submission',
      submission
    );
    return newSubmission;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[submissionApi Error: Create]', error.response);
      throw new Error((error.response?.data as ErrorResponse).message);
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
