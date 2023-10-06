import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { uploadTarea } from '../../commands/tarea/uploadTarea';
import { createAuth0Id } from '../../utils/createAuth0Id';
import { validateChannelName } from '../../utils/validateChannelName';
import { checkIfBotAlreadyReacted } from '../../utils/checkIfBotAlreadyReacted';
import { checkIfUserIsMentor } from '../../utils/checkIfUserIsMentor';
import { validateSubmissionDeliveryFormat } from '../../utils/validateSubmissionDeliveryFormat';
import userApi from '../../api/marketplace/user/userApi';
import { ICreateThreadDto } from '../../api/marketplace/thread/ICreateThreadDto';
import threadApi from '../../api/marketplace/thread/threadApi';
import env from '../../config/env.config';
import { extractOnlySubmission } from '../../utils/extractOnlySubmission';
import { validateSubmissionSingleFormat } from '../../utils/validateSubmissionSingleFormat';
import { validateSubmissionFormat } from '../../utils/validateSubmissionFormat';
import { validateNotMultipleSubmissions } from '../../utils/validateNotMultipleSubmissions';

export const handleRobotFaceReaction: Middleware<
  SlackEventMiddlewareArgs<'reaction_added'>,
  StringIndexed
> = async ({ client, event, logger }): Promise<void> => {
  console.log('HERE START HANDLE ROBOT FACE REACTION');
  console.log('client: ', client);
  console.log('event: ', event);

  if (
    event.type === 'reaction_added' &&
    event.reaction === 'robot_face' &&
    event.item.type === 'message'
  ) {
    console.log('Event data: ', event);
    console.log('Event type: ', event.type);
    console.log('Event reaction: ', event.reaction);
    console.log('Event item type: ', event.item.type);

    try {
      console.log('HERE ENTERS IN TRY BLOCK');
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: event.item.ts,
          channel: event.item.channel,
          limit: 1,
          inclusive: true,
        });

      console.log('messages from channel: ', messagesFromChannel);
      console.log(
        'client.conversations.history property "latest": ',
        event.item.ts
      );
      console.log(
        'client.conversations.history property "channel": ',
        event.item.channel
      );

      if (!messagesFromChannel) {
        throw new Error(
          `Message with ID ${event.item.ts} not found in channel ${event.item.channel}.`
        );
      }

      const reactedMessage = messagesFromChannel[0];

      console.log('reactedMessage: ', reactedMessage);

      if (!reactedMessage.reactions) {
        throw new Error(
          `Message with ID ${event.item.ts} in channel ${event.item.channel} has no reactions.`
        );
      }

      const botAlreadyReacted = checkIfBotAlreadyReacted(
        reactedMessage.reactions
      );

      console.log('botAlreadyReacted: ', botAlreadyReacted);

      if (botAlreadyReacted) {
        logger.info(
          `Robotina already processed message with ID ${event.item.ts} in channel ${event.item.channel}, exiting...`
        );

        return;
      }

      if (event.item_user === env.BOT_ID) {
        logger.info(
          `User ${event.user} reacted to an invalid message, exiting...`
        );

        return;
      }

      let reactorIsValid: boolean;

      if (event.item_user === event.user) {
        reactorIsValid = true;
      } else {
        const { data: users } = await userApi.getAllPaginated({
          filter: { externalId: createAuth0Id(event.user) },
        });

        if (!users || users.length === 0) {
          throw new Error(`User with ID ${event.user} not found.`);
        }

        reactorIsValid = checkIfUserIsMentor(users[0]);
      }

      if (!reactorIsValid) {
        logger.info(
          `User ${event.user} can't do this action because is not a mentor or the message author.`
        );

        return;
      }

      console.log('reactorIsValid: ', reactorIsValid);

      logger.info('Processing submission...');

      const { user: slackUser } = await client.users.info({
        user: event.item_user,
      });

      console.log('slackUser: ', slackUser);
      console.log('client.users.info property "user": ', event.item_user);

      if (!slackUser) {
        throw new Error(`User with ID ${event.item_user} not found.`);
      }

      const { channel } = await client.conversations.info({
        channel: event.item.channel,
      });

      console.log('channel: ', channel);
      console.log(
        'client.conversations.info property "channel": ',
        event.item.channel
      );

      if (!channel) {
        throw new Error(`Channel ${event.item.channel} not found.`);
      }

      const lessonId = validateChannelName(channel.name!);

      console.log('lessonId: ', lessonId);
      console.log('validateChannelName property "name": ', channel.name);

      if (!lessonId) {
        throw new Error(
          'Channel name must be in the format "clase-<number>" or "clase-react-<number>".'
        );
      }

      const submissionHasValidFormat = validateSubmissionFormat(
        reactedMessage.text!
      );

      console.log('submissionHasValidFormat: ', submissionHasValidFormat);

      if (!submissionHasValidFormat) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `<@${slackUser.id}>, el formato que estás usando para entregar tu tarea no es válido o está vacío. \n\n\nLos formatos que tenés que usar son, si estás queriendo entregar una tarea de la clase 4 para abajo, un bloque de código: \`\`\` console.log("tarea") \`\`\` \nO, si estás queriendo entregar una tarea a partir de la clase 5 para arriba, entonces debería ser simplemente un link de GitHub: (https://github.com/...). \n\n\nY también acordate de mandar tu tarea en un solo formato, es decir, bloque de código o link de GitHub, no ambos.`,
        });
        return;
      }

      const submissionHasSingleFormat = validateSubmissionSingleFormat(
        reactedMessage.text!
      );

      console.log('submissionHasSingleFormat: ', submissionHasSingleFormat);

      if (!submissionHasSingleFormat) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `Che <@${slackUser.id}>, estás queriendo subir más de un formato a la vez. Intentá enviar tu tarea en uno solo. \n\n\nAcordate que si estás en la clase 4 o menos, tenés que enviar la tarea como bloque de código, y a partir de la clase 5 tenés que enviar el link de GitHub.`,
        });
        return;
      }

      const validateIsNotMultipleSubmissions = validateNotMultipleSubmissions(
        reactedMessage.text!
      );

      console.log(
        'validateIsNotMultipleSubmissions: ',
        validateIsNotMultipleSubmissions
      );

      if (
        !validateIsNotMultipleSubmissions &&
        reactedMessage.text!.includes('```')
      ) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `<@${slackUser.id}> asegurate de mandar la tarea en un solo bloque de código, no en varios. Para ayudarte un poco, podés divirlo algo así: \`\`\`Tarea 1\n console.log("tarea 1")\n\n Tarea 2\n console.log("tarea 2")\`\`\``,
        });
        return;
      }

      if (
        !validateIsNotMultipleSubmissions &&
        reactedMessage.text!.includes('github.com')
      ) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `<@${slackUser.id}> asegurate de mandar la tarea en un solo link de GitHub, no en varios.`,
        });
        return;
      }

      const validSubmissionFormat = validateSubmissionDeliveryFormat({
        classNumber: Number(lessonId),
        delivery: reactedMessage.text!,
      });

      console.log('validSubmissionFormat: ', validSubmissionFormat);

      if (!validSubmissionFormat) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `<@${slackUser.id}> el formato de la entrega no es válido, si estás en la clase 4 o menos tenés que enviar la tarea como bloque de código y a partir de la clase 5 tenés que enviar el link de github..`,
        });
        return;
      }

      const onlySubmissionContent = extractOnlySubmission(reactedMessage.text!);

      console.log('onlySubmissionContent: ', onlySubmissionContent);

      const tarea = await uploadTarea({
        classNumber: lessonId,
        slackId: slackUser.id!,
        delivery: onlySubmissionContent,
        firstName: slackUser.profile!.first_name,
        lastName: slackUser.profile!.last_name,
        email: slackUser.profile!.email!,
      });

      console.log('tarea: ', tarea);
      console.log('uploadTarea property "classNumber": ', lessonId);
      console.log('uploadTarea property "slackId": ', slackUser.id);
      console.log('uploadTarea property "delivery": ', onlySubmissionContent);
      console.log(
        'uploadTarea property "firstName": ',
        slackUser.profile!.first_name
      );
      console.log(
        'uploadTarea property "lastName": ',
        slackUser.profile!.last_name
      );
      console.log('uploadTarea property "email": ', slackUser.profile!.email);

      const { permalink } = await client.chat.getPermalink({
        channel: event.item.channel,
        message_ts: event.item.ts,
      });

      console.log('permalink: ', permalink);
      console.log(
        'client.chat.getPermalink property "channel": ',
        event.item.channel
      );
      console.log(
        'client.chat.getPermalink property "message_ts": ',
        event.item.ts
      );

      const botMessage = await client.chat.postMessage({
        channel: event.item.channel,
        text: `Tarea subida con éxito <@${slackUser.id}>! \n\nAcá está el <${permalink}|Link> al mensaje original.\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`,
      });

      console.log('botMessage: ', botMessage);
      console.log(
        'client.chat.postMessage property "channel": ',
        event.item.channel
      );
      console.log(
        'client.chat.postMessage property "text": ',
        `Tarea subida con éxito <@${slackUser.id}>! \n\nAcá está el <${permalink}|Link> al mensaje original.\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`
      );

      await client.chat.postMessage({
        channel: event.item.channel,
        text: 'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.',
        thread_ts: event.item.ts,
      });

      console.log(
        'client.chat.postMessage property "channel": ',
        event.item.channel
      );
      console.log(
        'client.chat.postMessage property "text": ',
        'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.'
      );
      console.log(
        'client.chat.postMessage property "thread_ts": ',
        event.item.ts
      );

      const createThreadDto: ICreateThreadDto = {
        authorId: env.BOT_ID!,
        studentId: tarea.studentId,
        text: botMessage.message!.text!,
        timestamp: botMessage.ts!,
        taskId: tarea.taskId,
      };

      console.log('createThreadDto: ', createThreadDto);
      console.log('createThreadDto property "authorId": ', env.BOT_ID);
      console.log('createThreadDto property "studentId": ', tarea.studentId);
      console.log(
        'createThreadDto property "text": ',
        botMessage.message!.text!
      );
      console.log('createThreadDto property "timestamp": ', botMessage.ts);
      console.log('createThreadDto property "taskId": ', tarea.taskId);

      await threadApi.create(createThreadDto);

      await client.reactions.add({
        channel: event.item.channel,
        name: 'white_check_mark',
        timestamp: event.item.ts,
      });

      console.log(
        'client.reactions.add property "channel": ',
        event.item.channel
      );
      console.log('client.reactions.add property "name": ', 'white_check_mark');
      console.log('client.reactions.add property "timestamp": ', event.item.ts);

      logger.info('Submission processed successfully!');
    } catch (error) {
      logger.error(
        `Something went wrong when processing a submission. Displaying relevant data: Event type: "${event.type}", user: "${event.user}".`
      );
      logger.error(error);
    }
  }
};
