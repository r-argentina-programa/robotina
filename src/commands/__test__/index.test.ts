import { expect, jest } from '@jest/globals';
import { App } from '@slack/bolt';
import { configureAppCommands } from '..';

jest.mock('@slack/bolt');

const mockedApp = new App() as jest.Mocked<App>;

describe('configureAppCommands', () => {
  it('should configure app commands correctly', () => {
    configureAppCommands(mockedApp);
    expect(mockedApp.command).toBeCalledTimes(1);
  });
});
