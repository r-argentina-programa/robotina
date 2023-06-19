import { App as SlackApp } from '@slack/bolt';
import { submitWithMessageReaction } from './messageReaction';
import subscribeToMessageEvents from './message';
import subscribeToTeamJoinEvents from './teamJoin';

export const configureAppEvents = (app: SlackApp) => {
  subscribeToMessageEvents(app);
  subscribeToTeamJoinEvents(app);
  submitWithMessageReaction(app);
};
