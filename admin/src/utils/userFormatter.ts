import type { User } from '../types';

/**
 * Formats a user object into a displayable username string.
 */
export const userFormatter = (user: User): string => {
  const { username } = user;
  if (username) {
    return username;
  }

  const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
  if (fullName) {
    return fullName;
  }

  const { email } = user;
  if (email) {
    return email;
  }

  return '';
};
