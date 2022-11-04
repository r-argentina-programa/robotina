import { expect, jest } from '@jest/globals'
import { ReactionAddedEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { uploadTarea } from '../../commands/tarea/uploadTarea'
import { submitWithMessageReactionFunction } from '../messageReaction'
import { ConversationsHistoryResponse } from '@slack/web-api/dist/response/ConversationsHistoryResponse'

jest.mock('../../commands/tarea/uploadTarea')

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
      postMessage: jest.fn()
    }
  }
  return { WebClient: jest.fn(() => properties) }
})

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>
const mockedUploadTarea = uploadTarea as jest.Mocked<typeof uploadTarea>

let event: ReactionAddedEvent | any
let client: WebClient

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
    } as unknown as ReactionAddedEvent

    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('should make a submission when a message is reacted with the correct emoji', async () => {
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

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [{
        text: 'message text example',
        reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }]
      }],
      ok: true,
    })
    
    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      deletedAt: null,
      id: 22,
      createdAt: '2022-10-14T14:51:20.218Z',
      updatedAt: '2022-10-14T14:51:20.218Z',
    })

    mockedWebClient.chat.postMessage.mockResolvedValueOnce({
      message: {
        text: 'valid text'
      },
      ts: '1666879163.121179',
      ok: true
    })

    await submitWithMessageReactionFunction({ client, event })

    expect(client.users.info).toBeCalledTimes(1)
    expect(client.conversations.info).toBeCalledTimes(1)
    expect(client.conversations.history).toBeCalledTimes(1)
    expect(uploadTarea).toBeCalledTimes(1)
  })

  it('should not run if the message that received the reaction is from the bot', async () => {
    process.env.BOT_ID = 'U043BDYF80H'
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

  it('should make a submission when a message is reacted with the correct emoji', async () => {
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
      messages: [{
        text: 'message text example',
        reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }]
      }],
      ok: true,
    })
    
    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      deletedAt: null,
      id: 22,
      createdAt: '2022-10-14T14:51:20.218Z',
      updatedAt: '2022-10-14T14:51:20.218Z',
    })

    mockedWebClient.chat.postMessage.mockResolvedValueOnce({
      message: {
        text: 'valid text'
      },
      ts: '1666879163.121179',
      ok: true
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

    mockedWebClient.conversations.history.mockResolvedValueOnce({
      messages: [{
        text: 'message text example',
        reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }]
      }],
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
      messages: [{
        text: 'message text example',
        reactions: [{ name: 'robot_face', users: ['U043JJ1RA75'], count: 1 }]
      }],
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

    mockedWebClient.conversations.history.mockResolvedValueOnce(null as unknown as ConversationsHistoryResponse)

    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })
})
