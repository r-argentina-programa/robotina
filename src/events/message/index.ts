import { App as SlackApp, subtype } from '@slack/bolt';
import { handleSubmissionReplyNew } from './messageNew';
import { handleSubmissionReplyChanged } from './messageChanged';
import { handleSubmissionReplyDeleted } from './messageDeleted';

const subscribeToMessageEvents = (app: SlackApp) => {
  app.message(handleSubmissionReplyNew);
  app.message(subtype('message_changed'), handleSubmissionReplyChanged);
  app.message(subtype('message_deleted'), handleSubmissionReplyDeleted);
};

export default subscribeToMessageEvents;
