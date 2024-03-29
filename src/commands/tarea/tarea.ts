/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt';
import { WebClient } from '@slack/web-api/dist/WebClient';
import {
  User,
  UsersInfoResponse,
  Profile,
} from '@slack/web-api/dist/response/UsersInfoResponse';
import { unknownCommandBlock } from '../../blocks/unknownCommandBlock';
import { wrongFormatBlock } from '../../blocks/wrongFormatBlock';
import { uploadTarea } from './uploadTarea';
import { validateSubmissionDeliveryFormat } from '../../utils/validateSubmissionDeliveryFormat';
import { validateChannelName } from '../../utils/validateChannelName';
import threadApi from '../../api/marketplace/thread/threadApi';
import { ICreateThreadDto } from '../../api/marketplace/thread/ICreateThreadDto';
import { extractOnlySubmission } from '../../utils/extractOnlySubmission';
import { validateNotMultipleSubmissions } from '../../utils/validateNotMultipleSubmissions';
import { validateSubmissionFormat } from '../../utils/validateSubmissionFormat';
import { validateSubmissionSingleFormat } from '../../utils/validateSubmissionSingleFormat';
import { multipleBlocksOfCodeDetected } from '../../blocks/multipleBlocksOfCodeDetected';
import { multipleSubmissionFormatsDetected } from '../../blocks/multipleSubmissionsDetected';
import { wrongFormatSubmission } from '../../blocks/wrongFormatSubmission';
import { multipleGitHubLinksDetected } from '../../blocks/multipleGitHubLinksDetected';
import { assignmentCheatsheet } from '../../utils/assignmentCheatsheet';

dotenv.config();

type IUserClient = UsersInfoResponse & {
  user: User & {
    profile: Profile;
  };
};

interface Command {
  command: SlashCommand;
  ack: AckFn<string>;
  say: SayFn;
  respond: RespondFn;
  client: WebClient;
}

export const tareaCommandFunction = async ({
  command,
  ack,
  say,
  respond,
  client,
}: Command): Promise<void> => {
  await ack();

  try {
    const { user } = (await client.users.info({
      user: command.user_id,
    })) as IUserClient;

    if (!user) {
      throw new Error('Slack-api Error: User not found');
    }

    const classNumber = validateChannelName(command.channel_name);

    if (!classNumber) {
      await respond(unknownCommandBlock());
      return;
    }

    const submissionHasValidFormat = validateSubmissionFormat(command.text);

    if (!submissionHasValidFormat) {
      await respond(wrongFormatSubmission());
      return;
    }

    const submissionHasSingleFormat = validateSubmissionSingleFormat(
      command.text
    );

    if (!submissionHasSingleFormat) {
      await respond(multipleSubmissionFormatsDetected());
      return;
    }

    const validateIsNotMultipleSubmissions = validateNotMultipleSubmissions(
      command.text
    );

    if (!validateIsNotMultipleSubmissions && command.text.includes('```')) {
      await respond(multipleBlocksOfCodeDetected());
      return;
    }

    if (
      !validateIsNotMultipleSubmissions &&
      command.text.includes('github.com')
    ) {
      await respond(multipleGitHubLinksDetected());
      return;
    }

    const validSubmissionFormat = validateSubmissionDeliveryFormat({
      classNumber: Number(classNumber),
      delivery: command.text,
    });

    if (!validSubmissionFormat) {
      await respond(wrongFormatBlock());
      return;
    }

    const onlySubmissionContent = extractOnlySubmission(command.text);

    if (command.text && validSubmissionFormat) {
      const tarea = await uploadTarea({
        classNumber,
        slackId: user.id as string,
        delivery: onlySubmissionContent,
        firstName: user.profile.first_name,
        lastName: user.profile.last_name,
        email: user.profile.email as string,
      });

      const cheatsheet =
        assignmentCheatsheet[classNumber as keyof typeof assignmentCheatsheet];

      const submissionResponse = cheatsheet
        ? `Tarea subida con éxito <@${
            user.id
          }>!\n\nTarea:\n${command.text.trim()}\n\nTe recomendamos leer las siguientes <${cheatsheet} | notas> que pueden ayudarte a solucionar errores comunes. \n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`
        : `Tarea subida con éxito <@${
            user.id
          }>!\n\nTarea:\n${command.text.trim()}\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`;

      const messageResponse = await say(submissionResponse);

      console.log('messageResponse: ', messageResponse);

      const thread: ICreateThreadDto = {
        authorId: process.env.BOT_ID!,
        studentId: tarea.studentId,
        text: messageResponse.message?.text as string,
        timestamp: messageResponse.ts as string,
        taskId: tarea.taskId,
      };

      await threadApi.create(thread);
    }
  } catch (error) {
    console.log(error);
    throw new Error('hubo un error');
  }
};

export const tareaSlashCommand = (app: App) => {
  const TAREA_SLASH_COMMAND = '/tarea';
  app.command(TAREA_SLASH_COMMAND, tareaCommandFunction);
};
