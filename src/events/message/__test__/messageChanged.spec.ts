import { expect, jest } from '@jest/globals';
import { Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { handleSubmissionReplyChanged } from '../messageChanged';
import { validConversationHistoryResponse } from './fixture/validConversationHistoryResponse';
import { userInfoResponse } from './fixture/userInfoResponse';
import replyApi from '../../../api/marketplace/reply/replyApi';
import { invalidConversationHistoryResponse } from './fixture/invalidConversationHistoryResponse';
import { messageChangedEvent } from './fixture/messageChangedEvent';

jest.mock('../../../api/marketplace/reply/replyApi');

const clientMock = {
  conversations: {
    history: jest.fn(),
  },
  users: {
    info: jest.fn(),
  },
} as unknown as jest.Mocked<WebClient>;

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<Logger>;

describe('handleSubmissionReply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a reply from a thread if said thread is from a submission and it's author is Robotina", async () => {
    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      validConversationHistoryResponse
    );

    clientMock.users.info.mockResolvedValueOnce(userInfoResponse);

    const replyUpdateMock = jest
      .spyOn(replyApi, 'update')
      .mockResolvedValueOnce({
        id: 1,
        authorId: '',
        text: '',
        threadTS: '',
        timestamp: '',
        username: '',
      });

    await handleSubmissionReplyChanged({
      client: clientMock,
      // @ts-ignore
      message: messageChangedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageChangedEvent.message.thread_ts,
      channel: messageChangedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(clientMock.users.info).toHaveBeenCalledTimes(1);
    expect(clientMock.users.info).toHaveBeenCalledWith({
      user: messageChangedEvent.message.user,
    });

    expect(replyUpdateMock).toHaveBeenCalledTimes(1);
    expect(replyUpdateMock).toHaveBeenCalledWith(
      messageChangedEvent.message.ts,
      {
        text: messageChangedEvent.message.text!,
        timestamp: messageChangedEvent.message.ts,
        username: expect.any(String),
      }
    );

    expect(loggerMock.info).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should not update a reply from a thread if said thread is not from a submission', async () => {
    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      invalidConversationHistoryResponse
    );

    const replyUpdateMock = jest.spyOn(replyApi, 'update');

    await handleSubmissionReplyChanged({
      client: clientMock,
      // @ts-ignore
      message: messageChangedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageChangedEvent.message.thread_ts,
      channel: messageChangedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(clientMock.users.info).toHaveBeenCalledTimes(0);
    expect(replyUpdateMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should log errors if they happen', async () => {
    clientMock.conversations.history.mockRejectedValueOnce(
      new Error('Network Error')
    );
    const replyUpdateMock = jest.spyOn(replyApi, 'update');

    await handleSubmissionReplyChanged({
      client: clientMock,
      // @ts-ignore
      message: messageChangedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageChangedEvent.message.thread_ts,
      channel: messageChangedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(clientMock.users.info).toHaveBeenCalledTimes(0);
    expect(replyUpdateMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });
});
