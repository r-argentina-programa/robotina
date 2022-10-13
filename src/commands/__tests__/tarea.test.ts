import { expect, jest, test } from '@jest/globals'
import axios from 'axios'
import { AckFn, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { tareaCommandFunction } from '../tarea'
import { uploadTarea } from '../../api/uploadTarea'

jest.mock('@slack/web-api', () => {
  const properties = {
    users: {
      info: jest.fn(() => Promise.resolve({ user: 'mockId', ok: true })),
    },
  }
  return { WebClient: jest.fn(() => properties) }
})

jest.mock('../../api/uploadTarea', () => {
  return {
    uploadTarea: jest.fn(),
  }
})

const mockedUploadTarea = uploadTarea as jest.Mocked<typeof uploadTarea>
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

describe('tareaCommandFunctiontarea', () => {
  it('should send a submittion and send a message in slack chat', async () => {
    await tareaCommandFunction({ command, ack, say, respond, client })

    expect(client.users.info).toHaveBeenCalledTimes(1)
    expect(say).toHaveBeenCalledTimes(1)
  })

  
})
