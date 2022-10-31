import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { retryHttpRequest } from '../retryHttpRequest'

jest.mock('axios')
const axiosMocked = jest.mocked(axios)

describe('retryHttpRequest', () => {
  it('should call axios with given params', async () => {
    const axiosConfig = { test: '12345' } as AxiosRequestConfig
    axiosMocked.mockImplementationOnce(()=> Promise.resolve(axiosConfig as AxiosResponse))
    const httpRequest = await retryHttpRequest(axiosConfig)
    expect(axiosMocked).toHaveBeenCalledTimes(1)
    expect(httpRequest).toBe(axiosConfig)
  })
})
