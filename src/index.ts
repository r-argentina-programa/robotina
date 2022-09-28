import * as dotenv from 'dotenv'
dotenv.config()

import { App } from '@slack/bolt'

import robotinaCommand from './commands/robotinaCommand'

import { greetUserEvent } from './events/greeting'


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
})
app.command('/robotina', robotinaCommand)

greetUserEvent(app)

;(async () => {
  // Start your app
  await app.start()

  console.log('🤖 Robotina app is running!')
})()
