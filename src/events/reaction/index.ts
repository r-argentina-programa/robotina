import { App as SlackApp } from '@slack/bolt';
import { handleRobotFaceReaction } from './handleRobotFaceReaction';

const subscribeToReactionEvents = (app: SlackApp) => {
  app.event('reaction_added', handleRobotFaceReaction);
};

export default subscribeToReactionEvents;
