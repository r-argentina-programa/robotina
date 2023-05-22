import axios, { AxiosRequestConfig } from 'axios';

export const retryHttpRequest = (config: AxiosRequestConfig) => axios(config);
