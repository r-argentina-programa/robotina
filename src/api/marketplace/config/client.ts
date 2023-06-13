import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import auth0 from '../../auth0';
import env from '../../../config/env.config';

const marketplaceClient = axios.create({
  baseURL: `${env.API_BASE_URL}/`,
});

const attachBearerToRequest = (
  req: AxiosRequestConfig,
  bearerToken: string
) => {
  req.headers!.Authorization = `Bearer ${bearerToken}`;
};

const AttachBearerTokenToAxiosInstance = (
  instance: AxiosInstance,
  bearerToken: string
) => {
  // eslint-disable-next-line no-param-reassign
  instance.defaults.headers.common = {
    Authorization: `Bearer ${bearerToken}`,
  };
};

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  retry: boolean;
}

export const interceptOnSuccess = (
  res: AxiosResponse<any>
): AxiosResponse<any> => res;

export const interceptorRequestOnFail = async (error: AxiosError) => {
  const requestConfig = error.config as AxiosRequestConfigWithRetry;

  if (error.response && error.response.status === 401 && !requestConfig.retry) {
    requestConfig.retry = true;

    const { access_token: AccessToken } =
      await auth0.authenticationApi.getAccessToken();

    attachBearerToRequest(requestConfig, AccessToken);
    AttachBearerTokenToAxiosInstance(marketplaceClient, AccessToken);

    return marketplaceClient(requestConfig);
  }

  return Promise.reject(error);
};

marketplaceClient.interceptors.response.use(
  interceptOnSuccess,
  interceptorRequestOnFail
);

export default marketplaceClient;
