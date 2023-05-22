import { marketplaceApi } from '..';
import { getTasks } from '../getTasks';

jest.mock('..');
const mockedMarketplaceApi = jest.mocked(marketplaceApi);

describe('getTasks', () => {
  it('should call marketplace api once', async () => {
    const LESSON_ID = '12345';
    const MOCKED_DATA = { success: true };
    mockedMarketplaceApi.get.mockResolvedValueOnce({ data: MOCKED_DATA });
    const response = await getTasks(LESSON_ID);
    expect(response).toBe(MOCKED_DATA);
  });
});
