import { expect, jest } from '@jest/globals'
import { ReactionAddedEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { ConversationsHistoryResponse } from '@slack/web-api/dist/response/ConversationsHistoryResponse'
import { uploadTarea } from '../../commands/tarea/uploadTarea'
import { getMentor } from '../../api/getMentor'
import { submitWithMessageReactionFunction } from '../messageReaction'
import { IUser } from '../../interfaces/IUser'


jest.mock('../../commands/tarea/uploadTarea')
jest.mock('../../api/getMentor')
jest.mock('../../api/createThread')

jest.mock('@slack/bolt', () => {
  const properties = {
    event: jest.fn(),
  }
  return {
    App: jest.fn(() => properties),
  }
})

jest.mock('@slack/web-api', () => {
  const properties = {
    conversations: {
      history: jest.fn(),
      info: jest.fn(),
    },
    users: {
      info: jest.fn(),
    },
    chat: {
      postMessage: jest.fn(),
    },
    reactions: {
      add: jest.fn()
    }
  }
  return { WebClient: jest.fn(() => properties) }
})

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>
const mockedUploadTarea = uploadTarea as jest.Mocked<typeof uploadTarea>
const mockedGetMentor = getMentor as jest.Mocked<typeof getMentor>

let event: ReactionAddedEvent | any
let client: WebClient

const MOCKED_USER: IUser[] = [
  {
      "id": 1,
      "username": "test-username",
      "externalId": "external-id-test",
      "roles": [
          "Mentor"
      ]
  }
]

describe('messageReaction', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    client = mockedWebClient
    event = {
      reaction: 'robot_face',
      item_user: 'U043BDYF80H',
      item: {
        channel: {
          name: 'clase-12',
        },
        ts: '1666879163.121179',
      },
      user: 'U043BDYF80G'
    } as unknown as ReactionAddedEvent

    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('should make a submission when a message is reacted with the correct emoji', async () => {
    process.env.BOT_ID = 'test-bot-id'
    mockedWebClient.users.info.mockResolvedValueOnce({
      user: {
        id: 'U043BDYF80H',
        profile: {
          first_name: 'john',
          last_name: 'doe',
          email: 'john@doe.com',
        },
      },
      ok: true,
    })

    mockedGetMentor.mockResolvedValue(MOCKED_USER)

    mockedWebClient.conversations.info.mockResolvedValueOnce({
      channel: {
        name: 'clase-12',
      },
      ok: true,
    })

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [
        {
          text: 'message text example',
          reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }],
        },
      ],
      ok: true,
    })

    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      id: 22,
      isActive: true,
    })

    mockedWebClient.chat.postMessage.mockResolvedValueOnce({
      message: {
        text: 'valid text',
      },
      ts: '1666879163.121179',
      ok: true,
    })

    await submitWithMessageReactionFunction({ client, event })

    expect(client.users.info).toBeCalledTimes(1)
    expect(client.conversations.info).toBeCalledTimes(1)
    expect(client.conversations.history).toBeCalledTimes(1)
    expect(uploadTarea).toBeCalledTimes(1)
  })

  it('should not run if the message that received the reaction is from the bot', async () => {
    process.env.BOT_ID = 'U043BDYF80H'

    mockedGetMentor.mockResolvedValue(MOCKED_USER)

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [{
        text: 'message text example',
        reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }]
      }],
      ok: true,
    })

    await submitWithMessageReactionFunction({ client, event })

    expect(client.users.info).toBeCalledTimes(0)
    expect(client.conversations.info).toBeCalledTimes(0)
    expect(uploadTarea).toBeCalledTimes(0)
  }) 
  
  it('should not run if the reaction is not from a mentor', async () => {
    mockedGetMentor.mockResolvedValue([
      {
          "id": 1,
          "username": "test-username",
          "externalId": "external-id-test",
          "roles": [
              "Student"
          ]
      }
    ])

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [
        {
          text: 'message text example',
          reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }],
        },
      ],
      ok: true,
    })

    await submitWithMessageReactionFunction({ client, event })

    expect(client.users.info).toBeCalledTimes(0)
    expect(client.conversations.info).toBeCalledTimes(0)
    expect(uploadTarea).toBeCalledTimes(0)
  })

  it('should throw error when the channel name is wrong', async () => {
    mockedGetMentor.mockResolvedValue(MOCKED_USER)
    const EXPECTED_ERROR = new Error('Wrong channel name')
    mockedWebClient.users.info.mockResolvedValueOnce({
      user: {
        id: 'U043BDYF80H',
        profile: {
          first_name: 'john',
          last_name: 'doe',
          email: 'john@doe.com',
        },
      },
      ok: true,
    })

    mockedWebClient.conversations.info.mockResolvedValueOnce({
      channel: {
        name: 'aaaaaa',
      },
      ok: true,
    })

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [
        {
          text: 'message text example',
          reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }],
        },
      ],
      ok: true,
    })

    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      id: 22,
      isActive: true,
    })

    mockedWebClient.chat.postMessage.mockResolvedValueOnce({
      message: {
        text: 'valid text',
      },
      ts: '1666879163.121179',
      ok: true,
    })
    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })

  it('should throw error when user is not found', async () => {
    const EXPECTED_ERROR = new Error('Slack-api Error: User not found')
    mockedWebClient.users.info.mockResolvedValueOnce({ ok: false })
    mockedGetMentor.mockResolvedValue(MOCKED_USER)

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [
        {
          text: 'message text example',
          reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }],
        },
      ],
      ok: true,
    })

    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })

  it('should throw error when user is not found', async () => {
    const EXPECTED_ERROR = new Error('Slack-api Error: Channel not found')
    mockedGetMentor.mockResolvedValue(MOCKED_USER)

    mockedWebClient.users.info.mockResolvedValueOnce({
      user: {
        id: 'U043BDYF80H',
        profile: {
          first_name: 'john',
          last_name: 'doe',
          email: 'john@doe.com',
        },
      },
      ok: true,
    })

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [
        {
          text: 'message text example',
          reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }],
        },
      ],
      ok: true,
    })

    mockedWebClient.conversations.info.mockResolvedValueOnce({ ok: false })

    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })

  it('should throw error when user is not found', async () => {
    const EXPECTED_ERROR = new Error('Slack-api Error: Message not found')
    mockedGetMentor.mockResolvedValue(MOCKED_USER)

    mockedWebClient.users.info.mockResolvedValueOnce({
      user: {
        id: 'U043BDYF80H',
        profile: {
          first_name: 'john',
          last_name: 'doe',
          email: 'john@doe.com',
        },
      },
      ok: true,
    })

    mockedWebClient.conversations.info.mockResolvedValueOnce({
      channel: {
        name: 'clase-12',
      },
      ok: true,
    })

    mockedWebClient.conversations.history.mockResolvedValueOnce(
      null as unknown as ConversationsHistoryResponse
    )

    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })
})
