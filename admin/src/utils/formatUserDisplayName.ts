import type { User } from '../types';

/**
 * Returns the best available display name for a user,
 * falling back from username → full name → email.
 *
 * - Note: This is intentionally duplicated in `server/src/utils/formatUserDisplayName.ts`.
 *         Keep both copies in sync when making changes.
 */
export const formatUserDisplayName = (user: User): string | null => {
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

  return null;
};
