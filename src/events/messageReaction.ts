import { App, ReactionAddedEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { uploadTarea } from '../commands/tarea/uploadTarea'
import { validateChannelName } from '../utils/validateChannelName'

export interface IReactionAddedEvent {
  event: ReactionAddedEvent | any
  client: WebClient
}

export const submitWithMessageReactionFunction = async ({
  client,
  event,
}: IReactionAddedEvent) => {
  if (event.reaction === 'robot_face') {
    const { user } = await client.users.info({
      user: event.item_user,
    })
    if (!user) {
      throw new Error('Slack-api Error: User not found')
    }
    const { channel } = await client.conversations.info({
      channel: event.item.channel,
    })
    if (!channel) {
      throw new Error('Slack-api Error: Channel not found')
    }

    const message = await client.conversations.history({
      latest: event.item.ts,
      channel: event.item.channel,
      limit: 1,
      inclusive: true,
    })
    if (!message) {
      throw new Error('Slack-api Error: Message not found')
    }

    const classNumber = validateChannelName(channel!.name as string)
    if (!classNumber) {
      throw new Error('Wrong channel name')
    }
    const messageText = message.messages![0]!.text as string

    await uploadTarea({
      classNumber,
      slackId: user.id as string,
      delivery: messageText,
      firstName: user.profile!.first_name,
      lastName: user.profile!.last_name,
      email: user.profile!.email as string,
    })
  }
}

export const submitWithMessageReaction = (app: App) => {
  const MESSAGE_REACTION_EVENT = 'reaction_added'
  app.event(MESSAGE_REACTION_EVENT, submitWithMessageReactionFunction)
}
