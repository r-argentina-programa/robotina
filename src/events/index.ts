import { App } from '@slack/bolt'
import { greetUserEvent } from './greeting'
import { saveSubmissionRepliesEvent } from './saveSubmissionReplies'

export const configureAppEvents = (app: App) => {
  greetUserEvent(app)
  saveSubmissionRepliesEvent(app)
}
