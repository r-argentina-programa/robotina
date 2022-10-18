import { expect, jest } from '@jest/globals'
import { TeamJoinEvent, Logger, App } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { greetUserEvent, greetUserFunction } from '../greeting'
import { greetingsBlock } from '../../blocks/greetingsBlock'

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
      open: jest.fn(),
      leave: jest.fn(),
    },
    chat: {
      postMessage: jest.fn(),
    },
  }
  return { WebClient: jest.fn(() => properties) }
})

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>

let logger: Logger
let event: TeamJoinEvent
let client: WebClient

beforeEach(() => {
  jest.clearAllMocks()
  client = mockedWebClient
  event = { user: { id: '5' }, type: 'team_join' }
  logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger
})

describe('greetUserFunction', () => {
  it('Should return a message if user is valid', async () => {
    const USER_CHANNEL_ID = '15'
    mockedWebClient.conversations.open.mockImplementation(() =>
      Promise.resolve({ channel: { id: USER_CHANNEL_ID }, ok: true })
    )
    await greetUserFunction({ client: mockedWebClient, event, logger })
    expect(mockedWebClient.conversations.open).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledTimes(0)
    expect(mockedWebClient.chat.postMessage).toHaveBeenCalledTimes(1)
    expect(mockedWebClient.chat.postMessage).toHaveBeenCalledWith({
      channel: USER_CHANNEL_ID,
      text: 'alt-text: Bienvenido a r-argentina-programa',
      blocks: greetingsBlock,
    })
  })
  it('should throw if user is invalid', async () => {
    const CHANNEL_NOT_FOUND_ERROR = { ok: false, error: 'channel_not_found' }
    mockedWebClient.conversations.open.mockImplementation(() =>
      Promise.reject(CHANNEL_NOT_FOUND_ERROR)
    )
    await greetUserFunction({ client, event, logger })
    expect(mockedWebClient.conversations.open).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(CHANNEL_NOT_FOUND_ERROR)
  })
})

const mockedApp = new App() as jest.Mocked<App>

describe('greetUserEvent', () => {
  it('should call and configure event once ', () => {
    const EVENT_NAME = 'team_join'
    greetUserEvent(mockedApp)
    expect(mockedApp.event).toHaveBeenCalledTimes(1)
    expect(mockedApp.event).toHaveBeenCalledWith(EVENT_NAME, greetUserFunction)
  })
})
