import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { isTaskSubmission } from '../../utils/validateTaskSubmission';
import replyApi from '../../api/marketplace/reply/replyApi';
import env from '../../config/env.config';

export const handleSubmissionReplyDeleted: Middleware<
  SlackEventMiddlewareArgs<'message'>,
  StringIndexed
> = async ({ client, message, logger }) => {
  if (
    message.subtype === 'message_deleted' &&
    !message.previous_message.subtype &&
    message.previous_message.thread_ts &&
    message.previous_message.parent_user_id === env.BOT_ID
  ) {
    try {
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: message.previous_message.thread_ts,
          channel: message.channel,
          limit: 1,
          inclusive: true,
        });

      const isSubmissionThread = isTaskSubmission(
        messagesFromChannel![0].text!
      );

      if (!isSubmissionThread) {
        return;
      }

      await replyApi.remove(message.previous_message.ts);

      logger.info(
        `Reply with ID "${message.previous_message.ts}" from user "${message.previous_message.user}" deleted successfully.`
      );
    } catch (error) {
      logger.error(
        `Something when wrong went handling a submission reply. Displaying relevant data: Message ID "${message.previous_message.ts}", Message author ID "${message.previous_message.user}", "Thread ID ${message.previous_message.thread_ts}", Thread author ID "${message.previous_message.parent_user_id}".`
      );
      logger.error(error);
    }
  }
};
