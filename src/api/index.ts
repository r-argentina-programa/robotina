import axios, {
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios'
import { getBotCredentials } from './getBotCredentials'

export type IAxiosError = AxiosError & {
  config: {
    retry?: boolean
  }
}

export const marketplaceApi = axios.create({
  baseURL: process.env.API_URL,
})

export const setMarketplaceApiAuthorization = (
  api: AxiosInstance,
  bearerToken: string
) => {
  // eslint-disable-next-line no-param-reassign
  api.defaults.headers.common = {
    Authorization: `Bearer ${bearerToken}`,
  }
}

export const setRequestConfigAuthorization = (
  req: AxiosRequestConfig,
  bearerToken: string
) => {
  req.headers!.Authorization = `Bearer ${bearerToken}`
}

export const interceptorRequestOnSuccess = (response: AxiosResponse) => response

export const interceptorRequestOnFail = async (error: IAxiosError) => {
  const originalRequest = error.config
  if (error.response?.status === 401 && !originalRequest.retry) {
    originalRequest.retry = true
    const newToken = await getBotCredentials()
    setMarketplaceApiAuthorization(marketplaceApi, newToken.access_token)
    setRequestConfigAuthorization(originalRequest, newToken.access_token)
    return axios(originalRequest)
  }
  return Promise.reject(error)
}

marketplaceApi.interceptors.response.use(
  interceptorRequestOnSuccess,
  interceptorRequestOnFail
)
