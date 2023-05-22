import { expect, jest } from '@jest/globals';
import { App, AppOptions } from '@slack/bolt';
import { initializeApp } from '../app';

jest.mock('@slack/bolt');

const mockedApp = jest.mocked(App, { shallow: true });
const mockedConsoleLog = jest.spyOn(global.console, 'log');

describe('app', () => {
  beforeEach(() => {
    process.env = {
      SLACK_BOT_TOKEN: 'slack-bot-token',
      SLACK_SIGNING_SECRET: 'slack-signing-secret',
      APP_TOKEN: 'app-token',
    };
    jest.clearAllMocks();
  });

  const socketModeAppConfig: AppOptions = {
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN,
  };

  const httpModeAppConfig: AppOptions = {
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    port: Number(<string>process.env.PORT || <string>process.env.HTTP_PORT),
  };

  it('should configure app with socket mode if environment is development', async () => {
    expect.assertions(2);
    process.env.NODE_ENV = 'dev';
    await initializeApp();
    expect(mockedApp).toHaveBeenCalledWith(socketModeAppConfig);
    expect(mockedConsoleLog).toHaveBeenCalledTimes(2);
  });

  it('should configure app with http mode if environment is production', async () => {
    expect.assertions(2);
    process.env.NODE_ENV = 'prod';
    await initializeApp();
    expect(mockedApp).toHaveBeenCalledWith(httpModeAppConfig);
    expect(mockedConsoleLog).toHaveBeenCalledTimes(2);
  });
});
