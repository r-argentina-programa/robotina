import axios from 'axios'

export const marketplaceApi = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    authorization: `Bearer ${process.env.BOT_AUTHORIZATION_BEARER_TOKEN}`,
  },
})
