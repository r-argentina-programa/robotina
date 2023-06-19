import { App as SlackApp } from '@slack/bolt';
import { handleGreeting } from './handleGreeting';

const subscribeToTeamJoinEvents = (app: SlackApp) => {
  app.event('team_join', handleGreeting);
};

export default subscribeToTeamJoinEvents;
