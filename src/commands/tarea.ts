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

  const { user } = await client.users.info({
    user: command.user_id,
  })
  const splittedCommand = splitCommand(command.text)

  if (splittedCommand[0]) {
    const classNumber = splitChannelName(command.channel_name)
    const userData = await uploadTarea(
      user?.id,
      splittedCommand[0],
      classNumber
    )

    await say(
      `<@${userData.slack_user_id}> Tarea ${classNumber}: ${userData.tarea}`
    )
  } else {
    await respond({
      text: 'Comando no encontrado 🔎.',
      blocks: unknownCommandBlock,
    })
  }
}

function splitCommand(command: string): Array<string> {
  const splittedCommand = command.split(' ')
  return splittedCommand
}

function splitChannelName(channelName: string) {
  const splittedChannelName = channelName.split('-')[1]
  return splittedChannelName
}
