import { expect, jest } from '@jest/globals'
import { AckFn, App, RespondFn, SayFn, SlashCommand } from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { tareaCommandFunction, tareaSlashCommand } from '../tarea/tarea'
import { uploadTarea } from '../tarea/uploadTarea'
import { createThread } from '../../api/createThread'
import { unknownCommandBlock } from '../../blocks/unknownCommandBlock'
import { wrongFormatBlock } from '../../blocks/wrongFormatBlock'
import { IThread } from '../../interfaces/IThread'

jest.mock('@slack/web-api', () => {
  const properties = {
    users: {
      info: jest.fn(() => Promise.resolve(true)),
    },
  }
  return { WebClient: jest.fn(() => properties) }
})

jest.mock('@slack/bolt', () => {
  const properties = {
    command: jest.fn(),
  }
  return {
    App: jest.fn(() => properties),
  }
})

jest.mock('../tarea/uploadTarea')

jest.mock('../../api/createThread')

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
    command = {
      ...command,
      channel_name: 'clase-2',
      text: '```mocktarea```',
    }

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
    mockedCreateThread.mockResolvedValue({} as unknown as IThread)
    webClientTest.users.info.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-id',
        profile: {
          first_name: 'aaaaa',
          last_name: 'aaaaa',
          email: 'aaaaa',
        },
      },
    })
    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      id: 22,
      isActive: true,
    })
    await tareaCommandFunction({ command, ack, say, respond, client })

    expect(client.users.info).toHaveBeenCalledTimes(1)
    expect(say).toHaveBeenCalledTimes(1)
  })

  it('should throw error if user is not found', async () => {
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
    mockedUploadTarea.mockResolvedValue({
      fkTaskId: 1,
      fkStudentId: 7,
      completed: false,
      viewer: null,
      delivery: '```aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa```',
      id: 22,
      isActive: true,
    })
    webClientTest.users.info.mockResolvedValue({
      ok: true,
      user: {
        id: '',
        profile: {
          first_name: 'aaaaa',
          last_name: 'aaaaa',
          email: 'aaaaa',
        },
      },
    })
    try {
      await tareaCommandFunction({ command, ack, say, respond, client })
    } catch (err) {
      expect(err).toEqual(Error('User not found'))
    }
  })

  it('should respond with correct values when class name is not valid', async () => {
    command = {
      ...command,
      channel_name: 'not-valid-name',
    }

    webClientTest.users.info.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-id',
        profile: {
          first_name: 'aaaaa',
          last_name: 'aaaaa',
          email: 'aaaaa',
        },
      },
    })

    await tareaCommandFunction({
      command,
      ack,
      say,
      respond,
      client,
    })

    expect(respond).toBeCalledTimes(1)
    expect(respond).toBeCalledWith({
      text: 'Comando no disponible en este canal.',
      blocks: unknownCommandBlock,
    })
  })

  it('should respond with correct values when class name is not valid', async () => {
    command = {
      ...command,
      text: 'not-valid-format',
    }

    webClientTest.users.info.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-id',
        profile: {
          first_name: 'aaaaa',
          last_name: 'aaaaa',
          email: 'aaaaa',
        },
      },
    })

    await tareaCommandFunction({
      command,
      ack,
      say,
      respond,
      client,
    })

    expect(respond).toBeCalledTimes(1)
    expect(respond).toBeCalledWith({
      text: 'Formato de la tarea inválido',
      blocks: wrongFormatBlock,
    })
  })

  it('should throw error when there is a problem', async () => {
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
    webClientTest.users.info.mockResolvedValue({
      ok: false,
    })
    try {
      await tareaCommandFunction({ command, ack, say, respond, client })
    } catch (err) {
      expect(err).toEqual(Error('hubo un error'))
    }
  })
})

const mockedApp = new App() as jest.Mocked<App>

describe('tareaSlashCommand', () => {
  it('should call and configure command once ', () => {
    const COMMAND_NAME = '/tarea'
    tareaSlashCommand(mockedApp)
    expect(mockedApp.command).toHaveBeenCalledTimes(1)
    expect(mockedApp.command).toHaveBeenCalledWith(
      COMMAND_NAME,
      tareaCommandFunction
    )
  })
})
