import { expect, jest, test } from '@jest/globals'
import axios from 'axios'
import { uploadTarea } from '../uploadTarea'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const expectedAxiosData = {
  taskId: 11,
  studentId: 11,
  completed: false,
  viewer: null,
  delivery: 'https://github.com/r-argentina-programa/robotina',
  deletedAt: null,
  id: 20,
  createdAt: '2022-10-06T11:33:58.000Z',
  updatedAt: '2022-10-06T11:33:58.000Z',
}

describe('uploadTarea test', () => {
  it('should return the correct values with good response', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      id: 11,
      createdAt: '2022-10-06T11:33:58.000Z',
      updatedAt: '2022-10-06T11:33:58.000Z',
      deletedAt: null,
      username: null,
      externalId: 'oauth2|slack|MOCK1234567-MOCK1234567',
      roles: ['Student'],
    })
    mockedAxios.post.mockResolvedValueOnce({
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
    const returnedValues = await uploadTarea(
      'mockId',
      'mockTarea',
      '12',
      'john',
      'doe',
      'fake@email.com'
    )
    expect(returnedValues).toEqual(expectedAxiosData)
  })

  it('should throw error when gets bad response', async () => {
    mockedAxios.get.mockRejectedValueOnce(() => Promise.reject(false))

    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error()))
    mockedAxios.get.mockResolvedValueOnce(true)

    try {
      await uploadTarea(
        'mockId',
        'mockTarea',
        '12',
        'john',
        'doe',
        'fake@email.com'
      )
    } catch (err) {
      expect(err).toEqual(Error())
    }
  })
})
