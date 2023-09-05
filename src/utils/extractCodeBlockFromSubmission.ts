export const extractCodeBlockFromSubmission = (message: string): string => {
  const codeBlockRegex = /```([\s\S]*?)```/;
  const matches = codeBlockRegex.exec(message);

  if (matches) {
    return matches[1];
  }

  return '';
};
