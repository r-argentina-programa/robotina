export const validateNotMultipleSubmissions = (message: string) => {
  const blockOfCodeCount = (message.match(/```[^`]+```/g) || []).length;
  const gitHubLinkCount = (message.match(/github\.com\/[a-zA-Z]/g) || [])
    .length;

  const hasMultipleSubmissions = blockOfCodeCount <= 1 && gitHubLinkCount <= 1;

  return hasMultipleSubmissions;
};
