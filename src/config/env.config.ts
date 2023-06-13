import * as dotenv from 'dotenv';

dotenv.config();

const env = {
  API_BASE_URL: process.env.API_URL,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
};

export default env;
