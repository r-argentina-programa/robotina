import { expect, jest } from '@jest/globals'
import axios from 'axios'
import { ICredential } from '../../interfaces/marketplaceApi/credential'
import { getBotCredentials } from '../getBotCredentials'

const credentials: ICredential = {
  access_token: 'new-token',
  expires_in: 34325435,
  token_type: 'Bearer',
}
jest.mock('axios')

const mockedAxios = jest.mocked(axios)

describe('getBotCredentials', () => {
  const ENVIROMENT_VARIABLES = {
    AUTH0_CLIENT_ID: 'test',
    AUTH0_CLIENT_SECRET: 'test',
    AUTH0_AUDIENCE: 'test',
    GRANT_TYPE: 'test',
    AUTH0_USERNAME: 'test',
    AUTH0_PASSWORD: 'test',
    AUTH0_DOMAIN: 'test',
  }
  beforeEach(() => {
    process.env = ENVIROMENT_VARIABLES
  })
  it('should make a http request with enviroment variables', async () => {
    expect.assertions(3)
    const { AUTH0_DOMAIN } = ENVIROMENT_VARIABLES
    const DATA = {
      client_id: ENVIROMENT_VARIABLES.AUTH0_CLIENT_ID,
      client_secret: ENVIROMENT_VARIABLES.AUTH0_CLIENT_SECRET,
      audience: ENVIROMENT_VARIABLES.AUTH0_AUDIENCE,
      grant_type: ENVIROMENT_VARIABLES.GRANT_TYPE,
      username: ENVIROMENT_VARIABLES.AUTH0_USERNAME,
      password: ENVIROMENT_VARIABLES.AUTH0_PASSWORD,
    }
    mockedAxios.post.mockResolvedValue({ data: credentials })
    const response = await getBotCredentials()
    expect(response).toBe(credentials)
    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${AUTH0_DOMAIN}/oauth/token`,
      DATA
    )
  })

  it('should throw if there is an authentication error', async () => {
    const EXPECTED_ERROR = new Error('Authentication error')
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject(EXPECTED_ERROR)
    )
    try {
      await getBotCredentials()
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Bot authentication failed')
      }
    }
  })
})
