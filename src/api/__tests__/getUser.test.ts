import { IUser } from '../../interfaces/IUser';
import { getUser } from '../getUser';
import { marketplaceApi } from '../index';

jest.mock('..');

const mockedMarketplaceApi = jest.mocked(marketplaceApi);

describe('getUser', () => {
  it('should call marketplace api once', async () => {
    const MOCK_USER_ARRAY: IUser[] = [
      {
        externalId: 'external-id-text',
        id: 1,
        roles: 'Company',
        username: 'username-test',
      },
    ];

    const EXTERNAL_ID = '12345';
    const MOCKED_DATA = { results: MOCK_USER_ARRAY };
    mockedMarketplaceApi.get.mockResolvedValueOnce({ data: MOCKED_DATA });
    const response = await getUser(EXTERNAL_ID);
    expect(response).toEqual(MOCK_USER_ARRAY);
  });
});
