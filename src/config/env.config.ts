import * as dotenv from 'dotenv';

dotenv.config();

const env = {
  API_BASE_URL: process.env.API_URL,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  BOT_ID: process.env.BOT_ID,
  SLACK_TEAM_ID: process.env.SLACK_TEAM_ID,
};

export default env;
