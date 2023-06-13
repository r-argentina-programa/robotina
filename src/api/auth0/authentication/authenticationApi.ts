/* eslint-disable no-console */
import axios from 'axios';
import * as dotenv from 'dotenv';
import { auth0Client } from '../config/client';
import { Credentials } from './entity/Credentials';

dotenv.config();

const getAccessToken = async (): Promise<Credentials> => {
  try {
    const { data: credentials } = await auth0Client.post<Credentials>(
      '/oauth/token',
      {
        client_id: process.env.AUTH0_CLIENT_ID || '',
        client_secret: process.env.AUTH0_CLIENT_SECRET || '',
        audience: process.env.AUTH0_AUDIENCE || '',
        grant_type: process.env.GRANT_TYPE || '',
        username: process.env.AUTH0_USERNAME || '',
        password: process.env.AUTH0_PASSWORD || '',
      }
    );
    return credentials;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[getAccessToken error]: ', error.response);
      throw new Error(
        `Bot authentication failed with status ${error.response?.status}`
      );
    } else {
      console.error('[getAccessToken error]: ', error);
      throw new Error(
        `Bot authentication failed, check logs for more information.`
      );
    }
  }
};

const authenticationApi = {
  getAccessToken,
};

export default authenticationApi;
