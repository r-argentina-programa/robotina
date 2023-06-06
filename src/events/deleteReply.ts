import * as dotenv from 'dotenv';
import { App, KnownEventFromType, Logger, MessageEvent } from '@slack/bolt';
import { WebClient } from '@slack/web-api/dist/WebClient';
import { deleteReply } from '../api/deleteReply';
import { isTaskSubmission } from '../utils/validateTaskSubmission';

dotenv.config();

export type IMessageEvent = KnownEventFromType<'message'> & {
  previous_message?: MessageEvent & {
    thread_ts?: string;
    parent_user_id?: string;
  };
};

export interface IDeleteReplyFunction {
  event: IMessageEvent;
  client: WebClient;
  logger: Logger;
}

export const deleteReplyFunction = async ({
  event,
  client,
  logger,
}: IDeleteReplyFunction) => {
  if (
    event.subtype === 'message_deleted' &&
    event.previous_message.thread_ts &&
    event.previous_message.parent_user_id === process.env.BOT_ID
  ) {
    try {
      const thread = await client.conversations.history({
        latest: event.previous_message.thread_ts,
        channel: event.channel,
        limit: 1,
        inclusive: true,
      });

      const isSubmission = isTaskSubmission(thread.messages![0].text!);

      if (isSubmission) {
        const deleteReplyResponse = await deleteReply(
          event.previous_message.ts
        );

        logger.info('Reply deleted: ', deleteReplyResponse);
      }
    } catch (error) {
      logger.error(error);
    }
  }
};

export const deleteReplyEvent = (app: App) => {
  const MESSAGE_EVENT = 'message';
  app.event(MESSAGE_EVENT, deleteReplyFunction);
};
