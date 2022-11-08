import { App, KnownEventFromType, Logger, MessageEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { IModifyReply, modifyReply } from '../api/modifyReply'
import { isTaskSubmission } from '../utils/validateTaskSubmission'

export type IMessageEvent = KnownEventFromType<'message'> & {
  message?: MessageEvent & {
    thread_ts?: string
    parent_user_id?: string
    text?: string
  }
}

export interface IModifyReplyFunction {
  event: IMessageEvent
  client: WebClient
  logger: Logger
}

export const modifyReplyFunction = async ({
  client,
  logger,
  event,
}: IModifyReplyFunction) => {
  try {
    if (
      event.subtype === 'message_changed' &&
      event.message.thread_ts &&
      event.message.parent_user_id === process.env.BOT_ID
    ) {
      // slack uses timestamps (ts) as id for messages
      const thread = await client.conversations.history({
        latest: event.message.thread_ts,
        channel: event.channel,
        limit: 1,
        inclusive: true,
      })

      const isSubmission = isTaskSubmission(thread.messages![0].text!)

      if (isSubmission) {
        // @ts-ignore event.message.user exists in MessageChangedEvent
        const userId = event.message.user

        const { user } = await client.users.info({ user: userId })
        if (!user) {
          throw new Error('Slack-api Error: User not found')
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
