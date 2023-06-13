// Had to do this because importing marketplaceClient first makes mocking axios.create impossible.
/* eslint-disable import/first */
jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios');

  return {
    __esModule: true,
    ...originalModule,
    default: {
      create: jest.fn().mockImplementation(() => {
        const axiosInstance = jest.fn();

        return Object.assign(axiosInstance, {
          interceptors: {
            // @ts-ignore
            response: {
              use: jest.fn(),
            },
          },
          defaults: {
            // @ts-ignore
            headers: {
              common: {
                Authorization: '',
              },
            },
          },
        });
      }),
    },
  };
});

import axios, { AxiosError } from 'axios';
import marketplaceClient, {
  interceptOnSuccess,
  interceptorRequestOnFail,
} from '../client';
import authenticationApi from '../../../auth0/authentication/authenticationApi';

jest.mock('../../../auth0/authentication/authenticationApi');

describe('interceptorRequestOnFail', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should attach an access token to the request if Robotina gets a 401 failed request for the first time', async () => {
    const credentials = {
      access_token: 'access_token',
      expires_in: 123456,
      token_type: 'token_type',
    };

    jest
      .spyOn(authenticationApi, 'getAccessToken')
      .mockResolvedValueOnce(credentials);

    const axiosError = new AxiosError(
      undefined,
      undefined,
      // @ts-ignore
      { retry: false, headers: { Authorization: undefined } },
      {},
      {
        config: {},
        data: {},
        headers: {},
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    await interceptorRequestOnFail(axiosError);

    expect(axiosError.config.headers!.Authorization).toBe(
      `Bearer ${credentials.access_token}`
    );
    expect(marketplaceClient.defaults.headers.common).toEqual({
      Authorization: `Bearer ${credentials.access_token}`,
    });
    expect(marketplaceClient).toHaveBeenCalledWith(axiosError.config);
    expect(
      marketplaceClient.interceptors.response.use
    ).toHaveBeenLastCalledWith(interceptOnSuccess, interceptorRequestOnFail);
  });

  it('should reject if Robotina gets a failed request with status other than 401', async () => {
    const axiosError = new AxiosError(
      'Not Found',
      undefined,
      // @ts-ignore
      { retry: false, headers: { Authorization: undefined } },
      {},
      {
        config: {},
        data: {},
        headers: {},
        status: 404,
        statusText: 'Not Found',
      }
    );

    await expect(interceptorRequestOnFail(axiosError)).rejects.toThrowError(
      axiosError
    );
  });

  it('should throw an error if Robotina is unable to get a new token', async () => {
    const networkError = new Error('Network Error');

    const axiosError = new AxiosError(
      undefined,
      undefined,
      // @ts-ignore
      { retry: false, headers: { Authorization: undefined } },
      {},
      {
        config: {},
        data: {},
        headers: {},
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    jest
      .spyOn(authenticationApi, 'getAccessToken')
      .mockRejectedValueOnce(networkError);

    // @ts-ignore
    jest.spyOn(axios, 'create').mockReturnValue({
      interceptors: {
        // @ts-ignore
        response: {
          use: jest.fn(),
        },
      },
      defaults: {
        // @ts-ignore
        headers: {
          common: {
            Authorization: '',
          },
        },
      },
    });

    await expect(interceptorRequestOnFail(axiosError)).rejects.toThrowError(
      networkError
    );
    expect(authenticationApi.getAccessToken).toHaveBeenCalledTimes(1);
  });
});
