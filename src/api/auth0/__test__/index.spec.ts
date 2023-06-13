import auth0 from '..';

describe('Auth0', () => {
  it('should have an authenticationApi property', () => {
    expect(auth0.authenticationApi).toBeDefined();
  });
});
