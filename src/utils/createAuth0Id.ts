export const createAuth0Id = (id: string) => {
  const BASE_AUTH0_ID = `oauth2|sign-in-with-slack|`;
  const TEAM_ID = process.env.SLACK_TEAM_ID;
  return `${BASE_AUTH0_ID}${TEAM_ID}-${id}`;
};
