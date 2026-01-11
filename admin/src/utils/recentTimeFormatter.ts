//
// Config
//

const config = {
  /** The threshold in minutes to determine if a date is considered "recent". */
  thresholdInMinutes: 60,
};

//
// Formatter
//

/**
 * Formats a given `Date` object into a human-readable string for **recent dates**,
 * and delegates to a fallback formatter for older dates.
 *
 * - If the date is within the **last 60 minutes**, it returns a relative time string like `"5 minutes ago"`.
 * - Otherwise, it falls back to the `relativeDateFormatter()` function for formatting.
 *
 * @param params.date - The `Date` object to format.
 * @param params.fallbackFormatter - A function that formats dates which are not considered "recent".
 *
 * @returns A human-readable relative date string based on the provided date.
 */
export const recentTimeFormatter = ({
  date,
  fallbackFormatter,
}: {
  date: Date;
  fallbackFormatter: (date: Date) => string;
}): string => {
  const now = new Date();
  const minutesElapsedSinceNow = minutesElapsed(now, date);

  if (minutesElapsedSinceNow >= config.thresholdInMinutes) {
    return fallbackFormatter(date);
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(-minutesElapsedSinceNow, 'minutes');
};

//
// Helper
//

/**
 * Calculates the number of full minutes elapsed between two `Date` objects.
 *
 * @param now - The later date (usually the current time).
 * @param then - The earlier date to compare against.
 *
 * @returns The number of minutes elapsed between `now` and `then`.
 */
const minutesElapsed = (now: Date, then: Date): number => {
  const millisecondsPerMinute = 60 * 1000;
  return Math.floor((now.getTime() - then.getTime()) / millisecondsPerMinute);
};
