import { unknownCommandBlock } from '../blocks/unknownCommandBlock'
import { wrongFormatBlock } from '../blocks/wrongFormatBlock'
import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { uploadTarea } from '../api/uploadTarea'
import { createThread, ICreateThread } from '../api/createThread'
import { validateSubmissionDeliveryFormat } from '../utils/validateSubmissionDeliveryFormat'

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
    const validSubmissionFormat = validateSubmissionDeliveryFormat({
      classNumber: Number(classNumber),
      delivery: command.text,
    })
    if (!validSubmissionFormat) {
      return await respond({
        text: 'Formato de la tarea inválido',
        blocks: wrongFormatBlock,
      })
    }

    if (command.text && validSubmissionFormat) {
      const tarea = await uploadTarea({
        classNumber,
        userId: user.id,
        delivery: command.text,
        firstName: user.profile?.first_name,
        lastName: user.profile?.last_name,
        email: user.profile?.email,
      })
      const message = await say(
        `<@${user.id}> Tarea ${classNumber}: ${command.text}`
      )
      const thread: ICreateThread = {
        authorId: 'test-author-id',
        studentId: tarea.fkStudentId,
        text: message.message?.text as string,
        timestamp: message.ts as string,
        taskId: tarea.fkTaskId,
      }
      await createThread(thread)
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
