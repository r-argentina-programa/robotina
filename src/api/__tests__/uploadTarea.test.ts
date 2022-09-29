import { expect, jest, test } from '@jest/globals'
import { uploadTarea } from '../uploadTarea'

describe('uploadTarea test', () => {
  it('should return the correct values', async () => {
    const returnedValues = await uploadTarea('mockId', 'mockTarea', '12')
    const expectedValues = {
      tarea: 'mockTarea',
      user_id: `oauth2|slack|${process.env.SLACK_TEAM_ID}-mockId`,
      slack_user_id: 'mockId',
      class_number: '12',
    }

    expect(returnedValues).toEqual(expectedValues)
  })
})
