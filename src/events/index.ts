import { App as SlackApp } from '@slack/bolt';
import subscribeToMessageEvents from './message';
import subscribeToTeamJoinEvents from './teamJoin';
import subscribeToReactionEvents from './reaction';

export const configureAppEvents = (app: SlackApp) => {
  subscribeToMessageEvents(app);
  subscribeToTeamJoinEvents(app);
  subscribeToReactionEvents(app);
};
