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
 * @param locale - The locale to use for formatting time and date strings.
 * @param textBuilder - A builder object that defines how to format "today", "yesterday", and other dates.
 *
 * @returns A human-readable relative date string based on the provided date.
 */
export const relativeDateFormatter = (
  date: Date,
  locale: string,
  textBuilder: RelativeDateTextBuilder
): string => {
  // We're only interested in the time ("HH:MM") for "today" and "yesterday".
  const timeFormatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  const now = new Date();
  if (now.toDateString() === date.toDateString()) {
    return textBuilder.today(date.toLocaleTimeString(locale, timeFormatOptions));
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (yesterday.toDateString() === date.toDateString()) {
    return textBuilder.yesterday(date.toLocaleTimeString(locale, timeFormatOptions));
  }

  return textBuilder.other(date.toLocaleString(locale));
};
