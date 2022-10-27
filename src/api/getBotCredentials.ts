import axios, { AxiosResponse } from 'axios'

export interface IGetCredential {
  access_token: string
  expires_in: number
  token_type: string
}

export const getBotCredentials = async () => {
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
