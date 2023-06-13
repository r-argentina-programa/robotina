import { AxiosError } from 'axios';
import authenticationApi from '../authenticationApi';
import { auth0Client } from '../../config/client';

jest.mock('../../config/client');

const postBodySchema = expect.objectContaining({
  client_id: expect.any(String),
  client_secret: expect.any(String),
  audience: expect.any(String),
  grant_type: expect.any(String),
  username: expect.any(String),
  password: expect.any(String),
});

describe('Auth0 Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return credentials when authenticated', async () => {
      const expectedCredentials = { accessToken: '1234', expiresIn: 3600 };

      const postMock = jest
        .spyOn(auth0Client, 'post')
        .mockResolvedValueOnce({ data: expectedCredentials });

      const credentials = await authenticationApi.getAccessToken();

      expect(postMock).toHaveBeenCalledWith('/oauth/token', postBodySchema);
      expect(credentials).toEqual(expectedCredentials);
    });

    it('should throw an error when authentication fails', async () => {
      const expectedErrorMessage = 'Bot authentication failed with status 401';

      const postMock = jest.spyOn(auth0Client, 'post').mockRejectedValueOnce(
        new AxiosError(
          expectedErrorMessage,
          undefined,
          {},
          {},
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            data: {},
            config: {},
          }
        )
      );

      await expect(authenticationApi.getAccessToken()).rejects.toThrowError(
        expectedErrorMessage
      );
      expect(postMock).toHaveBeenCalledWith('/oauth/token', postBodySchema);
    });
  });
});
