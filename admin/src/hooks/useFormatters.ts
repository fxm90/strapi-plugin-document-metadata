import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { prefixKey } from '../utils/prefixKey';
import { relativeDateFormatter } from '../utils/relativeDateFormatter';
import { recentTimeFormatter } from '../utils/recentTimeFormatter';

/**
 * Returns shared formatting utilities.
 *
 * - `translate(key, values?)` — translates a message by its unprefixed key, optionally substituting values.
 * - `formatDate(date)` — formats a `Date` as a human-readable relative string.
 */
export const useFormatters = () => {
  const { formatMessage, locale: uiLocale } = useIntl();

  /**
   * Translates a message by its unprefixed key, optionally substituting values.
   *
   * - Note: We wrap the function in `useCallback` to ensure a stable function identity across renders.
   *         This prevents unnecessary re-renders or effect re-executions in components that depend on this function.
   */
  const translate = useCallback(
    (key: string, values?: Record<string, string | number>): string =>
      formatMessage({ id: prefixKey(key) }, values),
    [formatMessage]
  );

  /**
   * Formats a `Date` as a human-readable relative string.
   *
   * - Note: We wrap the function in `useCallback` to ensure a stable function identity across renders.
   *         This prevents unnecessary re-renders or effect re-executions in components that depend on this function.
   */
  const formatDate = useCallback(
    (date: Date): string =>
      recentTimeFormatter({
        date,
        locale: uiLocale,
        fallbackFormatter: (d) =>
          relativeDateFormatter(d, uiLocale, {
            today: (formattedTime) => translate('date.today', { formattedTime }),
            yesterday: (formattedTime) => translate('date.yesterday', { formattedTime }),
            other: (formattedDate) => translate('date.other', { formattedDate }),
          }),
      }),
    [translate, uiLocale]
  );

  return { translate, formatDate };
};
