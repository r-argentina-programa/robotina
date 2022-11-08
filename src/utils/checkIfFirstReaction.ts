import { Reaction } from '@slack/web-api/dist/response/ConversationsHistoryResponse'

export const checkIfFirstReaction = (reactions: Reaction[]) => {
    const firstReaction = reactions.filter((reaction) => reaction.name === 'robot_face' && reaction.count === 1)
    
    return firstReaction.length === 1
  }
  
  