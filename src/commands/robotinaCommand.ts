import { AckFn, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api/dist/WebClient'

interface Command {
  command: SlashCommand
  ack: AckFn<string>
  say: SayFn
  respond: RespondFn
  client: WebClient
}

export default async function robotinaCommand({
  command,
  ack,
  say,
  respond,
  client,
}: Command) {
  await ack()

  const { user } = await client.users.info({
    user: command.user_id,
  })

  const splittedCommand = splitCommand(command.text)

  // ejemplo
  if (splittedCommand[0] === 'tarea') {
    const userData = {
      user_id: user?.id,
      user_name: user?.real_name,
      user_email: user?.profile?.email,
    }
    await respond(
      `ID: ${userData.user_id}, Name: ${userData.user_name}, Email: ${userData.user_email}`
    )
    await respond(
      `Valor1: ${splittedCommand[1]}, Valor2: ${splittedCommand[2]}`
    )
  } else {
    await say('Disculpa no entendí ese comando')
  }
}

function splitCommand(command: string): Array<string> {
  const splittedCommand = command.split(' ')
  return splittedCommand
}
