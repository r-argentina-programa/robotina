export const conversationsHistoryResponse = {
  messages: [
    {
      client_msg_id: 'd7c87be0-275b-4223-8095-13e2cd271f8f',
      type: 'message',
      text: 'Hola, aca dejo la tarea\n\n```console.log("Hello World!!!")```\n',
      user: 'U044WEP8EQ1',
      ts: '1688995701.853679',
      blocks: [[Object]],
      team: 'T044HRG6926',
      reactions: [[Object]],
    },
  ],
};

export const usersInfoResponse = {
  user: {
    id: 'U044WEP8EQ1',
    team_id: 'T044HRG6926',
    name: 'leonel.mariano.g',
    deleted: false,
    color: '9f69e7',
    real_name: 'leonel.mariano.g',
    tz: 'America/Buenos_Aires',
    tz_label: 'Argentina Time',
    tz_offset: -10800,
    profile: {
      title: '',
      phone: '',
      skype: '',
      real_name: 'leonel.mariano.g',
      real_name_normalized: 'leonel.mariano.g',
      display_name: 'leonelgauna',
      display_name_normalized: 'leonelgauna',
      fields: null,
      status_text: '',
      status_emoji: '',
      status_emoji_display_info: [],
      status_expiration: 0,
      avatar_hash: 'ge236cb2c22e',
      email: 'leonel.mariano.g@gmail.com',
      huddle_state: 'default_unset',
      first_name: 'leonel.mariano.g',
      last_name: '',
      image_24:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-24.png',
      image_32:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-32.png',
      image_48:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-48.png',
      image_72:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-72.png',
      image_192:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-192.png',
      image_512:
        'https://secure.gravatar.com/avatar/e236cb2c22e32ece12e8895951bf8bab.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0023-512.png',
      status_text_canonical: '',
      team: 'T044HRG6926',
    },
    is_admin: true,
    is_owner: true,
    is_primary_owner: true,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    is_app_user: false,
    updated: 1686257555,
    is_email_confirmed: true,
    who_can_share_contact_card: 'EVERYONE',
  },
};

export const conversationsInfoResponse = {
  channel: {
    id: 'C04T7UT7QSE',
    name: 'clase-1',
    is_channel: true,
    is_group: false,
    is_im: false,
    is_mpim: false,
    is_private: false,
    created: 1678388817,
    is_archived: false,
    is_general: false,
    unlinked: 0,
    name_normalized: 'clase-1',
    is_shared: false,
    is_org_shared: false,
    is_pending_ext_shared: false,
    pending_shared: [],
    context_team_id: 'T044HRG6926',
    updated: 1678388817824,
    parent_conversation: null,
    creator: 'U04TVES87JL',
    is_ext_shared: false,
    shared_team_ids: ['T044HRG6926'],
    pending_connected_team_ids: [],
    is_member: true,
    last_read: '1686256188.372579',
    topic: { value: '', creator: '', last_set: 0 },
    purpose: { value: '', creator: '', last_set: 0 },
    previous_names: [],
  },
};

export const chatGetPermalinkResponse = {
  permalink:
    'https://r-a-team-test.slack.com/archives/C04T7UT7QSE/p1688995701853679',
};

export const chatPostMessageResponse = {
  ok: true,
  channel: 'C04T7UT7QSE',
  ts: '1688995709.519859',
  message: {
    bot_id: 'B044BF79ECE',
    type: 'message',
    text:
      'Tarea subida con éxito <@U044WEP8EQ1>! \n' +
      '\n' +
      'Acá está el <https://r-a-team-test.slack.com/archives/C04T7UT7QSE/p1688995701853679|Link> al mensaje original.\n' +
      '\n' +
      'Tarea:\n' +
      '      Hola, aca dejo la tarea\n' +
      '\n' +
      '```console.log("Hello World!!!")```\n' +
      '\n' +
      '\n' +
      '*Para agregar correcciones responder en este hilo (no en el mensaje original).*',
    user: 'U0443GZ6V39',
    ts: '1688995709.519859',
    app_id: 'A0443AGKZFH',
    blocks: [[Object]],
    team: 'T044HRG6926',
    bot_profile: {
      id: 'B044BF79ECE',
      app_id: 'A0443AGKZFH',
      name: 'r-a-team-test-app',
      icons: [Object],
      deleted: false,
      updated: 1664486675,
      team_id: 'T044HRG6926',
    },
  },
  response_metadata: {
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
    acceptedScopes: ['chat:write'],
  },
};
