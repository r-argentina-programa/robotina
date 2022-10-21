export const isTaskSubmission = (text: string) => {
  const SUBMISSION_NAME = 'Tarea'
  const submission = text.slice(0, 40).split(' ')
  if (submission[1] === SUBMISSION_NAME) {
    return true
  }
  return false
}
