export const uploadTarea = async (
  userId: string | undefined,
  delivery: string,
  classNumber: string,
  firstName: string | undefined,
  lastName: string | undefined,
  email: string | undefined
) => {
  const authOUserId = `oauth2|slack|${process.env.SLACK_TEAM_ID}-${userId}`
  const upload = await Promise.resolve(delivery)

  return {
    lessonId: classNumber,
    userId: authOUserId,
    firstName,
    lastName,
    email,
    delivery: upload,
  }
}
