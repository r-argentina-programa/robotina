export const mapQueryOptionsToQueryString = (
  options?: Record<string, any>
): string => {
  if (!options) {
    return '';
  }

  const optionsEntries = Object.entries(options);

  const queryObject = optionsEntries.reduce((a, v) => {
    const key = v[0];
    const props = Object.entries(v[1]);

    for (let i = 0; i < props.length; i += 1) {
      // @ts-ignore
      // eslint-disable-next-line prefer-destructuring, no-param-reassign
      a[`${key}[${props[i][0]}]`] = props[i][1];
    }

    return a;
  }, {});

  const queryString = new URLSearchParams(queryObject).toString();

  return `?${queryString}`;
};
