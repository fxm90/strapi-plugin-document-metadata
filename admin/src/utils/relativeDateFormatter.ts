/**
 * Defines a set of functions that build human-readable text for relative dates.
 *
 * This interface allows customization of how "today", "yesterday",
 * and "other" dates are represented in formatted output.
 *
 * Example:
 * ```ts
 * const textBuilder: RelativeDateTextBuilder = {
 *   today: (time) => `Today at ${time}`,
 *   yesterday: (time) => `Yesterday at ${time}`,
 *   other: (date) => date,
 * };
 * ```
 */
interface RelativeDateTextBuilder {
  today: (formattedTime: string) => string;
  yesterday: (formattedTime: string) => string;
  other: (formattedDate: string) => string;
}

/**
 * Formats a given `Date` object into a human-readable, relative date string.
 *
 * @param date - The `Date` object to format.
 * @param textBuilder - A builder object that defines how to format "today", "yesterday", and other dates.
 *
 * @returns A human-readable relative date string based on the provided date.
 */
export const relativeDateFormatter = (date: Date, textBuilder: RelativeDateTextBuilder): string => {
  const today = new Date();
  if (today.toDateString() === date.toDateString()) {
    return textBuilder.today(date.toLocaleTimeString());
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (yesterday.toDateString() === date.toDateString()) {
    return textBuilder.yesterday(date.toLocaleTimeString());
  }

  return textBuilder.other(date.toLocaleString());
};
