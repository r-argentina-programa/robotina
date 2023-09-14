import { expect, jest } from '@jest/globals';
import { Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { handleSubmissionReplyNew } from '../messageNew';
import { validConversationHistoryResponse } from './fixture/validConversationHistoryResponse';
import { userInfoResponse } from './fixture/userInfoResponse';
import replyApi from '../../../api/marketplace/reply/replyApi';
import { invalidConversationHistoryResponse } from './fixture/invalidConversationHistoryResponse';
import { messageNewEvent } from './fixture/messageNewEvent';

jest.mock('../../../api/marketplace/reply/replyApi');

jest.mock('@slack/bolt', () => ({
  App: jest.fn(() => ({ event: jest.fn() })),
}));

jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn(() => ({
    conversations: {
      history: jest.fn(),
    },
    users: {
      info: jest.fn(),
    },
    reactions: {
      add: jest.fn(),
    },
  })),
}));

const webClientMock = new WebClient();
const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as Logger;

describe('handleSubmissionReply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save a new message as a submission reply if the thread author is robotina and the thread is from a submission', async () => {
    const conversationHistoryMock = jest
      .spyOn(webClientMock.conversations, 'history')
      // @ts-ignore
      .mockResolvedValueOnce(validConversationHistoryResponse);

    const userInfoMock = jest
      .spyOn(webClientMock.users, 'info')
      .mockResolvedValueOnce(userInfoResponse);

    const replyCreateMock = jest
      .spyOn(replyApi, 'create')
      .mockResolvedValueOnce({
        id: 1,
        authorId: '',
        text: '',
        threadTS: '',
        timestamp: '',
        username: '',
      });

    await handleSubmissionReplyNew({
      client: webClientMock,
      // @ts-ignore
      message: messageNewEvent,
      logger: loggerMock,
    });

    expect(conversationHistoryMock).toHaveBeenCalledTimes(1);
    expect(conversationHistoryMock).toHaveBeenCalledWith({
      latest: messageNewEvent.thread_ts,
      channel: messageNewEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(userInfoMock).toHaveBeenCalledTimes(1);
    expect(userInfoMock).toHaveBeenCalledWith({
      user: messageNewEvent.user,
    });

    expect(replyCreateMock).toHaveBeenCalledTimes(1);
    expect(replyCreateMock).toHaveBeenCalledWith({
      authorId: userInfoResponse.user.id,
      text: messageNewEvent.text!,
      threadTS: messageNewEvent.thread_ts!,
      timestamp: messageNewEvent.ts,
      username: expect.any(String),
    });

    expect(webClientMock.reactions.add).toBeCalledTimes(1);
    expect(webClientMock.reactions.add).toBeCalledWith({
      channel: messageNewEvent.channel,
      name: 'white_check_mark',
      timestamp: messageNewEvent.ts,
    });

    expect(loggerMock.info).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should not save a new message as a submission reply if the thread is not from a submission', async () => {
    const conversationHistoryMock = jest
      .spyOn(webClientMock.conversations, 'history')
      // @ts-ignore
      .mockResolvedValueOnce(invalidConversationHistoryResponse);

    const userInfoMock = jest.spyOn(webClientMock.users, 'info');
    const replyCreateMock = jest.spyOn(replyApi, 'create');

    await handleSubmissionReplyNew({
      client: webClientMock,
      // @ts-ignore
      message: messageNewEvent,
      logger: loggerMock,
    });

    expect(conversationHistoryMock).toHaveBeenCalledTimes(1);
    expect(conversationHistoryMock).toHaveBeenCalledWith({
      latest: messageNewEvent.thread_ts,
      channel: messageNewEvent.channel,
      limit: 1,
      inclusive: true,
    });

    expect(userInfoMock).toHaveBeenCalledTimes(0);
    expect(replyCreateMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(0);
  });

  it('should log errors if they happen', async () => {
    const conversationHistoryMock = jest
      .spyOn(webClientMock.conversations, 'history')
      // @ts-ignore
      .mockRejectedValueOnce(new Error('Network Error'));

    const userInfoMock = jest.spyOn(webClientMock.users, 'info');
    const replyCreateMock = jest.spyOn(replyApi, 'create');

    await handleSubmissionReplyNew({
      client: webClientMock,
      // @ts-ignore
      message: messageNewEvent,
      logger: loggerMock,
    });

    expect(conversationHistoryMock).toHaveBeenCalledTimes(1);
    expect(userInfoMock).toHaveBeenCalledTimes(0);
    expect(replyCreateMock).toHaveBeenCalledTimes(0);
    expect(loggerMock.info).toHaveBeenCalledTimes(0);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
  });
});
