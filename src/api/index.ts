import axios, {
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios'

type IAxiosError = AxiosError & {
  config: {
    retry?: boolean
  }
}

interface IGetCredential {
  access_token: string
  expires_in: number
  token_type: string
}

export const marketplaceApi = axios.create({
  baseURL: process.env.API_URL,
})

const getAuth0BotCredentials = async () => {
  console.log('Getting Auth0 credentials')
  try {
    const { data } = (await axios.post(
      `${<string>process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: process.env.GRANT_TYPE,
        scope: process.env.AUTH0_SCOPE,
        username: process.env.AUTH0_USERNAME,
        password: process.env.AUTH0_PASSWORD,
      }
    )) as AxiosResponse<IGetCredential>
    return data
  } catch (err) {
    throw new Error('Bot authentication failed')
  }
}

const setMarketplaceApiAuthorization = (
  api: AxiosInstance,
  bearerToken: string
) => {
  // eslint-disable-next-line no-param-reassign
  api.defaults.headers.common = {
    Authorization: `Bearer ${bearerToken}`,
  }
}

const setRequestConfigAuthorization = (
  req: AxiosRequestConfig,
  bearerToken: string
) => {
  req.headers!.Authorization = `Bearer ${bearerToken}`
}

const interceptorRequestOnSuccess = (response: AxiosResponse) => response

const interceptorRequestOnFail = async (error: IAxiosError) => {
  const originalRequest = error.config
  if (error.response?.status === 401 && !originalRequest.retry) {
    originalRequest.retry = true
    const newToken = await getAuth0BotCredentials()
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
