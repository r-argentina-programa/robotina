import { App, Logger, MessageEvent, SayFn, NextFn } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import dotenv from 'dotenv'
import { submitReply } from '../api/submitReply'
import { IReply } from '../interfaces/IReply'
dotenv.config()

export const saveSubmissionRepliesEvent = (app: App) => {
  const MESSAGE_EVENT = 'message'
  app.event(MESSAGE_EVENT, saveSubmissionRepliesFunction)
}

export type IMessageEvent = MessageEvent & {
  thread_ts?: string
  parent_user_id?: string
}

interface ISaveSubmissionsReplies {
  message: IMessageEvent
  client: WebClient
  logger: Logger
}

export const saveSubmissionRepliesFunction = async ({
  client,
  logger,
  message,
}: ISaveSubmissionsReplies) => {
  try {
    const THREAD_TS = '2312323213'

    if (message.thread_ts && message.parent_user_id === process.env.BOT_ID) {
      //slack uses timestamps (ts) as id for messages
      const thread = await client.conversations.history({
        latest: message.thread_ts,
        channel: message.channel,
        limit: 1,
        inclusive: true,
      })

      const isSubmission = isSubmissionTask(thread.messages![0].text!)

      if (isSubmission) {
        //@ts-ignore message.user exists in the api
        const userId = message.user

        const { user } = await client.users.info({ user: userId })

        if (user && user.profile?.display_name) {
          const reply: IReply = {
            authorId: userId,
            //@ts-ignore message.text exist in the api
            text: message.text,
            threadTS: THREAD_TS,
            timestamp: message.ts,
            username: user!.profile!.display_name,
          }
          const replyResponse = await submitReply(reply)

          logger.info('Reply submitted: ', replyResponse)
        }
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

const isSubmissionTask = (text: string) => {
  const SUBMISSION_NAME = 'Tarea'
  const submission = text.slice(0, 40).split(' ')
  if (submission[1] === SUBMISSION_NAME) {
    return true
  } else {
    return false
  }
}
