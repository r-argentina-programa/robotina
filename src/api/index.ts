import { Axios } from 'axios'

export const marketplaceApi = new Axios({
  baseURL: process.env.API_URL,
  headers: {
    authorization: `bearer + ${process.env.BOT_AUTHORIZATION_BEARER_TOKEN}`,
  },
})
