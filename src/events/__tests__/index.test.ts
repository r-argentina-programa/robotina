import { expect, jest } from '@jest/globals';
import { App } from '@slack/bolt';
import { configureAppEvents } from '..';

jest.mock('@slack/bolt');

const mockedApp = new App() as jest.Mocked<App>;

describe('configureAppEvents', () => {
  it('should configure app events correctly', () => {
    configureAppEvents(mockedApp);
    expect(mockedApp.event).toBeCalledTimes(4);
  });
});
