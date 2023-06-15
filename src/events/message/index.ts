import { App as SlackApp } from '@slack/bolt';
import { handleSubmissionReplyNew } from './messageNew';

const subscribeToMessageEvents = (app: SlackApp) => {
  app.message(handleSubmissionReplyNew);
};

export default subscribeToMessageEvents;
