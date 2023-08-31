import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { isTaskSubmission } from '../../utils/validateTaskSubmission';
import replyApi from '../../api/marketplace/reply/replyApi';
import { IUpdateReplyDto } from '../../api/marketplace/reply/IUpdateReplyDto';
import env from '../../config/env.config';

export const handleSubmissionReplyChanged: Middleware<
  SlackEventMiddlewareArgs<'message'>,
  StringIndexed
> = async ({ client, message, logger }) => {
  if (
    message.subtype === 'message_changed' &&
    !message.message.subtype &&
    message.message.thread_ts &&
    message.message.parent_user_id === env.BOT_ID
  ) {
    try {
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: message.message.thread_ts,
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

      const { user: slackUser } = await client.users.info({
        user: message.message.user,
      });

      const updateReplyDto: IUpdateReplyDto = {
        text: message.message.text!,
        timestamp: message.message.ts,
        username:
          (slackUser!.profile!.display_name as string) ||
          (slackUser!.profile!.real_name as string),
      };

      const reply = await replyApi.update(message.message.ts, updateReplyDto);

      logger.info(
        `Reply with ID "${reply.id}" from user "${
          slackUser!.id
        }" updated successfully.`
      );
    } catch (error) {
      logger.error(
        `Something when wrong went handling a submission reply. Displaying relevant data: Message ID "${message.message.ts}", Message author ID "${message.message.user}", "Thread ID ${message.message.thread_ts}", Thread author ID "${message.message.parent_user_id}".`
      );
      logger.error(error);
    }
  }
};
