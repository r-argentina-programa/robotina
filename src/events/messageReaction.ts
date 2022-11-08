import { App, ReactionAddedEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { createThread, ICreateThread } from '../api/createThread'
import { uploadTarea } from '../commands/tarea/uploadTarea'
import { createAuth0Id } from '../utils/createAuth0Id'
import { validateChannelName } from '../utils/validateChannelName'
import { getMentor } from '../api/getMentor'
import { Reaction } from '@slack/web-api/dist/response/ConversationsHistoryResponse'

export interface IReactionAddedEvent {
  event: ReactionAddedEvent | any
  client: WebClient
}

const checkIfFirstReaction = (reactions: Reaction[]) => {
  const firstReaction = reactions.filter((reaction) => reaction.name === 'robot_face' && reaction.count === 1)
  
  return firstReaction.length === 1
}

const checkIfIsMentorReaction = (usersArray: any) => {

  let isMentor = false

  const user = usersArray[0]

  user.roles[0] === 'Mentor' ?
    isMentor = true :
    isMentor = false

  return isMentor
}

export const submitWithMessageReactionFunction = async ({
  client,
  event,
}: IReactionAddedEvent) => {
  const conversationResponse = await client.conversations.history({
    latest: event.item.ts,
    channel: event.item.channel,
    limit: 1,
    inclusive: true,
  })
  if (!conversationResponse) {
    throw new Error('Slack-api Error: Message not found')
  }
  const isFirstReaction = checkIfFirstReaction(conversationResponse.messages![0]!.reactions as Reaction[])
  const auth0Id = createAuth0Id(event.user)
  const userResponse = await getMentor(auth0Id)
  const isMentor = checkIfIsMentorReaction(userResponse)

  if (event.reaction === 'robot_face'  && isFirstReaction &&
  event.item_user !== process.env.BOT_ID &&  (isMentor ||
    event.item_user === event.user)) {

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

    const classNumber = validateChannelName(channel!.name as string)
    if (!classNumber) {
      throw new Error('Wrong channel name')
    }
    const messageText = conversationResponse.messages![0]!.text as string

    const tarea = await uploadTarea({
      classNumber,
      slackId: user.id as string,
      delivery: messageText,
      firstName: user.profile!.first_name,
      lastName: user.profile!.last_name,
      email: user.profile!.email as string,
    })

    const botMessage = await client.chat.postMessage({
      channel: event.item.channel,
      text: `<@${user.id}> Tarea ${classNumber}: ${messageText}`
    })

    const thread: ICreateThread = {
      authorId: <string>process.env.BOT_ID,
      studentId: tarea.fkStudentId,
      text: botMessage.message!.text as string,
      timestamp: botMessage.ts as string,
      taskId: tarea.fkTaskId,
    }

    await createThread(thread)
  }
}

export const submitWithMessageReaction = (app: App) => {
  const MESSAGE_REACTION_EVENT = 'reaction_added'
  app.event(MESSAGE_REACTION_EVENT, submitWithMessageReactionFunction)
}
