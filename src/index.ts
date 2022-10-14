import { App } from '@slack/bolt'
import * as dotenv from 'dotenv'
import { tareaSlashCommand } from './commands/tarea'
import { greetUserEvent } from './events/greeting'
import { saveSubmissionRepliesEvent } from './events/saveSubmissionReplies'

dotenv.config()

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
