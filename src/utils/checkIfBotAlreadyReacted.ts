import { Reaction } from '@slack/web-api/dist/response/ConversationsHistoryResponse'

export const checkIfBotAlreadyReacted = (reactions: Reaction[]) => {
  const isReactedByBot = reactions.filter(
    (reaction) =>
      reaction.name === 'white_check_mark' &&
      reaction.users!.includes(<string>process.env.BOT_ID)
  )

  return isReactedByBot.length === 1
}
