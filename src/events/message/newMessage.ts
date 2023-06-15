import {
  GenericMessageEvent,
  Middleware,
  SlackEventMiddlewareArgs,
} from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { isTaskSubmission } from '../../utils/validateTaskSubmission';
import replyApi from '../../api/marketplace/reply/replyApi';
import { CreateReplyDto } from '../../api/marketplace/reply/dto/CreateReplyDto';

export const handleSubmissionReply: Middleware<
  SlackEventMiddlewareArgs<'message'>,
  StringIndexed
> = async ({ client, event, logger }) => {
  const genericMessageEvent = event as GenericMessageEvent;
  const isMessageFromThread = genericMessageEvent.thread_ts;
  const isThreadFromBot =
    genericMessageEvent.parent_user_id === process.env.BOT_ID;

  if (isMessageFromThread && isThreadFromBot) {
    try {
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: genericMessageEvent.thread_ts,
          channel: genericMessageEvent.channel,
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
        user: genericMessageEvent.user,
      });

      const createReplyDto: CreateReplyDto = {
        authorId: slackUser!.id!,
        text: genericMessageEvent.text!,
        threadTS: genericMessageEvent.thread_ts!,
        timestamp: genericMessageEvent.ts,
        username:
          (slackUser!.profile!.display_name as string) ||
          (slackUser!.profile!.real_name as string),
      };

      const reply = await replyApi.create(createReplyDto);

      logger.info(
        `Reply with ID "${reply.id}" from user "${
          slackUser!.id
        }" saved successfully.`
      );
    } catch (error) {
      logger.error(
        `Something when wrong went handling a submission reply. Displaying relevant data: Message ID "${genericMessageEvent.ts}", Message author ID "${genericMessageEvent.user}", "Thread ID ${genericMessageEvent.thread_ts}", Thread author ID "${genericMessageEvent.parent_user_id}".`
      );
      logger.error(error);
    }
  }
};
