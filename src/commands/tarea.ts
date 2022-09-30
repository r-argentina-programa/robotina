import { unknownCommandBlock } from '../blocks/unknownCommandBlock'
import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { uploadTarea } from '../api/uploadTarea'

interface Command {
  command: SlashCommand
  ack: AckFn<string>
  say: SayFn
  respond: RespondFn
  client: WebClient
}

export const tareaSlashCommand = (app: App) => {
  const TAREA_SLASH_COMMAND = '/tarea'
  app.command(TAREA_SLASH_COMMAND, tareaCommandFunction)
}

export const tareaCommandFunction = async ({
  command,
  ack,
  say,
  respond,
  client,
}: Command) => {
  await ack()

  try {
    const { user } = await client.users.info({
      user: command.user_id,
    })
    const classNumber = splitChannelName(command.channel_name, respond)

    if (command.text && classNumber) {
      const userData = await uploadTarea(user?.id, command.text, classNumber)
      await say(
        `<@${userData.slack_user_id}> Tarea ${classNumber}: ${userData.tarea}`
      )
    } else {
      await respond({
        text: 'Comando no encontrado 🔎.',
        blocks: unknownCommandBlock,
      })
    }
  } catch (error) {
    throw new Error(`${error}`)
  }
}

function splitChannelName(
  channelName: string,
  callbackNotValidChannel: Function
) {
  const lessonRegEx = new RegExp('clase+-[0-9]')

  if (lessonRegEx.test(channelName)) {
    const splittedChannelName = channelName.split('-')[1]
    return splittedChannelName
  } else {
    callbackNotValidChannel({
      text: 'Comando no encontrado 🔎.',
      blocks: unknownCommandBlock,
    })
    throw new Error('Comando no disponible en este canal.')
  }
}
