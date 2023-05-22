import { expect, jest } from '@jest/globals';
import { Logger, App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import {
  IMessageEvent,
  saveSubmissionRepliesFunction,
  saveSubmissionRepliesEvent,
} from '../saveSubmissionReplies';

jest.mock('../../api/submitReply');

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
    users: {
      info: jest.fn(),
    },
  };
  return { WebClient: jest.fn(() => properties) };
});

const mockedWebClient = new WebClient() as jest.Mocked<WebClient>;

let logger: Logger;
let client: WebClient;
let message: IMessageEvent;

describe('saveSubmissionRepliesFunction', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    client = mockedWebClient;
    logger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as Logger;
    message = {
      thread_ts: 'THREAD_TS_TEST',
      channel: 'CHANNEL_TEST',
      parent_user_id: 'PARENT_USER_ID_TEST',
      // @ts-ignore message.user exists in the api
      user: 'USER_ID_TEST',
    } as unknown as IMessageEvent;

    jest.resetModules(); // it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should save a submission reply if thread author is the same as the bot id and is valid a submission', async () => {
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';
    const VALID_PARENT_MESSAGE_TEXT = 'Tarea 11: 123';
    const USER_DISPLAY_NAME_TEST = 'USER_DISPLAY_NAME_TEST';

    mockedWebClient.conversations.history.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        messages: [{ text: VALID_PARENT_MESSAGE_TEXT }],
      })
    );

    mockedWebClient.users.info.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        user: { profile: { display_name: USER_DISPLAY_NAME_TEST } },
      })
    );
    await saveSubmissionRepliesFunction({
      client,
      logger,
      message,
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(client.conversations.history).toHaveBeenCalledTimes(1);
    expect(client.conversations.history).toHaveBeenCalledWith({
      latest: message.thread_ts,
      channel: message.channel,
      limit: 1,
      inclusive: true,
    });
    expect(client.users.info).toHaveBeenCalledTimes(1);
    // @ts-ignore message.user exists in api
    expect(client.users.info).toHaveBeenCalledWith({ user: message.user });
    expect(logger.error).toHaveBeenCalledTimes(0);
  });

  it('should not save reply if thread author is not bot id', async () => {
    message.parent_user_id = '123';
    process.env.BOT_ID = 'DIFFERENT_ID';
    await saveSubmissionRepliesFunction({
      client,
      logger,
      message,
    });
    expect(client.conversations.history).toHaveBeenCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);
  });

  it('should throw if user is not found in slack api', async () => {
    const EXPECTED_ERROR = new Error('Slack-api Error: User not found');
    const VALID_PARENT_MESSAGE_TEXT = 'Tarea 11: 123';
    mockedWebClient.users.info.mockResolvedValue({ ok: false });
    mockedWebClient.conversations.history.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        messages: [{ text: VALID_PARENT_MESSAGE_TEXT }],
      })
    );
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';
    await saveSubmissionRepliesFunction({
      client,
      logger,
      message,
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(EXPECTED_ERROR);
  });

  it('should call logger.error if slack api returns an error', async () => {
    const EXPECTED_ERROR = new Error('Unexpected api error');
    mockedWebClient.conversations.history.mockRejectedValue(EXPECTED_ERROR);
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';
    await saveSubmissionRepliesFunction({
      client,
      logger,
      message,
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(EXPECTED_ERROR);
  });

  it('should not call users.info if thread is not a submission', async () => {
    process.env.BOT_ID = 'PARENT_USER_ID_TEST';

    const INVALID_PARENT_MESSAGE_TEXT = '111111111111111111111111111111';

    mockedWebClient.conversations.history.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        messages: [{ text: INVALID_PARENT_MESSAGE_TEXT }],
      })
    );

    await saveSubmissionRepliesFunction({
      client,
      logger,
      message,
    });

    expect(client.conversations.history).toHaveBeenCalledTimes(1);
    expect(client.users.info).toBeCalledTimes(0);
    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);
  });
});

describe('saveSubmissionRepliesEvent', () => {
  const mockedApp = new App() as jest.Mocked<App>;
  const MESSAGE_EVENT = 'message';

  it('should configure app correctly', async () => {
    saveSubmissionRepliesEvent(mockedApp);
    expect(mockedApp.event).toHaveBeenCalledTimes(1);
    expect(mockedApp.event).toHaveBeenCalledWith(
      MESSAGE_EVENT,
      saveSubmissionRepliesFunction
    );
  });
});
