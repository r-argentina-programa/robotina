import { App, KnownEventFromType, Logger, MessageEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { modifyReply } from '../api/modifyReply'
import { IModifyReply } from '../interfaces/IModifyReply'
import { isSubmissionTask } from './saveSubmissionReplies'

export type IMessageEvent = KnownEventFromType<'message'> & {
  message?: MessageEvent & {
    thread_ts?: string
    parent_user_id?: string
    text?: string
  }
}

interface ISaveSubmissionsReplies {
  event: IMessageEvent
  client: WebClient
  logger: Logger
}

export const modifyReplyFunction = async ({
  client,
  logger,
  event,
}: ISaveSubmissionsReplies) => {
  try {
    if (
      event.subtype === 'message_changed' &&
      event.message.thread_ts &&
      event.message.parent_user_id === process.env.BOT_ID
    ) {
      logger.info(event)

      // slack uses timestamps (ts) as id for messages
      const thread = await client.conversations.history({
        latest: event.message.thread_ts,
        channel: event.channel,
        limit: 1,
        inclusive: true,
      })

      const isSubmission = isSubmissionTask(thread.messages![0].text!)

      if (isSubmission) {
        // @ts-ignore event.message.user exists in MessageChangedEvent
        const userId = event.message.user

        const { user } = await client.users.info({ user: userId })
        if (!user) {
          throw new Error('slack-api error: User not found')
        }
        const reply: IModifyReply = {
          text: event.message.text as string,
          timestamp: event.message.ts,
          username: user!.profile!.display_name as string,
        }
        const replyResponse = await modifyReply(event.message.ts, reply)

        logger.info('Reply modified: ', replyResponse)
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

export const modifyReplyEvent = (app: App) => {
  const MESSAGE_EVENT = 'message'
  app.event(MESSAGE_EVENT, modifyReplyFunction)
}
