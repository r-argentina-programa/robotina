export const validateSubmissionFormat = (message: string) => {
  const hasBlockOfCode = /```[^`]+```/.test(message);
  const hasGitHubLink = /github\.com\/[a-zA-Z]/.test(message);

  return hasBlockOfCode || hasGitHubLink;
};
