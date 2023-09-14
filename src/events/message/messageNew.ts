import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { isTaskSubmission } from '../../utils/validateTaskSubmission';
import replyApi from '../../api/marketplace/reply/replyApi';
import { ICreateReplyDto } from '../../api/marketplace/reply/ICreateReplyDto';
import env from '../../config/env.config';

export const handleSubmissionReplyNew: Middleware<
  SlackEventMiddlewareArgs<'message'>,
  StringIndexed
> = async ({ client, message, logger }) => {
  if (
    message.subtype === undefined &&
    message.thread_ts &&
    message.parent_user_id === env.BOT_ID
  ) {
    try {
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: message.thread_ts,
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
        user: message.user,
      });

      const createReplyDto: ICreateReplyDto = {
        authorId: slackUser!.id!,
        text: message.text!,
        threadTS: message.thread_ts!,
        timestamp: message.ts,
        username:
          (slackUser!.profile!.display_name as string) ||
          (slackUser!.profile!.real_name as string),
      };

      const reply = await replyApi.create(createReplyDto);

      await client.reactions.add({
        channel: message.channel,
        name: 'white_check_mark',
        timestamp: message.ts,
      });

      logger.info(
        `Reply with ID "${reply.id}" from user "${
          slackUser!.id
        }" saved successfully.`
      );
    } catch (error) {
      logger.error(
        `Something when wrong went handling a submission reply. Displaying relevant data: Message ID "${message.ts}", Message author ID "${message.user}", "Thread ID ${message.thread_ts}", Thread author ID "${message.parent_user_id}".`
      );
      logger.error(error);
    }
  }
};
