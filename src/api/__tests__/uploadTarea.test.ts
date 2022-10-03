import { expect, jest, test } from '@jest/globals'
import { uploadTarea } from '../uploadTarea'

describe('uploadTarea test', () => {
  it('should return the correct values', async () => {
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
    }

    expect(returnedValues).toEqual(expectedValues)
  })
})
