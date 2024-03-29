import env from '../../../../config/env.config';

export const invalidConversationHistoryResponse = {
  ok: true,
  latest: '1686691426.115159',
  messages: [
    {
      bot_id: 'B044BF79ECE',
      type: 'message',
      text: 'Hola equipo!',
      user: env.BOT_ID,
      ts: '1686691426.115159',
      app_id: 'A0443AGKZFH',
      blocks: [Array],
      team: 'T044HRG6926',
      bot_profile: [Object],
      edited: [Object],
      attachments: [Array],
      thread_ts: '1686691426.115159',
      reply_count: 15,
      reply_users_count: 1,
      latest_reply: '1686710907.726769',
      reply_users: [Array],
      is_locked: false,
      subscribed: false,
    },
  ],
  has_more: true,
  is_limited: false,
  pin_count: 0,
  channel_actions_ts: null,
  channel_actions_count: 0,
  response_metadata: {
    next_cursor: 'bmV4dF90czoxNjg2NjkxNDEyNDQ2NDQ5',
    scopes: [
      'chat:write',
      'channels:read',
      'channels:history',
      'groups:history',
      'im:history',
      'im:write',
      'reactions:write',
      'mpim:history',
      'users:read',
      'users:read.email',
      'reactions:read',
      'commands',
    ],
    acceptedScopes: [
      'channels:history',
      'groups:history',
      'mpim:history',
      'im:history',
      'read',
    ],
  },
};
