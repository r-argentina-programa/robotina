# Robotina

## How to run

1. Create a `.env` file. This file will hold environment variables.
2. Copy and paste the contents of `.env.dist` into the `.env` file.
3. Run `npm install` to install project's dependencies.
4. Run the project:

 `npm run start:dev` to run the project in development mode (socket-mode).
 
 `npm run start:prod` to run the project in production mode (http-mode).

## Bot Scopes

In the [slack's app page](https://api.slack.com/apps/) go to the **OAuth & Permissions** to manage the scopes, you will need to add the following scopes:

- `channel:history`
- `channels:read`
- `chat:write`
- `commands`
- `group:history`
- `im:history`
- `im:write`
- `reactions:write`
- `mpin:history`
- `users:read`
- `users:read.email`

## Event Subscriptions

In the **Event subscription** tab subscribe to the following events:

- `app_home_opened`
- `message.channels`
- `message.groups`
- `message.im`
- `message.mpim`
- `reaction_added`
- `team_join`

## Commands:

You also have to add the "tarea" command

Command: `/tarea`

Request URL: `https://{your_slack_bot_domain}/slack/events` (no need in socket-mode)

Short description: "Sube tarea a r-argentina"

## Run in development (Socket-mode)

The slack bolt documentation recommends using socket-mode for development since you don't have to give it a URL, but you do have to add an APP_TOKEN

You can generate one here:
Basic information => App-Level Tokens => Generate Token and Scopes

Scopes:

- `connections:write`

Activate socket-mode:
Socket mode => Connect using Socket Mode => Enable Socket Mode

## Run in production (Http-mode)

The Slack bolt documentation recommends running Http-mode when hosting apps:

> HTTP is more useful for apps being deployed to hosting environments (like AWS or Heroku), or apps intended for distribution via the Slack App Directory.

**Event Subscriptions**

You have to set an URL in as follows:
`https://{your_slack_bot_domain}/slack/events`

## Testing

You can run tests using `npm run test`, `npm run test:coverage` to check the code coverage and `npm run test:dev` for testing during development.

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
| HTTP_PORT                      | Port where the bot runs.                                             |
| AUTH0_CLIENT_ID                | Auth0 client ID.                                                     |
| AUTH0_CLIENT_SECRET            | Auth0 client secret.                                                 |
| AUTH0_AUDIENCE                 | Auth0 audience.                                                      |
| GRANT_TYPE                     | Grant type.                                                          |
| AUTH0_USERNAME                 | Auth0 username.                                                      |
| AUTH0_PASSWORD                 | Auth0 pasword.                                                       |
| AUTH0_DOMAIN                   | Auth0 domain.                                                        |
