import { expect, jest } from '@jest/globals';
import { Logger, App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import {
  IMessageEvent,
  deleteReplyFunction,
  deleteReplyEvent,
} from '../deleteReply';
import replyApi from '../../api/marketplace/reply/replyApi';

jest.mock('../../api/marketplace/reply/replyApi');

jest.mock('@slack/bolt', () => {
  const properties = {
    event: jest.fn(),
  };
  return {
    App: jest.fn(() => properties),
  };
});

jest.mock('@slack/web-api', () => {
  const properties = {
    conversations: {
      history: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => properties) };
});

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>;

let logger: Logger;
let client: WebClient;
let event: IMessageEvent;

describe('deleteReplyFunction', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    client = mockedWebClient;
    logger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as Logger;
    event = {
      subtype: 'message_deleted',
      previous_message: {
        thread_ts: 'THREAD_TS_TEST',
        parent_user_id: 'PARENT_USER_ID_TEST',
      },
    } as unknown as IMessageEvent;

    jest.resetModules(); // it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should delete a reply in marketplace api when message_deleted triggers', async () => {
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';
    const VALID_PARENT_MESSAGE_TEXT = 'Tarea 11: 123';

    mockedWebClient.conversations.history.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        messages: [{ text: VALID_PARENT_MESSAGE_TEXT }],
      })
    );

    await deleteReplyFunction({
      client,
      logger,
      event,
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(client.conversations.history).toHaveBeenCalledTimes(1);
    expect(client.conversations.history).toHaveBeenCalledWith({
      latest: event.previous_message!.thread_ts,
      channel: event.channel,
      limit: 1,
      inclusive: true,
    });
    expect(replyApi.remove).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(0);
  });

  it('should not delete a reply if thread author is not bot id', async () => {
    event.previous_message!.parent_user_id = '123';
    process.env.BOT_ID = 'DIFFERENT_ID';
    await deleteReplyFunction({
      client,
      logger,
      event,
    });
    expect(client.conversations.history).toHaveBeenCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);
  });

  it('should call error logger if slack api returns an error', async () => {
    const EXPECTED_ERROR = new Error('Unexpected api error');
    mockedWebClient.conversations.history.mockRejectedValue(EXPECTED_ERROR);
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';
    await deleteReplyFunction({
      client,
      logger,
      event,
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(EXPECTED_ERROR);
  });
});

describe('deleteSubmissionRepliesEvent', () => {
  const mockedApp = new App() as jest.Mocked<App>;
  const MESSAGE_EVENT = 'message';

  it('should configure app correctly', async () => {
    deleteReplyEvent(mockedApp);
    expect(mockedApp.event).toHaveBeenCalledTimes(1);
    expect(mockedApp.event).toHaveBeenCalledWith(
      MESSAGE_EVENT,
      deleteReplyFunction
    );
  });
});
