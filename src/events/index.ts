import { App } from '@slack/bolt'
import { deleteReplyEvent } from './deleteReply'
import { greetUserEvent } from './greeting'
import { modifyReplyEvent } from './modifyReply'
import { saveSubmissionRepliesEvent } from './saveSubmissionReplies'
import { submitWithMessageReaction } from './messageReaction'

export const configureAppEvents = (app: App) => {
  greetUserEvent(app)
  saveSubmissionRepliesEvent(app)
  modifyReplyEvent(app)
  deleteReplyEvent(app)
  submitWithMessageReaction(app)
}
