import { App as SlackApp } from '@slack/bolt';
import { greetUserEvent } from './greeting';
import { submitWithMessageReaction } from './messageReaction';
import subscribeToMessageEvents from './message';

export const configureAppEvents = (app: SlackApp) => {
  subscribeToMessageEvents(app);
  greetUserEvent(app);
  submitWithMessageReaction(app);
};
