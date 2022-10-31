import { expect, jest } from '@jest/globals'
import { ReactionAddedEvent } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { uploadTarea } from '../../commands/tarea/uploadTarea'
import { submitWithMessageReactionFunction } from '../messageReaction'

jest.mock('../../commands/tarea/uploadTarea')

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
  }
  return { WebClient: jest.fn(() => properties) }
})

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>

let event: ReactionAddedEvent | any
let client: WebClient

describe('messageReaction', () => {
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
      messages: [{ text: 'message text example' }],
      ok: true,
    })

    await submitWithMessageReactionFunction({ client, event })

    expect(client.users.info).toBeCalledTimes(1)
    expect(client.conversations.info).toBeCalledTimes(1)
    expect(client.conversations.history).toBeCalledTimes(1)
    expect(uploadTarea).toBeCalledTimes(1)
  })

  it('should throw error when user is not found', async () => {
    const EXPECTED_ERROR = new Error('Slack-api Error: User not found')
    mockedWebClient.users.info.mockResolvedValueOnce({ ok: false })

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

    mockedWebClient.conversations.history.mockRejectedValueOnce(EXPECTED_ERROR)

    try {
      await submitWithMessageReactionFunction({ client, event })
    } catch (err) {
      expect(err).toEqual(EXPECTED_ERROR)
    }
  })
})
