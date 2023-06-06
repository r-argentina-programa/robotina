import * as dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { ICredential } from '../interfaces/ICredential';

dotenv.config();

export const getBotCredentials = async () => {
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
    )) as AxiosResponse<ICredential>;
    return data;
  } catch (err) {
    throw new Error('Bot authentication failed');
  }
};
