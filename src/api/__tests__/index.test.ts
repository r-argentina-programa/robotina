import { expect, jest } from '@jest/globals'
import { AxiosResponse } from 'axios'
import { IAxiosError, interceptorRequestOnFail } from '..'
import { ICredential } from '../../interfaces/marketplaceApi/credential'
import { getBotCredentials } from '../getBotCredentials'
import * as index from '../index'
import { retryHttpRequest } from '../retryHttpRequest'

jest.mock('../getBotCredentials')
jest.mock('../retryHttpRequest')

jest.mock('../index', () => ({
  ...(jest.requireActual('../index') as typeof index),
  setMarketplaceApiAuthorization: jest.fn(),
}))

const mockedGetBotCredentials = jest.mocked(getBotCredentials)
const mockedRetryHttpRequest = jest.mocked(retryHttpRequest)

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
    const botCredentials: ICredential = {
      access_token: 'test-access-token',
      expires_in: 123123,
      token_type: 'Bearer',
    }
    expect.assertions(1)
    mockedGetBotCredentials.mockResolvedValueOnce(botCredentials)
    mockedRetryHttpRequest.mockImplementationOnce(() =>
      Promise.resolve({} as AxiosResponse)
    )
    await interceptorRequestOnFail(AXIOS_RESPONSE)
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
