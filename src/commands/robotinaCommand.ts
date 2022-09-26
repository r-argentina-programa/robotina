import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { StringIndexed } from '@slack/bolt/dist/types/helpers'

interface Command {
  command: SlashCommand
  ack: AckFn<string>
  say: SayFn
  respond: RespondFn
}

export default async function robotinaCommand(
  { command, ack, say, respond }: Command,
  app: App<StringIndexed>
) {
  await ack()

  const splittedCommand = commandSplitter(command.text)
function commandSplitter(command: string): Array<string> {
  const splittedCommand = command.split(' ')
  return splittedCommand
}
