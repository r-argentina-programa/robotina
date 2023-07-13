import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { uploadTarea } from '../../commands/tarea/uploadTarea';
import { createAuth0Id } from '../../utils/createAuth0Id';
import { validateChannelName } from '../../utils/validateChannelName';
import { checkIfBotAlreadyReacted } from '../../utils/checkIfBotAlreadyReacted';
import { checkIfUserIsMentor } from '../../utils/checkIfUserIsMentor';
import { validateSubmissionDeliveryFormat } from '../../utils/validateSubmissionDeliveryFormat';
import userApi from '../../api/marketplace/user/userApi';
import { CreateThreadDto } from '../../api/marketplace/thread/dto/CreateThreadDto';
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
  if (
    event.type === 'reaction_added' &&
    event.reaction === 'robot_face' &&
    event.item.type === 'message'
  ) {
    try {
      const { messages: messagesFromChannel } =
        await client.conversations.history({
          latest: event.item.ts,
          channel: event.item.channel,
          limit: 1,
          inclusive: true,
        });

      if (!messagesFromChannel) {
        throw new Error(
          `Message with ID ${event.item.ts} not found in channel ${event.item.channel}.`
        );
      }

      const reactedMessage = messagesFromChannel[0];

      if (!reactedMessage.reactions) {
        throw new Error(
          `Message with ID ${event.item.ts} in channel ${event.item.channel} has no reactions.`
        );
      }

      const botAlreadyReacted = checkIfBotAlreadyReacted(
        reactedMessage.reactions
      );

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
        const users = await userApi.getAll({
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

      logger.info('Processing submission...');

      const { user: slackUser } = await client.users.info({
        user: event.item_user,
      });

      if (!slackUser) {
        throw new Error(`User with ID ${event.item_user} not found.`);
      }

      const { channel } = await client.conversations.info({
        channel: event.item.channel,
      });

      if (!channel) {
        throw new Error(`Channel ${event.item.channel} not found.`);
      }

      const lessonId = validateChannelName(channel.name!);

      if (!lessonId) {
        throw new Error(
          'Channel name must be in the format "clase-<number>" or "clase-react-<number>".'
        );
      }

      const submissionHasValidFormat = validateSubmissionFormat(
        reactedMessage.text!
      );

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

      if (!submissionHasSingleFormat) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `Che <@${slackUser.id}>, estás queriendo subir más de un formato a la vez, subí solo uno. O subis un bloque de código, o subís un link de GitHub.`,
        });
        return;
      }

      const validateIsNotMultipleSubmissions = validateNotMultipleSubmissions(
        reactedMessage.text!
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

      if (!validSubmissionFormat) {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `<@${slackUser.id}> el formato de la entrega no es válido, si estás en la clase 4 o menos tenés que enviar la tarea como bloque de código y a partir de la clase 5 tenés que enviar el link de github..`,
        });
        return;
      }

      const onlySubmissionContent = extractOnlySubmission(reactedMessage.text!);

      const tarea = await uploadTarea({
        classNumber: lessonId,
        slackId: slackUser.id!,
        delivery: onlySubmissionContent,
        firstName: slackUser.profile!.first_name,
        lastName: slackUser.profile!.last_name,
        email: slackUser.profile!.email!,
      });

      const { permalink } = await client.chat.getPermalink({
        channel: event.item.channel,
        message_ts: event.item.ts,
      });

      const botMessage = await client.chat.postMessage({
        channel: event.item.channel,
        text: `Tarea subida con éxito <@${slackUser.id}>! \n\nAcá está el <${permalink}|Link> al mensaje original.\n\nTarea:
      ${onlySubmissionContent}\n\n*Para agregar correcciones responder en este hilo (no en el mensaje original).*`,
      });

      await client.chat.postMessage({
        channel: event.item.channel,
        text: 'Si querés agregar una corrección a esta tarea hacelo como una respuesta al mensaje que mandó el bot.',
        thread_ts: event.item.ts,
      });

      const createThreadDto: CreateThreadDto = {
        authorId: env.BOT_ID!,
        studentId: tarea.fkStudentId,
        text: botMessage.message!.text!,
        timestamp: botMessage.ts!,
        taskId: tarea.fkTaskId,
      };

      await threadApi.create(createThreadDto);

      await client.reactions.add({
        channel: event.item.channel,
        name: 'white_check_mark',
        timestamp: event.item.ts,
      });

      logger.info('Submission processed successfully!');
    } catch (error) {
      logger.error(
        `Something went wrong when processing a submission. Displaying relevant data: Event type: "${event.type}", user: "${event.user}".`
      );
      logger.error(error);
    }
  }
};
