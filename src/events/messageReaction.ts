/* eslint-disable no-console */
import { App, ReactionAddedEvent } from '@slack/bolt';
import { WebClient } from '@slack/web-api/dist/WebClient';
import { Reaction } from '@slack/web-api/dist/response/ConversationsHistoryResponse';
import { createThread, ICreateThread } from '../api/createThread';
import { uploadTarea } from '../commands/tarea/uploadTarea';
import { createAuth0Id } from '../utils/createAuth0Id';
import { validateChannelName } from '../utils/validateChannelName';
import { getMentor } from '../api/getMentor';
import { checkIfBotAlreadyReacted } from '../utils/checkIfBotAlreadyReacted';
import { checkIfUserIsMentor } from '../utils/checkIfUserIsMentor';
import { validateSubmissionDeliveryFormat } from '../utils/validateSubmissionDeliveryFormat';

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
  const userResponse = await getMentor(auth0Id);

  console.log('auth0Id', auth0Id);
  console.log('userResponse', userResponse);
  console.log('userResponse[0]', userResponse[0]);

  const isMentor = checkIfUserIsMentor(userResponse[0]);

  if (
    event.reaction === 'robot_face' &&
    !botAlreadyReacted &&
    event.item_user !== process.env.BOT_ID &&
    (isMentor || event.item_user === event.user)
  ) {
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
      delivery: messageText,
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

    const thread: ICreateThread = {
      authorId: <string>process.env.BOT_ID,
      studentId: tarea.fkStudentId,
      text: botMessage.message!.text as string,
      timestamp: botMessage.ts as string,
      taskId: tarea.fkTaskId,
    };

    await createThread(thread);

    client.reactions.add({
      channel: event.item.channel,
      name: 'white_check_mark',
      timestamp: event.item.ts,
    });
  }
};

export const submitWithMessageReaction = (app: App) => {
  const MESSAGE_REACTION_EVENT = 'reaction_added';
  app.event(MESSAGE_REACTION_EVENT, submitWithMessageReactionFunction);
};
