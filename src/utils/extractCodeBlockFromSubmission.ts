export const extractCodeBlockFromSubmission = (message: string): string => {
  const codeBlockRegex = /```([^`]*)```/;
  const matches = message.match(codeBlockRegex);

  if (matches && matches.length >= 2) {
    return matches[1];
  }

  return '';
};
