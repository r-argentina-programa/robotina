import { expect, jest, test } from '@jest/globals'
import axios from 'axios'
import { AckFn, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { tareaCommandFunction } from '../tarea'

jest.mock('@slack/web-api', () => {
  const properties = {
    users: {
      info: jest.fn(() => Promise.resolve({ user: 'mockId', ok: true })),
    },
  }
  return { WebClient: jest.fn(() => properties) }
})
jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>
const webClientTest = new WebClient() as jest.Mocked<WebClient>

let command: SlashCommand
let ack: AckFn<string>
let say: SayFn
let respond: RespondFn
let client: WebClient

beforeEach(() => {
  command = {
    text: 'https://github.com/mock/repo',
    user_id: 'mockId',
    channel_name: 'clase-12',
  } as unknown as SlashCommand
  ack = jest.fn() as unknown as AckFn<string>
  say = jest.fn() as unknown as SayFn
  respond = jest.fn() as unknown as RespondFn
  client = webClientTest
})

describe('/tarea tests', () => {
  it('should run well when the right parameter are passed', async () => {
    mockedAxios.get.mockResolvedValue({
      id: 11,
      createdAt: '2022-10-06T11:33:58.000Z',
      updatedAt: '2022-10-06T11:33:58.000Z',
      deletedAt: null,
      username: null,
      externalId: 'oauth2|slack|MOCK1234567-MOCK1234567',
      roles: ['Student'],
    })
    mockedAxios.post.mockResolvedValue({
      data: {
        taskId: 11,
        studentId: 11,
        completed: false,
        viewer: null,
        delivery: 'https://github.com/r-argentina-programa/robotina',
        deletedAt: null,
        id: 20,
        createdAt: '2022-10-06T11:33:58.000Z',
        updatedAt: '2022-10-06T11:33:58.000Z',
      },
    })
    await tareaCommandFunction({ command, ack, say, respond, client })

    expect(client.users.info).toHaveBeenCalledTimes(1)
    expect(say).toHaveBeenCalledTimes(1)
    expect(respond).toBeCalledTimes(0)
  })
})
