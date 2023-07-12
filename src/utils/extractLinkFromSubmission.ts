export const extractLinkFromSubmission = (message: string): string => {
  const linkRegex = /\bgithub\.com\/\S+\b/;
  const match = message.match(linkRegex);

  if (match) {
    const link = match[0];

    return link;
  }

  return '';
};
