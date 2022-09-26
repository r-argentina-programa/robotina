import { App } from '@slack/bolt'
import { greetingsBlock } from '../blocks/greetingsBlock'

export const greetUser = (app: App) => {
  app.event('message', async ({ client, logger, message }): Promise<void> => {
    // @ts-ignore: message.user exists in slack API
    const user = message.user as string
    try {
      const openUserChat = await client.conversations.open({
        users: user,
        return_im: true,
      })
      const channelId = openUserChat.channel?.id as string
      await client.chat.postMessage({
        channel: channelId,
        text: 'alt-text: Bienvenido a r-argentina-programa',
        blocks: greetingsBlock,
      })
    } catch (error) {
      logger.error(error)
    }
  })
}
