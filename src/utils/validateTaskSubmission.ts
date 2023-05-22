export const isTaskSubmission = (text: string) => {
  const SUBMISSION_NAME = 'Tarea';
  const submission = text.slice(0, 40).split(' ');
  return submission[0] === SUBMISSION_NAME;
};
