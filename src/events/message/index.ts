import { App as SlackApp } from '@slack/bolt';
import { handleSubmissionReply } from './newMessage';

export const mapMessageEventsToHandlers = (app: SlackApp) => {
  app.event('message', handleSubmissionReply);
};
