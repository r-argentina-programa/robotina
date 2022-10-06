import axios from 'axios'

export const uploadTarea = async (
  userId: string | undefined,
  delivery: string,
  classNumber: string,
  firstName: string | undefined,
  lastName: string | undefined,
  email: string | undefined
) => {
  const authOUserId = `oauth2|slack|${process.env.SLACK_TEAM_ID}-${userId}`

  try {
    if (await getExistentUser(authOUserId)) {
      const { data } = await axios.post(
        `${process.env.API_URL}/api/submission/bot`,
        {
          lessonId: classNumber,
          userId: authOUserId,
          delivery,
        }
      )

      return data
    } else {
      const { data } = await axios.post(
        `${process.env.API_URL}/api/submission/bot`,
        {
          lessonId: classNumber,
          userId: authOUserId,
          firstName,
          lastName,
          email,
          delivery,
        }
      )

      return data
    }
  } catch (error) {
    throw new Error()
  }
}

const getExistentUser = async (authUserId: string) => {
  const { data } = await axios.get(
    `${process.env.API_URL}/api/user/id/${authUserId}`
  )
  return data
}
