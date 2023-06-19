import { App as SlackApp, subtype } from '@slack/bolt';
import { handleSubmissionReplyNew } from './messageNew';
import { handleSubmissionReplyChanged } from './messageChanged';

const subscribeToMessageEvents = (app: SlackApp) => {
  app.message(handleSubmissionReplyNew);
  app.message(subtype('message_changed'), handleSubmissionReplyChanged);
};

export default subscribeToMessageEvents;
