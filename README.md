# Robotina

## How to run

1. Create a `.env` file. This file will hold environment variables.
2. Copy and paste the contents of `.env.dist` into the `.env` file.
3. Run `npm install` to install project's dependencies.
4. Run `npm run start` to run the project.

## Bot Scopes

In the [slack's app page](https://api.slack.com/apps/) go to the **OAuth & Permissions** to manage the scopes, you will need to add the following scopes:

- channel:history
- chat:write
- commands
- group:history
- im:history
- im:write
- mpin:history
- users:read
- users:read.email

## Testing

You can run tests using `npm run test`, `npm run test:coverage` to check the code coverage and `npm run test:dev` for testsing during development.

## Environment Variable

These are the required environment variables for the project to run:

| Variable                       | Description                                                          |
| ------------------------------ | -------------------------------------------------------------------- |
| SLACK_SIGNING_SECRET           | Signing secret provided by the slack's app basic information page.   |
| SLACK_BOT_TOKEN                | Bot's token provided by the slack´s OAuth & Permission page.         |
| APP_TOKEN                      | App level token generated in the slack's app basic information page. |
| SLACK_TEAM_ID                  | ID of slack team.                                                    |
| API_URL                        | Backend's URL.                                                       |
| BOT_ID                         | Bots's ID.                                                           |
| BOT_AUTHORIZATION_BEARER_TOKEN | Bearer token for the backend´s guards.                               |
