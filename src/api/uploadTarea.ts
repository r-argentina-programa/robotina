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

  console.log(data)
  return data
}
