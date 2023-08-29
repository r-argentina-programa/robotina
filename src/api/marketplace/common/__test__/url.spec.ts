import { mapQueryOptionsToQueryString } from '../url';

describe('mapOptionsToQueryString', () => {
  it('should return a query string with several parameters', () => {
    const options = {
      filter: {
        key1: 'value1',
        key2: 'value2',
      },
      include: {
        key3: 'value3',
        key4: 'value4',
      },
    };

    const queryString = mapQueryOptionsToQueryString(options);

    expect(queryString).toContain('filter%5Bkey1%5D=value1');
    expect(queryString).toContain('filter%5Bkey2%5D=value2');
    expect(queryString).toContain('include%5Bkey3%5D=value3');
    expect(queryString).toContain('include%5Bkey4%5D=value4');
  });

  it('should return a query string with one parameter', () => {
    const options = {
      filter: {
        key1: 'value1',
      },
    };

    const queryString = mapQueryOptionsToQueryString(options);

    expect(queryString).toContain('filter%5Bkey1%5D=value1');
  });

  it('should throw an error if options is undefined', () => {
    expect(() => {
      mapQueryOptionsToQueryString(undefined);
    }).toThrow('An options object must be defined create a query string.');
  });
});
