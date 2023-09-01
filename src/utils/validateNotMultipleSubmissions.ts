export const validateNotMultipleSubmissions = (message: string) => {
  const blockOfCodeCount = (message.match(/```[\s\S]*?```/g) || []).length;
  const gitHubLinkCount = (message.match(/github\.com\/[a-zA-Z]/g) || [])
    .length;

  return blockOfCodeCount === 1 || gitHubLinkCount === 1;
};
