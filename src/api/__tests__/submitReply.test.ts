import { expect, jest } from '@jest/globals';
import { submitReply } from '../submitReply';
import { marketplaceApi } from '../index';
import { IReply } from '../../interfaces/IReply';

jest.mock('../index');

const mockedMarketplaceApi = jest.mocked(marketplaceApi);

describe('submitReply', () => {
  it('should submit a new reply to marketplace api', async () => {
    const API_URL = '/api/reply';
    const newReply: IReply = {
      authorId: 'author-id',
      text: 'reply-text',
      threadTS: '234234.456456',
      timestamp: '2343254.345345',
      username: 'slack-username',
    };

    mockedMarketplaceApi.post.mockResolvedValue({ data: { success: true } });
    await submitReply(newReply);
    expect(marketplaceApi.post).toHaveBeenCalledTimes(1);
    expect(marketplaceApi.post).toHaveBeenCalledWith(API_URL, newReply);
  });
});
