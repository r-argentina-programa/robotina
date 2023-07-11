import { expect, jest } from '@jest/globals';
import { Logger } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { handleRobotFaceReaction } from '../handleRobotFaceReaction';
import {
  messageAuthorEvent,
  randomUserEvent,
} from './fixture/robotFaceReactionEvent';
import { uploadTarea } from '../../../commands/tarea/uploadTarea';
import userApi from '../../../api/marketplace/user/userApi';
import {
  chatGetPermalinkResponse,
  chatPostMessageResponse,
  conversationsHistoryResponse,
  conversationsInfoResponse,
  usersInfoResponse,
} from './fixture/webclient';
import { Submission } from '../../../api/marketplace/submission/entity/Submission';
import threadApi from '../../../api/marketplace/thread/threadApi';
import { Role } from '../../../api/marketplace/user/entity/Role';
import env from '../../../config/env.config';

jest.mock('../../../commands/tarea/uploadTarea');
jest.mock('../../../api/marketplace/user/userApi');
jest.mock('../../../api/marketplace/thread/threadApi');

const clientMock = {
  conversations: {
    history: jest.fn(),
    info: jest.fn(),
  },
  users: {
    info: jest.fn(),
  },
  chat: {
    postMessage: jest.fn(),
    getPermalink: jest.fn(),
  },
  reactions: {
    add: jest.fn(),
  },
} as unknown as jest.Mocked<WebClient>;

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<Logger>;

const uploadTareaMock = uploadTarea as jest.Mocked<typeof uploadTarea>;

