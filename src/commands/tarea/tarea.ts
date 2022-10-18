import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'
import { unknownCommandBlock } from '../../blocks/unknownCommandBlock'
import { wrongFormatBlock } from '../../blocks/wrongFormatBlock'
import { uploadTarea } from './uploadTarea'
import { createThread, ICreateThread } from '../../api/createThread'
import { validateSubmissionDeliveryFormat } from '../../utils/validateSubmissionDeliveryFormat'
import { validateChannelName } from '../../utils/validateChannelName'

interface Command {
  command: SlashCommand
  ack: AckFn<string>
  say: SayFn
  respond: RespondFn
  client: WebClient
}

export const tareaCommandFunction = async ({
  command,
  ack,
  say,
  respond,
  client,
}: Command): Promise<void> => {
  await ack()
  try {
    const { user } = await client.users.info({
      user: command.user_id,
    })
    if (!user) {
      throw new Error('User not found')
    }
    const classNumber = validateChannelName(command.channel_name)
    if (!classNumber) {
      await respond({
        text: 'Comando no disponible en este canal.',
        blocks: unknownCommandBlock,
      })
      return
    }

    const validSubmissionFormat = validateSubmissionDeliveryFormat({
      classNumber: Number(classNumber),
      delivery: command.text,
    })
    if (!validSubmissionFormat) {
      await respond({
        text: 'Formato de la tarea inválido',
        blocks: wrongFormatBlock,
      })
      return
    }

    if (command.text && validSubmissionFormat) {
      const tarea = await uploadTarea({
        classNumber,
        userId: user.id as string,
        delivery: command.text,
        firstName: user.profile!.first_name,
        lastName: user.profile!.last_name,
        email: user.profile!.email,
      })
      const message = await say(
        `<@${user.id}> Tarea ${classNumber}: ${command.text}`
      )
      const thread: ICreateThread = {
        authorId: <string>process.env.BOT_ID,
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

export const tareaSlashCommand = (app: App) => {
  const TAREA_SLASH_COMMAND = '/tarea'
  app.command(TAREA_SLASH_COMMAND, tareaCommandFunction)
}
