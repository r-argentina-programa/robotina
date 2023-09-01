export const validateSubmissionFormat = (message: string) => {
  const hasBlockOfCode = /```[\s\S]*?```/s.test(message);
  const hasGitHubLink = /github\.com\/[a-zA-Z]/.test(message);

  return hasBlockOfCode || hasGitHubLink;
};