describe('handleRobotFaceReaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow message authors to save their messages as submissions', async () => {
    const submissionMock = {
      completed: false,
      delivery: '',
      fkStudentId: 1,
      fkTaskId: 1,
      id: 1,
      isActive: true,
      viewer: '',
    } as Submission;

    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      conversationsHistoryResponse
    );

    clientMock.users.info.mockResolvedValueOnce(
      // @ts-ignore
      usersInfoResponse
    );

    clientMock.conversations.info.mockResolvedValueOnce(
      // @ts-ignore
      conversationsInfoResponse
    );

    uploadTareaMock.mockResolvedValueOnce(submissionMock);

    clientMock.chat.getPermalink.mockResolvedValueOnce(
      // @ts-ignore
      chatGetPermalinkResponse
    );

    clientMock.chat.postMessage.mockResolvedValueOnce(
      // @ts-ignore
      chatPostMessageResponse
    );

    await handleRobotFaceReaction({
      client: clientMock,
      // @ts-ignore
      event: messageAuthorEvent,
      logger: loggerMock,
    });

    expect(uploadTareaMock).toBeCalledTimes(1);
    expect(uploadTareaMock).toHaveBeenCalledWith({
      classNumber: expect.any(String),
      slackId: expect.any(String),
      delivery: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
    });

    expect(clientMock.chat.postMessage).toBeCalledTimes(2);
    expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(1, {
      channel: messageAuthorEvent.item.channel,
      text: expect.any(String),
    });
    expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(2, {
      channel: messageAuthorEvent.item.channel,
      text: expect.any(String),
      thread_ts: messageAuthorEvent.item.ts,
    });

    expect(threadApi.create).toHaveBeenCalledTimes(1);
    expect(threadApi.create).toHaveBeenCalledWith({
      authorId: expect.any(String),
      studentId: expect.any(Number),
      text: expect.any(String),
      timestamp: expect.any(String),
      taskId: expect.any(Number),
    });

    expect(clientMock.reactions.add).toBeCalledTimes(1);
    expect(clientMock.reactions.add).toBeCalledWith({
      channel: messageAuthorEvent.item.channel,
      name: 'white_check_mark',
      timestamp: messageAuthorEvent.item.ts,
    });
  });

  it('should allow mentors to save other user messages as submissions', async () => {
    const submissionResponseMock = {
      completed: false,
      delivery: '```console.log("Hello World!!!")```',
      fkStudentId: 1,
      fkTaskId: 1,
      id: 1,
      isActive: true,
      viewer: undefined,
    } as Submission;

    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      conversationsHistoryResponse
    );

    const userGetAllMock = jest
      .spyOn(userApi, 'getAll')
      .mockResolvedValueOnce([
        { id: 1, username: '', externalId: '', roles: [Role.MENTOR] },
      ]);

    clientMock.users.info.mockResolvedValueOnce(
      // @ts-ignore
      { ...usersInfoResponse, id: randomUserEvent.item_user }
    );

    clientMock.conversations.info.mockResolvedValueOnce(
      // @ts-ignore
      conversationsInfoResponse
    );

    uploadTareaMock.mockResolvedValueOnce(submissionResponseMock);

    clientMock.chat.getPermalink.mockResolvedValueOnce(
      // @ts-ignore
      chatGetPermalinkResponse
    );

    clientMock.chat.postMessage.mockResolvedValueOnce(
      // @ts-ignore
      chatPostMessageResponse
    );

    await handleRobotFaceReaction({
      client: clientMock,
      // @ts-ignore
      event: randomUserEvent,
      logger: loggerMock,
    });

    expect(userGetAllMock).toHaveBeenCalledTimes(1);
    expect(userGetAllMock).toHaveBeenCalledWith({
      filter: {
        externalId: `oauth2|sign-in-with-slack|${env.SLACK_TEAM_ID}-${randomUserEvent.user}`,
      },
    });

    expect(uploadTareaMock).toBeCalledTimes(1);
    expect(uploadTareaMock).toHaveBeenCalledWith({
      classNumber: expect.any(String),
      delivery: conversationsHistoryResponse.messages[0].text,
      slackId: randomUserEvent.item_user,
      firstName: usersInfoResponse.user.profile.first_name,
      lastName: usersInfoResponse.user.profile.last_name,
      email: usersInfoResponse.user.profile.email,
    });

    expect(clientMock.chat.postMessage).toBeCalledTimes(2);
    expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(1, {
      channel: randomUserEvent.item.channel,
      text: expect.any(String),
    });
    expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(2, {
      channel: randomUserEvent.item.channel,
      thread_ts: randomUserEvent.item.ts,
      text: expect.any(String),
    });

    expect(threadApi.create).toHaveBeenCalledTimes(1);
    expect(threadApi.create).toHaveBeenCalledWith({
      authorId: env.BOT_ID,
      studentId: submissionResponseMock.fkStudentId,
      taskId: submissionResponseMock.fkTaskId,
      text: chatPostMessageResponse.message.text,
      timestamp: chatPostMessageResponse.ts,
    });

    expect(clientMock.reactions.add).toBeCalledTimes(1);
    expect(clientMock.reactions.add).toBeCalledWith({
      channel: randomUserEvent.item.channel,
      timestamp: randomUserEvent.item.ts,
      name: 'white_check_mark',
    });
  });

  it('should exit if a random user attempts to save other user messages as submissions', async () => {
    clientMock.conversations.history.mockResolvedValueOnce(
      // @ts-ignore
      conversationsHistoryResponse
    );

    const userGetAllMock = jest
      .spyOn(userApi, 'getAll')
      .mockResolvedValueOnce([
        { id: 1, username: '', externalId: '', roles: [Role.STUDENT] },
      ]);

    await handleRobotFaceReaction({
      client: clientMock,
      // @ts-ignore
      event: randomUserEvent,
      logger: loggerMock,
    });

    expect(userGetAllMock).toHaveBeenCalledTimes(1);
    expect(userGetAllMock).toHaveBeenCalledWith({
      filter: {
        externalId: `oauth2|sign-in-with-slack|${env.SLACK_TEAM_ID}-${randomUserEvent.user}`,
      },
    });

    expect(uploadTareaMock).toBeCalledTimes(0);
    expect(clientMock.chat.postMessage).toBeCalledTimes(0);
    expect(threadApi.create).toHaveBeenCalledTimes(0);
    expect(clientMock.reactions.add).toBeCalledTimes(0);
    expect(loggerMock.error).toBeCalledTimes(0);
  });

  it.todo(
    'should throw an error if the reacted message is not found in the channel'
  );

  it.todo('should throw an error if the reacted message has no reactions');

  it.todo('should exit if Robotina has already processed the reacted message');

  it.todo('should exit if the reacted message author is Robotina');

  it.todo('should throw an error if the user is not found');

  it.todo('should throw an error if the channel is not found');

  it.todo('should throw an error if the channel name format is invalid');

  it.todo(
    'should make Robotina respond with a message if the submission format is invalid'
  );
});
