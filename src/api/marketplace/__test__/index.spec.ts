import marketplace from '..';

describe('Marketplace', () => {
  it('should have a replyApi property', () => {
    expect(marketplace.replyApi).toBeDefined();
  });

  it('should have a studentApi property', () => {
    expect(marketplace.studentApi).toBeDefined();
  });

  it('should have a submissionApi property', () => {
    expect(marketplace.submissionApi).toBeDefined();
  });

  it('should have a taskApi property', () => {
    expect(marketplace.taskApi).toBeDefined();
  });

  it('should have a threadApi property', () => {
    expect(marketplace.threadApi).toBeDefined();
  });

  it('should have a userApi property', () => {
    expect(marketplace.userApi).toBeDefined();
  });
});
