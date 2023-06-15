import { App as SlackApp } from '@slack/bolt';
import { deleteReplyEvent } from './deleteReply';
import { greetUserEvent } from './greeting';
import { modifyReplyEvent } from './modifyReply';
import { submitWithMessageReaction } from './messageReaction';
import subscribeToMessageEvents from './message';

export const configureAppEvents = (app: SlackApp) => {
  subscribeToMessageEvents(app);
  greetUserEvent(app);
  modifyReplyEvent(app);
  deleteReplyEvent(app);
  submitWithMessageReaction(app);
};
