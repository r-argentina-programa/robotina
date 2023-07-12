import { extractCodeBlockFromSubmission } from './extractCodeBlockFromSubmission';
import { extractLinkFromSubmission } from './extractLinkFromSubmission';

const isBlockOfCode = (text: string): boolean => text.includes('```');

const isLink = (text: string): boolean => text.includes('github.com');

export const extractOnlySubmission = (message: string): string => {
  if (isBlockOfCode(message)) {
    return extractCodeBlockFromSubmission(message);
  }

  if (isLink(message)) {
    return extractLinkFromSubmission(message);
  }

  return message;
};
