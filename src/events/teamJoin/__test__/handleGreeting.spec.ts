import { expect, jest } from '@jest/globals';
import { Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { handleGreeting } from '../handleGreeting';
import { teamJoinEvent } from './fixture/teamJoinEvent';

const clientMock = {
  conversations: {
    open: jest.fn(),
  },
  chat: {
    postMessage: jest.fn(),
  },
} as unknown as jest.Mocked<WebClient>;

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<Logger>;

describe('handleGreeting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should greet users who join the slack workspace', async () => {
    clientMock.conversations.open.mockResolvedValueOnce({
      ok: true,
      channel: {
        id: 'D069C7QFK',
      },
    });

    clientMock.chat.postMessage.mockResolvedValueOnce({ ok: true });

    await handleGreeting({
      client: clientMock,
      logger: loggerMock,
      // @ts-ignore
      event: teamJoinEvent,
    });

    expect(clientMock.conversations.open).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.open).toHaveBeenCalledWith({
      users: teamJoinEvent.user.id,
      return_im: true,
    });

    expect(clientMock.chat.postMessage).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if Robotina can't open a direct message to the user", async () => {
    clientMock.conversations.open.mockResolvedValueOnce({
      ok: true,
      channel: undefined,
    });

    clientMock.chat.postMessage.mockResolvedValueOnce({ ok: true });

    await handleGreeting({
      client: clientMock,
      logger: loggerMock,
      // @ts-ignore
      event: teamJoinEvent,
    });

    expect(clientMock.conversations.open).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.open).toHaveBeenCalledWith({
      users: teamJoinEvent.user.id,
      return_im: true,
    });

    expect(clientMock.chat.postMessage).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });

  it('should log any errors', async () => {
    clientMock.conversations.open.mockRejectedValueOnce(
      new Error('Network Error')
    );

    await handleGreeting({
      client: clientMock,
      logger: loggerMock,
      // @ts-ignore
      event: teamJoinEvent,
    });

    expect(clientMock.conversations.open).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.open).toHaveBeenCalledWith({
      users: teamJoinEvent.user.id,
      return_im: true,
    });

    expect(clientMock.chat.postMessage).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });
});
