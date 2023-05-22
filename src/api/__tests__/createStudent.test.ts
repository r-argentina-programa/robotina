import { marketplaceApi } from '..';
import { createUserStudent, ICreateUserStudent } from '../createStudent';

jest.mock('..');

const mockedMarketplaceApi = jest.mocked(marketplaceApi);

describe('createUserStudent', () => {
  it('should create a student ', async () => {
    const USER_PARAMS: ICreateUserStudent = {
      email: 'test-email',
      externalId: 'test-external-id',
      firstName: 'test-firstname',
      lastName: 'test-lastname',
      roles: 'Student',
    };

    const NEW_USER_ID = 1;
    mockedMarketplaceApi.post.mockResolvedValueOnce({
      data: { id: NEW_USER_ID },
    });

    mockedMarketplaceApi.post.mockResolvedValueOnce({
      data: { success: true },
    });

    await createUserStudent(USER_PARAMS);

    expect(mockedMarketplaceApi.post).toHaveBeenCalledWith('/api/user', {
      externalId: 'test-external-id',
      roles: 'Student',
    });

    expect(mockedMarketplaceApi.post).toHaveBeenCalledWith('/api/student', {
      email: 'test-email',
      firstName: 'test-firstname',
      lastName: 'test-lastname',
      userId: NEW_USER_ID,
    });

    expect(mockedMarketplaceApi.post).toHaveBeenCalledTimes(2);
  });
});
