import { unknownCommandBlock } from '../blocks/unknownCommandBlock'
import { wrongFormatBlock } from '../blocks/wrongFormatBlock'
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
    if (!user) {
      throw new Error('User not found')
    }
    const classNumber = splitChannelName(command.channel_name, respond)
    const validSubmissionFormat = validateSubmissionDeliveryFormat(
      Number(classNumber),
      command.text,
      respond
    )

    if (command.text && validSubmissionFormat) {
      await uploadTarea({
        classNumber,
        userId: user.id,
        delivery: command.text,
        firstName: user.profile?.first_name,
        lastName: user.profile?.last_name,
        email: user.profile?.email,
      })
      await say(`<@${user.id}> Tarea ${classNumber}: ${command.text}`)
    } else {
      await respond({
        text: 'Comando no encontrado 🔎.',
        blocks: unknownCommandBlock,
      })
    }
  } catch (error) {
    throw new Error('hubo un error')
  }
}

function splitChannelName(
  channelName: string,
  callbackNotValidChannel: Function
) {
  const lessonRegEx = /clase+-[0-9]/

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

function validateSubmissionDeliveryFormat(
  classNumber: number,
  delivery: string,
  callbackNotValidFormat: Function
) {
  const FIRST_LINK_FORMAT_LESSON_NUMBER = 5
  const codeFormatRegex = /^```([a-zA-Z])*?\n*?([\s\S]*?)```$/
  const linkFormatRegex = /github\.com\/[a-zA-Z]/

  if (
    classNumber < FIRST_LINK_FORMAT_LESSON_NUMBER &&
    codeFormatRegex.test(delivery)
  ) {
    return true
  } else if (
    classNumber >= FIRST_LINK_FORMAT_LESSON_NUMBER &&
    linkFormatRegex.test(delivery)
  ) {
    return true
  } else {
    callbackNotValidFormat({
      text: 'Formato de la tarea inválido',
      blocks: wrongFormatBlock,
    })
    throw new Error('El formato de la tarea no es válido.')
  }
}
