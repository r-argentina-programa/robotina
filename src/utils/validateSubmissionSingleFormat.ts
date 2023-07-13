export const validateSubmissionSingleFormat = (message: string): boolean => {
  const codeBlockRegex = /```([\s\S]*?)```/;
  const linkRegex = /github\.com\/[a-zA-Z]/;

  const containsCodeBlock = codeBlockRegex.test(message);
  const containsLink = linkRegex.test(message);

  const numResults = [containsCodeBlock, containsLink].filter(
    (result) => result
  ).length;

  if (numResults > 1) {
    return false;
  }

  return true;
};
