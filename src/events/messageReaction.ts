/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { App, ReactionAddedEvent } from '@slack/bolt';
import { WebClient } from '@slack/web-api/dist/WebClient';
import { Reaction } from '@slack/web-api/dist/response/ConversationsHistoryResponse';
import { uploadTarea } from '../commands/tarea/uploadTarea';
import { createAuth0Id } from '../utils/createAuth0Id';
import { validateChannelName } from '../utils/validateChannelName';
import { checkIfBotAlreadyReacted } from '../utils/checkIfBotAlreadyReacted';
import { checkIfUserIsMentor } from '../utils/checkIfUserIsMentor';
import { validateSubmissionDeliveryFormat } from '../utils/validateSubmissionDeliveryFormat';
import userApi from '../api/marketplace/user/userApi';
import { CreateThreadDto } from '../api/marketplace/thread/dto/CreateThreadDto';
import threadApi from '../api/marketplace/thread/threadApi';
import { extractOnlySubmission } from '../utils/extractOnlySubmission';

dotenv.config();

export interface IReactionAddedEvent {
  event: ReactionAddedEvent | any;
  client: WebClient;
}

export const submitWithMessageReactionFunction = async ({
  client,
  event,
}: IReactionAddedEvent) => {
  const conversationResponse = await client.conversations.history({
    latest: event.item.ts,
    channel: event.item.channel,
    limit: 1,
    inclusive: true,
  });
  if (!conversationResponse) {
    throw new Error('Slack-api Error: Message not found');
  }
  const botAlreadyReacted = checkIfBotAlreadyReacted(
    conversationResponse.messages![0]!.reactions as Reaction[]
  );
  const auth0Id = createAuth0Id(event.user);
  const users = await userApi.getAll({ filter: { externalId: auth0Id } });
  let isMentor;

  if (users && users.length !== 0) {
    isMentor = checkIfUserIsMentor(users[0]);
  }

  console.log('auth0Id', auth0Id);
  console.log('userResponse', users);
  console.log('userResponse[0]', users[0]);

  console.log('event.reaction', event.reaction);
  console.log('event.item_user', event.item_user);
  console.log('event.user', event.user);
  console.log('emoji is robot?', event.reaction === 'robot_face');
  console.log('bot already reacted?', !botAlreadyReacted && event.item_user);
  console.log('IDK', event.item_user !== process.env.BOT_ID);
  console.log(
    'is owner or mentor reacting?',
    isMentor || event.item_user === event.user
  );
  console.log('isMentor', isMentor);

  if (
    event.reaction === 'robot_face' &&
    !botAlreadyReacted &&
    event.item_user !== process.env.BOT_ID &&
    (isMentor || event.item_user === event.user)
  ) {
    console.log('Initiating submission by reaction...');

    const { user } = await client.users.info({
      user: event.item_user,
    });

    if (!user) {
      throw new Error('Slack-api Error: User not found');
    }

    const { channel } = await client.conversations.info({
      channel: event.item.channel,
    });

    if (!channel) {
      throw new Error('Slack-api Error: Channel not found');
    }

    const classNumber = validateChannelName(channel!.name as string);
    if (!classNumber) {
      throw new Error('Wrong channel name');
    }
    const messageText = conversationResponse.messages![0]!.text as string;

    const validSubmissionFormat = validateSubmissionDeliveryFormat({
      classNumber: Number(classNumber),
      delivery: messageText,
    });
    if (!validSubmissionFormat) {
      await client.chat.postMessage({
        channel: event.item.channel,
        thread_ts: event.item.ts,
        text: `<@${user.id}> el formato de la entrega no es válido, si estás en la clase 4 o menos tenés que enviar la tarea como bloque de código y a partir de la clase 5 tenés que enviar el link de github..`,
      });
      return;
    }

    const tarea = await uploadTarea({
      classNumber,
      slackId: user.id as string,
      delivery: extractOnlySubmission(messageText),
      firstName: user.profile!.first_name,
      lastName: user.profile!.last_name,
      email: user.profile!.email as string,
    });

    const { permalink } = await client.chat.getPermalink({
      channel: event.item.channel,
      message_ts: event.item.ts,
    });

    const botMessage = await client.chat.postMessage({
      channel: event.item.channel,
      text: `Tarea subida con éxito <@${user.id}>! \n\nAcá está el <${permalink}|Link> al mensaje original.\n\nTarea:
${messageText}\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`,
    });

    await client.chat.postMessage({
      channel: event.item.channel,
      text: 'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.',
      thread_ts: event.item.ts,
    });

    const createThreadDto: CreateThreadDto = {
      authorId: process.env.BOT_ID!,
      studentId: tarea.fkStudentId,
      text: botMessage.message!.text as string,
      timestamp: botMessage.ts as string,
      taskId: tarea.fkTaskId,
    };

    await threadApi.create(createThreadDto);

    client.reactions.add({
      channel: event.item.channel,
      name: 'white_check_mark',
      timestamp: event.item.ts,
    });

    console.log('Submission completed successfully!');
  }
};

export const submitWithMessageReaction = (app: App) => {
  const MESSAGE_REACTION_EVENT = 'reaction_added';
  app.event(MESSAGE_REACTION_EVENT, submitWithMessageReactionFunction);
};
