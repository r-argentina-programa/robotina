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

  describe('User flows', () => {
    it('should allow message authors to save their messages as submissions', async () => {
      const typeCodeText = conversationsHistoryResponse.messages[0].text;

      const submissionResponseMock = {
        completed: false,
        delivery: typeCodeText,
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

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
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
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(uploadTareaMock).toBeCalledTimes(1);
      expect(uploadTareaMock).toHaveBeenCalledWith({
        classNumber: '1',
        delivery: typeCodeText,
        slackId: messageAuthorEvent.item_user,
        firstName: usersInfoResponse.user.profile.first_name,
        lastName: usersInfoResponse.user.profile.last_name,
        email: usersInfoResponse.user.profile.email,
      });

      expect(clientMock.chat.postMessage).toBeCalledTimes(2);
      expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(1, {
        channel: messageAuthorEvent.item.channel,
        text: `Tarea subida con éxito <@${messageAuthorEvent.item_user}>! \n\nAcá está el <${chatGetPermalinkResponse.permalink}|Link> al mensaje original.\n\nTarea:
      ${typeCodeText}\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`,
      });
      expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(2, {
        channel: messageAuthorEvent.item.channel,
        text: 'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.',
        thread_ts: messageAuthorEvent.item.ts,
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
        channel: messageAuthorEvent.item.channel,
        name: 'white_check_mark',
        timestamp: messageAuthorEvent.item.ts,
      });
    });

    it('should allow mentors to save other user messages as submissions', async () => {
      const typeCodeText = conversationsHistoryResponse.messages[0].text;

      const submissionResponseMock = {
        completed: false,
        delivery: typeCodeText,
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
        classNumber: '1',
        delivery: typeCodeText,
        slackId: randomUserEvent.item_user,
        firstName: usersInfoResponse.user.profile.first_name,
        lastName: usersInfoResponse.user.profile.last_name,
        email: usersInfoResponse.user.profile.email,
      });

      expect(clientMock.chat.postMessage).toBeCalledTimes(2);
      expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(1, {
        channel: randomUserEvent.item.channel,
        text: `Tarea subida con éxito <@${randomUserEvent.item_user}>! \n\nAcá está el <${chatGetPermalinkResponse.permalink}|Link> al mensaje original.\n\nTarea:
      ${typeCodeText}\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`,
      });
      expect(clientMock.chat.postMessage).toHaveBeenNthCalledWith(2, {
        channel: randomUserEvent.item.channel,
        text: 'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.',
        thread_ts: randomUserEvent.item.ts,
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
  });

  describe('Submission types', () => {
    it('should save type CODE submissions correctly', async () => {
      const typeCodeText = conversationsHistoryResponse.messages[0].text;

      const submissionResponseMock = {
        completed: false,
        delivery: typeCodeText,
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
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(uploadTareaMock).toBeCalledTimes(1);
      expect(uploadTareaMock).toHaveBeenCalledWith({
        classNumber: expect.any(String),
        delivery: typeCodeText,
        slackId: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
      });
    });

    it('should save type LINK submissions correctly', async () => {
      const typeLinkText =
        'Hola, aca dejo la tarea\n\nhttp://github.com/r-argentina-programa/robotina\n';

      const submissionResponseMock = {
        completed: false,
        delivery: typeLinkText,
        fkStudentId: 1,
        fkTaskId: 1,
        id: 1,
        isActive: true,
        viewer: undefined,
      } as Submission;

      clientMock.conversations.history.mockResolvedValueOnce({
        messages: [
          // @ts-ignore
          {
            ...conversationsHistoryResponse.messages[0],
            text: typeLinkText,
          },
        ],
      });

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        { ...usersInfoResponse, id: randomUserEvent.item_user }
      );

      clientMock.conversations.info.mockResolvedValueOnce(
        // @ts-ignore
        {
          ...conversationsInfoResponse,
          channel: { ...conversationsInfoResponse.channel, name: 'clase-10' },
        }
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
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(uploadTareaMock).toBeCalledTimes(1);
      expect(uploadTareaMock).toHaveBeenCalledWith({
        classNumber: expect.any(String),
        delivery: typeLinkText,
        slackId: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
      });
    });
  });

  describe('Exceptions', () => {
    it('should throw an error if the reacted message is not found in the channel', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        { messages: undefined }
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);

      expect(loggerMock.error).toBeCalledTimes(2);
      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        new Error(
          `Message with ID ${messageAuthorEvent.item.ts} not found in channel ${messageAuthorEvent.item.channel}.`
        )
      );
    });

    it('should throw an error if the reacted message has no reactions', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        { messages: [{ reactions: undefined }] }
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);

      expect(loggerMock.error).toBeCalledTimes(2);
      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        new Error(
          `Message with ID ${messageAuthorEvent.item.ts} in channel ${messageAuthorEvent.item.channel} has no reactions.`
        )
      );
    });

    it('should exit if Robotina has already processed the reacted message', async () => {
      clientMock.conversations.history.mockResolvedValueOnce({
        messages: [
          // @ts-ignore
          { reactions: [{ users: [env.BOT_ID], name: 'white_check_mark' }] },
        ],
      });

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);
      expect(loggerMock.error).toBeCalledTimes(0);
      expect(loggerMock.info).toBeCalledTimes(1);
    });

    it('should exit if the reacted message author is Robotina', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        conversationsHistoryResponse
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: { ...messageAuthorEvent, item_user: env.BOT_ID },
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);
      expect(loggerMock.error).toBeCalledTimes(0);
      expect(loggerMock.info).toBeCalledTimes(1);
    });

    it('should throw an error if the user is not found', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        conversationsHistoryResponse
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        { user: undefined }
      );

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);

      expect(loggerMock.error).toBeCalledTimes(2);
      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        new Error(`User with ID ${messageAuthorEvent.item_user} not found.`)
      );
    });

    it('should throw an error if the channel is not found', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        conversationsHistoryResponse
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      clientMock.conversations.info.mockResolvedValueOnce(
        // @ts-ignore
        { channel: undefined }
      );

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);

      expect(loggerMock.error).toBeCalledTimes(2);
      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        new Error(`Channel ${messageAuthorEvent.item.channel} not found.`)
      );
    });

    it('should throw an error if the channel name format is invalid', async () => {
      clientMock.conversations.history.mockResolvedValueOnce(
        // @ts-ignore
        conversationsHistoryResponse
      );

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      clientMock.conversations.info.mockResolvedValueOnce(
        // @ts-ignore
        {
          ...conversationsInfoResponse,
          channel: { ...conversationsInfoResponse.channel, name: 'clase1' },
        }
      );

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(clientMock.chat.postMessage).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);

      expect(loggerMock.error).toBeCalledTimes(2);
      expect(loggerMock.error).toHaveBeenNthCalledWith(
        2,
        new Error(
          `Channel name must be in the format "clase-<number>" or "clase-react-<number>".`
        )
      );
    });

    it('should make Robotina respond with a message if the submission format is invalid', async () => {
      clientMock.conversations.history.mockResolvedValueOnce({
        messages: [
          // @ts-ignore
          {
            ...conversationsHistoryResponse.messages[0],
            text: 'Hola, aca dejo la tarea\n\n```console.log("Hello World!!!")```\n',
          },
        ],
      });

      const userGetAllMock = jest.spyOn(userApi, 'getAll');

      clientMock.users.info.mockResolvedValueOnce(
        // @ts-ignore
        { ...usersInfoResponse, id: randomUserEvent.item_user }
      );

      clientMock.conversations.info.mockResolvedValueOnce(
        // @ts-ignore
        {
          ...conversationsInfoResponse,
          channel: { ...conversationsInfoResponse.channel, name: 'clase-10' },
        }
      );

      await handleRobotFaceReaction({
        client: clientMock,
        // @ts-ignore
        event: messageAuthorEvent,
        logger: loggerMock,
      });

      expect(userGetAllMock).toHaveBeenCalledTimes(0);
      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(clientMock.chat.postMessage).toBeCalledTimes(1);
      expect(clientMock.chat.postMessage).toHaveBeenCalledWith({
        channel: messageAuthorEvent.item.channel,
        thread_ts: messageAuthorEvent.item.ts,
        text: `<@${messageAuthorEvent.user}> el formato de la entrega no es válido, si estás en la clase 4 o menos tenés que enviar la tarea como bloque de código y a partir de la clase 5 tenés que enviar el link de github..`,
      });

      expect(threadApi.create).toHaveBeenCalledTimes(0);
      expect(clientMock.reactions.add).toBeCalledTimes(0);
      expect(loggerMock.error).toBeCalledTimes(0);
    });
  });
});
