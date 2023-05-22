import { AxiosResponse } from 'axios';
import { marketplaceApi } from '.';
import { ISubmission } from '../interfaces/ISubmission';

export interface ISubmissionCreate {
  taskId: number;
  studentId: number;
  delivery: string;
}

export const sendSubmission = async (submission: ISubmissionCreate) => {
  const { data } = (await marketplaceApi.post(
    '/api/submission',
    submission
  )) as AxiosResponse<ISubmission>;
  return data;
};
