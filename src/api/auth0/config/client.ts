import axios from 'axios';
import env from '../../../config/env.config';

export const auth0Client = axios.create({
  baseURL: `${env.AUTH0_DOMAIN}/`,
});
