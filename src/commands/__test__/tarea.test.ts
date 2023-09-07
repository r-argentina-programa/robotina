import { expect, jest } from '@jest/globals';
import { AckFn, App, RespondFn, SayFn } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { tareaCommandFunction, tareaSlashCommand } from '../tarea/tarea';
import { uploadTarea } from '../tarea/uploadTarea';
import { ISubmissionResponse } from '../../api/marketplace/submission/ISubmissionResponse';
import {
  chatPostMessageResponse,
  usersInfoResponse,
} from './fixture/webclient';
import threadApi from '../../api/marketplace/thread/threadApi';
import env from '../../config/env.config';
import { multipleSubmissionFormatsDetected } from '../../blocks/multipleSubmissionsDetected';
import { wrongFormatSubmission } from '../../blocks/wrongFormatSubmission';
import { wrongFormatBlock } from '../../blocks/wrongFormatBlock';
import { multipleBlocksOfCodeDetected } from '../../blocks/multipleBlocksOfCodeDetected';
import { multipleGitHubLinksDetected } from '../../blocks/multipleGitHubLinksDetected';
import { IThreadResponse } from '../../api/marketplace/thread/IThreadResponse';
import { unknownCommandBlock } from '../../blocks/unknownCommandBlock';

jest.mock('../tarea/uploadTarea');
jest.mock('../../api/marketplace/user/userApi');
jest.mock('../../api/marketplace/thread/threadApi');

const commandMock = {
  command: {},
  ack: jest.fn() as jest.Mocked<AckFn<string>>,
  say: jest.fn() as jest.Mocked<SayFn>,
  respond: jest.fn() as jest.Mocked<RespondFn>,
  client: {
    conversations: {
      history: jest.fn(),
      info: jest.fn(),
    },
    users: {
      info: jest.fn(),
    },
  } as unknown as jest.Mocked<WebClient>,
};

const uploadTareaMock = uploadTarea as jest.Mocked<typeof uploadTarea>;
const threadApiCreateMock = threadApi.create as jest.Mocked<
  typeof threadApi.create
>;

const slackAppMock = {
  command: jest.fn(),
} as unknown as jest.Mocked<App>;

describe('tareaCommandFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User flows', () => {
    it('should allow message authors to save their messages as submissions', async () => {
      const typeCodeText = 'console.log("Hello World!!!")';
      const fullMessage =
        'Hola, aca dejo la tarea\n\n```console.log("Hello World!!!")```';

      commandMock.command = {
        text: fullMessage,
        channel_name: 'clase-1',
        user_id: 'mockId',
      };

      const submissionResponseMock = {
        completed: false,
        delivery: typeCodeText,
        fkStudentId: 1,
        fkTaskId: 1,
        id: 1,
        isActive: true,
        viewer: undefined,
      } as unknown as ISubmissionResponse;

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      uploadTareaMock.mockResolvedValueOnce(submissionResponseMock);

      commandMock.say.mockResolvedValueOnce({
        ok: true,
        ts: chatPostMessageResponse.ts,
        message: {
          text: chatPostMessageResponse.message.text,
        },
      });

      threadApiCreateMock.mockResolvedValue({} as unknown as IThreadResponse);

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(1);
      expect(uploadTareaMock).toHaveBeenCalledWith({
        classNumber: '1',
        delivery: typeCodeText,
        slackId: usersInfoResponse.user.id,
        firstName: usersInfoResponse.user.profile.first_name,
        lastName: usersInfoResponse.user.profile.last_name,
        email: usersInfoResponse.user.profile.email,
      });

      expect(commandMock.say).toHaveBeenCalledWith(
        `Tarea subida con éxito <@${usersInfoResponse.user.id}>!\n\nTarea:\n${fullMessage}\n\n*Para agregar correcciones responder en este hilo.*`
      );

      expect(threadApi.create).toHaveBeenCalledTimes(1);
      expect(threadApi.create).toHaveBeenCalledWith({
        authorId: env.BOT_ID,
        text: chatPostMessageResponse.message.text,
        timestamp: chatPostMessageResponse.ts,
      });
    });
  });

  describe('Validations', () => {
    it('should throw an error when submission has invalid format', async () => {
      commandMock.command = {
        text: "Hola dejo la tarea\n\n`console.log('hola')`",
        channel_name: 'clase-1',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(wrongFormatSubmission());
    });

    it('should throw an error when trying to make a submission with multiple formats', async () => {
      commandMock.command = {
        text: "hola dejo la tarea\n\n```console.log('Hello World!')```\n\ny acá dejo la segunda parte https://github.com/mock/repo",
        channel_name: 'clase-1',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(
        multipleSubmissionFormatsDetected()
      );
    });

    it('should throw an error when trying to submit a GitHub link in class 4 or less', async () => {
      commandMock.command = {
        text: 'Hola acá les dejo la tarea https://github.com/mock/repo',
        channel_name: 'clase-3',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(wrongFormatBlock());
    });

    it('should throw an error when trying to submit a block of code in class 5 or more', async () => {
      commandMock.command = {
        text: "Hola acá les dejo la tarea\n\n```console.log('Hello World!')```",
        channel_name: 'clase-7',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(wrongFormatBlock());
    });

    it('should throw an error when trying to submit two blocks of code', async () => {
      commandMock.command = {
        text: "Hola acá les dejo la primer tarea de la clase 3\n\n```console.log('Hello World!')```\n\ny acá la segunda tarea\n\n```console.log('Hello World 2!')```",
        channel_name: 'clase-3',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(
        multipleBlocksOfCodeDetected()
      );
    });

    it('should throw an error when trying to submit two GitHub links', async () => {
      commandMock.command = {
        text: 'Hola acá les dejo la primer tarea de la clase 6 https://github.com/mock/primer-repo\n\ny acá la segunda tarea https://github.com/mock/segundo-repo',
        channel_name: 'clase-6',
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(
        multipleGitHubLinksDetected()
      );
    });
  });

  describe('Exceptions', () => {
    it('should throw an error if the user is not found', async () => {
      commandMock.command = {
        text: 'Hola acá les dejo la tarea https://github.com/mock/repo',
        channel_name: 'clase-7',
        user_id: undefined,
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        { user: undefined }
      );

      try {
        await tareaCommandFunction(
          // @ts-ignore
          commandMock
        );
      } catch (err) {
        expect(err).toEqual(Error('hubo un error'));
      }

      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);
    });

    it('should throw an error if the channel is not found', async () => {
      commandMock.command = {
        text: 'Hola acá les dejo la tarea https://github.com/mock/repo',
        channel_name: undefined,
        user_id: 'mockId',
      };

      commandMock.client.users.info.mockResolvedValueOnce(
        // @ts-ignore
        usersInfoResponse
      );

      await tareaCommandFunction(
        // @ts-ignore
        commandMock
      );

      expect(uploadTareaMock).toBeCalledTimes(0);
      expect(threadApi.create).toHaveBeenCalledTimes(0);

      expect(commandMock.respond).toHaveBeenCalledTimes(1);
      expect(commandMock.respond).toHaveBeenCalledWith(unknownCommandBlock());
    });
  });
});

describe('tareaSlashCommand', () => {
  it('should call and configure command once ', () => {
    const COMMAND_NAME = '/tarea';
    tareaSlashCommand(slackAppMock);
    expect(slackAppMock.command).toHaveBeenCalledTimes(1);
    expect(slackAppMock.command).toHaveBeenCalledWith(
      COMMAND_NAME,
      tareaCommandFunction
    );
  });
});
