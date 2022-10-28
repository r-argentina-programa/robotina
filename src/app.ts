/* eslint-disable import/first */
// eslint-disable-next-line import/newline-after-import
import * as dotenv from 'dotenv'
dotenv.config()
import { App, AppOptions } from '@slack/bolt'
import { configureAppCommands } from './commands'
import { configureAppEvents } from './events'

const socketModeAppConfig: AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
}

const httpModeAppConfig: AppOptions = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: Number(<string>process.env.PORT || <string>process.env.HTTP_PORT ),
}

const config = () => {
  if (process.env.NODE_ENV === 'prod') {
    console.log('HTTP MODE')
    return httpModeAppConfig
  }
  console.log('SOCKET MODE')
  return socketModeAppConfig
}

export const initializeApp = async () => {
  const app = new App(config())
  configureAppCommands(app)
  configureAppEvents(app)
  await app.start()
  console.log(`🤖 Robotina app is running!`)
}
