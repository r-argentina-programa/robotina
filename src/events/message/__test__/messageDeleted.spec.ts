import { expect, jest } from '@jest/globals';
import { Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { validConversationHistoryResponse } from './fixture/validConversationHistoryResponse';
import replyApi from '../../../api/marketplace/reply/replyApi';
import { invalidConversationHistoryResponse } from './fixture/invalidConversationHistoryResponse';
import { messageChangedEvent } from './fixture/messageChangedEvent';
import { messageDeletedEvent } from './fixture/messageDeletedEvent';
import { handleSubmissionReplyDeleted } from '../messageDeleted';

jest.mock('../../../api/marketplace/reply/replyApi');

const clientMock = {
  conversations: {
    history: jest.fn(),
  },
} as unknown as jest.Mocked<WebClient>;

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<Logger>;

describe('handleSubmissionReplyDeleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a reply from a thread if said thread is from a submission and it's author is Robotina", async () => {
    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      validConversationHistoryResponse
    );

    const replyRemoveMock = jest
      .spyOn(replyApi, 'remove')
      .mockResolvedValueOnce();

    await handleSubmissionReplyDeleted({
      client: clientMock,
      // @ts-ignore
      message: messageDeletedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageDeletedEvent.previous_message.thread_ts,
      channel: messageDeletedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(replyRemoveMock).toHaveBeenCalledTimes(1);
    expect(replyRemoveMock).toHaveBeenCalledWith(
      messageDeletedEvent.previous_message.ts
    );

    expect(loggerMock.info).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should not delete a reply from a thread if said thread is not from a submission', async () => {
    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      invalidConversationHistoryResponse
    );

    const replyRemoveMock = jest.spyOn(replyApi, 'remove');

    await handleSubmissionReplyDeleted({
      client: clientMock,
      // @ts-ignore
      message: messageDeletedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageDeletedEvent.previous_message.thread_ts,
      channel: messageDeletedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(replyRemoveMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should log errors if they happen', async () => {
    clientMock.conversations.history.mockRejectedValueOnce(
      new Error('Network Error')
    );
    const replyRemoveMock = jest.spyOn(replyApi, 'remove');

    await handleSubmissionReplyDeleted({
      client: clientMock,
      // @ts-ignore
      message: messageDeletedEvent,
      logger: loggerMock,
    });

    expect(clientMock.conversations.history).toHaveBeenCalledTimes(1);
    expect(clientMock.conversations.history).toHaveBeenCalledWith({
      latest: messageChangedEvent.message.thread_ts,
      channel: messageChangedEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(replyRemoveMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });
});
