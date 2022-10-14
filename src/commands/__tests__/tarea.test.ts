import { expect, jest } from '@jest/globals'
import { AckFn, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { tareaCommandFunction } from '../tarea'
import { uploadTarea } from '../../api/uploadTarea'
import { createThread } from '../../api/createThread'

jest.mock('@slack/web-api', () => {
  const properties = {
    users: {
      info: jest.fn(() => Promise.resolve(true)),
    },
  }
  return { WebClient: jest.fn(() => properties) }
})

jest.mock('../../api/uploadTarea', () => ({
  uploadTarea: jest.fn(),
}))

jest.mock('../../api/createThread', () => ({
  createThread: jest.fn(),
}))

const mockedUploadTarea = uploadTarea as jest.Mocked<typeof uploadTarea>
const mockedCreateThread = createThread as jest.Mocked<typeof createThread>
const webClientTest = new WebClient() as jest.Mocked<WebClient>

let command: SlashCommand
let ack: AckFn<string>
let say: jest.Mocked<SayFn>
let respond: RespondFn
let client: WebClient

beforeEach(() => {
  command = {
    text: 'https://github.com/mock/repo',
    user_id: 'mockId',
    channel_name: 'clase-12',
  } as unknown as SlashCommand
  ack = jest.fn() as unknown as AckFn<string>
  say = jest.fn()

  respond = jest.fn() as unknown as RespondFn
  client = webClientTest
})

describe('tareaCommandFunctiontarea', () => {
  it('should send a submittion and send a message in slack chat', async () => {
    say.mockResolvedValueOnce({
      ok: true,
      fkTaskId: 3,
      fkStudentId: 1,
      completed: false,
      viewer: null,
      delivery: 'https://github.com/r-argentina-programa/robotina',
      deletedAt: null,
      id: 6,
      createdAt: '2022-10-13T19:58:25.751Z',
      updatedAt: '2022-10-13T19:58:25.751Z',
    })
    mockedCreateThread.mockResolvedValue({ test: 1 })
    webClientTest.users.info.mockResolvedValue({
      ok: true,
      user: { id: 'user-id' },
    })
    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      deletedAt: null,
      id: 22,
      createdAt: '2022-10-14T14:51:20.218Z',
      updatedAt: '2022-10-14T14:51:20.218Z',
    })
    await tareaCommandFunction({ command, ack, say, respond, client })

    expect(client.users.info).toHaveBeenCalledTimes(1)
    expect(say).toHaveBeenCalledTimes(1)
  })
})
