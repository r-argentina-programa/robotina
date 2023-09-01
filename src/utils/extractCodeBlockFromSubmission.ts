export const extractCodeBlockFromSubmission = (message: string): string => {
  const codeBlockRegex = /```[\s\S]*?```/;
  const matches = message.match(codeBlockRegex);

  if (matches) {
    return matches[0];
  }

  return '';
};
