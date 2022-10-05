import { expect, jest, test } from '@jest/globals'
import axios from 'axios'
import { uploadTarea } from '../uploadTarea'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const expectedAxiosData = {
  taskId: 12,
  studentId: 1,
  completed: false,
  viewer: null,
  delivery: 'mockTarea',
  deletedAt: null,
  id: 1,
  createdAt: '2022-10-04T12:36:57.000Z',
  updatedAt: '2022-10-04T12:36:57.000Z',
}

describe('uploadTarea test', () => {
  it('should return the correct values with good response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        taskId: 12,
        studentId: 1,
        completed: false,
        viewer: null,
        delivery: 'mockTarea',
        deletedAt: null,
        id: 1,
        createdAt: '2022-10-04T12:36:57.000Z',
        updatedAt: '2022-10-04T12:36:57.000Z',
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
    const expectedValues = {
      userId: `oauth2|slack|${process.env.SLACK_TEAM_ID}-mockId`,
      delivery: 'mockTarea',
      lessonId: '12',
      firstName: 'john',
      lastName: 'doe',
      email: 'fake@email.com',
      data: expectedAxiosData,
    }

    expect(returnedValues).toEqual(expectedValues)
  })

  it('should throw error when gets bad response', async () => {
    mockedAxios.post.mockImplementationOnce(() =>
      Promise.reject(new Error('Este es un error'))
    )

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
      expect(err).toEqual(Error('Este es un error'))
    }
  })
})
