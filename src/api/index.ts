import * as dotenv from 'dotenv';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getBotCredentials } from './getBotCredentials';
import { retryHttpRequest } from './retryHttpRequest';

dotenv.config();

export type IAxiosError = AxiosError & {
  config: {
    retry?: boolean;
  };
};

export const marketplaceApi = axios.create({
  baseURL: process.env.API_URL,
});

export const setMarketplaceApiAuthorization = (
  api: AxiosInstance,
  bearerToken: string
) => {
  // eslint-disable-next-line no-param-reassign
  api.defaults.headers.common = {
    Authorization: `Bearer ${bearerToken}`,
  };
};

export const setRequestConfigAuthorization = (
  req: AxiosRequestConfig,
  bearerToken: string
) => {
  req.headers!.Authorization = `Bearer ${bearerToken}`;
};

export const interceptorRequestOnFail = async (error: IAxiosError) => {
  const originalRequest = error.config;
  if (error.response!.status === 401 && !originalRequest.retry) {
    originalRequest.retry = true;
    const { access_token: AccessToken } = await getBotCredentials();
    setMarketplaceApiAuthorization(marketplaceApi, AccessToken);
    setRequestConfigAuthorization(originalRequest, AccessToken);
    return retryHttpRequest(originalRequest);
  }
  return Promise.reject(error);
};

function interceptOnSuccess(res: any) {
  return res;
}

marketplaceApi.interceptors.response.use(
  interceptOnSuccess,
  interceptorRequestOnFail
);
