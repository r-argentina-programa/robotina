import { App, Logger, TeamJoinEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { greetingsBlock } from '../blocks/greetingsBlock'

interface IChannelJoinedEvent {
  client: WebClient
  logger: Logger
  event: TeamJoinEvent
}

export const greetUserEvent = (app: App) => {
  const GREET_USER_EVENT = 'team_join'
  app.event(GREET_USER_EVENT, greetUserFunction)
}

export const greetUserFunction = async ({
  client,
  logger,
  event,
}: IChannelJoinedEvent): Promise<void> => {
  const user = event.user.id
  try {
    const openUserChat = await client.conversations.open({
      users: user,
      return_im: true,
    })
    if (!openUserChat.ok) {
      throw new Error('Channel not found')
    }
    const channelId = openUserChat.channel?.id as string
    await client.chat.postMessage({
      channel: channelId,
      text: 'alt-text: Bienvenido a r-argentina-programa',
      blocks: greetingsBlock,
    })
  } catch (error) {
    logger.error(error)
  }
}
