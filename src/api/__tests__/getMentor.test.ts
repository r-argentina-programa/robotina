import { IUser } from '../../interfaces/IUser';
import { getMentor } from '../getMentor';
import { marketplaceApi } from '../index';

jest.mock('..');

const mockedMarketplaceApi = jest.mocked(marketplaceApi);

describe('getUser', () => {
  it('should call marketplace api once', async () => {
    const MOCK_USER_ARRAY: IUser[] = [
      {
        externalId: 'external-id-text',
        id: 1,
        roles: 'Mentor',
        username: 'username-test',
      },
    ];

    const EXTERNAL_ID = '12345';
    mockedMarketplaceApi.get.mockResolvedValueOnce({
      data: { results: MOCK_USER_ARRAY },
    });

    const response = await getMentor(EXTERNAL_ID);
    expect(response).toBe(MOCK_USER_ARRAY);
  });
});
