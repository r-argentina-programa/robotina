/* eslint-disable import/first */
// eslint-disable-next-line import/newline-after-import
import * as dotenv from 'dotenv'
dotenv.config()
import { App } from '@slack/bolt'
import { tareaSlashCommand } from './commands/tarea'
import { greetUserEvent } from './events/greeting'
import { saveSubmissionRepliesEvent } from './events/saveSubmissionReplies'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
})

saveSubmissionRepliesEvent(app)
tareaSlashCommand(app)
greetUserEvent(app)
;(async () => {
  // Start your app
  await app.start()

  // eslint-disable-next-line no-console
  console.log('🤖 Robotina app is running!')
})()
