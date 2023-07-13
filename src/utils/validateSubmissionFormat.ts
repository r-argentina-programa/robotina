export const validateSubmissionFormat = (message: string) => {
  const hasBlockOfCode = /```[^`]+```/.test(message);
  const hasGitHubLink = /github\.com\/[a-zA-Z]/.test(message);
  const hasLineOfCode = /^`([^`]+)`$/gm.test(message);

  const isValidFormat = (hasBlockOfCode || hasGitHubLink) && !hasLineOfCode;

  return isValidFormat;
};
