import { App } from '@slack/bolt'
import { greetUserEvent } from './greeting'
import { modifyReplyEvent } from './modifyReply'
import { saveSubmissionRepliesEvent } from './saveSubmissionReplies'

export const configureAppEvents = (app: App) => {
  greetUserEvent(app)
  saveSubmissionRepliesEvent(app)
  modifyReplyEvent(app)
}
