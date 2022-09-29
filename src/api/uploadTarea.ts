export const uploadTarea = async (
  userId: string | undefined,
  tarea: string,
  classNumber: string
) => {
  const authOUserId = `oauth2|slack|${process.env.SLACK_TEAM_NAME}-${userId}`
  const upload = await Promise.resolve(tarea)

  return {
    tarea: upload,
    user_id: authOUserId,
    slack_user_id: userId,
    class_number: classNumber,
  }
}
