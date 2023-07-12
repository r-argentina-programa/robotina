import { extractCodeBlockFromSubmission } from './extractCodeBlockFromSubmission';

const isBlockOfCode = (text: string): boolean => text.includes('```');

export const extractOnlySubmission = (message: string): string => {
  if (isBlockOfCode(message)) {
    return extractCodeBlockFromSubmission(message);
  }

  return message;
};
