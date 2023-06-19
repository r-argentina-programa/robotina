import env from '../../../../config/env.config';

export const messageDeletedEvent = {
  type: 'message',
  subtype: 'message_deleted',
  previous_message: {
    client_msg_id: 'b120045a-8678-4128-9022-7fd5ec5a1dbf',
    type: 'message',
    text: 'AGUANTE RACING 25!',
    user: 'U044WEP8EQ1',
    ts: '1686802015.141529',
    blocks: [[Object]],
    team: 'T044HRG6926',
    edited: { user: 'U044WEP8EQ1', ts: '1687056804.000000' },
    thread_ts: '1686691426.115159',
    parent_user_id: env.BOT_ID,
  },
  channel: 'C04T7UT7QSE',
  hidden: true,
  deleted_ts: '1686802015.141529',
  event_ts: '1687184183.000100',
  ts: '1687184183.000100',
  channel_type: 'channel',
};
