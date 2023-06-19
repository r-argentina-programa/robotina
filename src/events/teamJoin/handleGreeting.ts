import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { greetingsBlock } from '../../blocks/greetingsBlock';

export const handleGreeting: Middleware<
  SlackEventMiddlewareArgs<'team_join'>,
  StringIndexed
> = async ({ client, logger, event }): Promise<void> => {
  try {
    const { channel } = await client.conversations.open({
      users: event.user.id,
      return_im: true,
    });

    if (!channel || !channel.id) {
      throw new Error('Channel not found');
    }

    await client.chat.postMessage(greetingsBlock(channel.id));
  } catch (error) {
    logger.error(
      `Something went wrong when trying to greet an user. Displaying relevant data: Event type: "${event.type}", user: "${event.user.id}".`
    );
    logger.error(error);
  }
};
