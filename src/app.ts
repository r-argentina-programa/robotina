/* eslint-disable import/first */
// eslint-disable-next-line import/newline-after-import
import * as dotenv from 'dotenv'
dotenv.config()
import { App } from '@slack/bolt'
import { configureAppCommands } from './commands'
import { configureAppEvents } from './events'

export const initializeApp = async () => {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN,
  })
  configureAppCommands(app)
  configureAppEvents(app)
  await app.start()
  console.log('🤖 Robotina app is running!')
}
