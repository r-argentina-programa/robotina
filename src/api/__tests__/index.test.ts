import { expect, jest } from '@jest/globals'
import { AxiosResponse } from 'axios'
import {
  interceptorRequestOnSuccess,
  interceptorRequestOnFail,
  IAxiosError,
} from '..'
import { getBotCredentials, IGetCredential } from '../getBotCredentials'
import * as index from '..'

jest.mock('../getBotCredentials', () => ({
  getBotCredentials: jest.fn(),
}))

jest.mock('../index', () => ({
  ...(jest.requireActual('../index') as typeof index),
  setMarketplaceApiAuthorization: jest.fn(),
}))

const mockedGetBotCredentials = getBotCredentials as jest.MockedFunction<
  typeof getBotCredentials
>

describe('interceptorRequestOnSuccess', () => {
  it('should not modify axios response', async () => {
    const AXIOS_RESPONSE = { data: { test: true } } as unknown as AxiosResponse
    const response = interceptorRequestOnSuccess(AXIOS_RESPONSE)
    expect(response).toBe(AXIOS_RESPONSE)
  })
})

describe('interceptorRequestOnFail', () => {
  it('should try to get new bot credentials', async () => {
    const AXIOS_RESPONSE = {
      response: {
        status: 401,
      },
      config: {
        url: '12345',
        retry: undefined,
        headers: {
          Authorization: undefined,
        },
      },
    } as unknown as IAxiosError
    const botCredentials: IGetCredential = {
      access_token: 'test-access-token',
      expires_in: 123123,
      token_type: 'Bearer',
    }
    mockedGetBotCredentials.mockResolvedValueOnce(botCredentials)
    interceptorRequestOnFail(AXIOS_RESPONSE)
    expect(mockedGetBotCredentials).toHaveBeenCalledTimes(1)
  })

  it('should throw if error is not authentication error', async () => {
    expect.assertions(1)
    const NOT_FOUND_ERROR_CODE = 404
    const AXIOS_RESPONSE = {
      response: {
        status: NOT_FOUND_ERROR_CODE,
      },
      config: {
        url: '12345',
        retry: undefined,
        headers: {
          Authorization: undefined,
        },
      },
    } as unknown as IAxiosError
    try {
      await interceptorRequestOnFail(AXIOS_RESPONSE)
    } catch (error) {
      expect(error).toBe(AXIOS_RESPONSE)
    }
  })

  it('should throw if request is retried ', async () => {
    expect.assertions(1)
    const NOT_FOUND_ERROR_CODE = 401
    const AXIOS_RESPONSE = {
      response: {
        status: NOT_FOUND_ERROR_CODE,
      },
      config: {
        url: '12345',
        retry: true,
        headers: {
          Authorization: undefined,
        },
      },
    } as unknown as IAxiosError
    try {
      await interceptorRequestOnFail(AXIOS_RESPONSE)
    } catch (error) {
      expect(error).toBe(AXIOS_RESPONSE)
    }
  })
})
