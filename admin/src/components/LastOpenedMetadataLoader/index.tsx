import { useIntl } from 'react-intl';
import { prefixKey } from '../../utils/prefixKey';
import { relativeDateFormatter } from '../../utils/relativeDateFormatter';
import { recentTimeFormatter } from '../../utils/recentTimeFormatter';
import MetadataRow from '../MetadataRow';
import { useLastOpened, FetchStatus } from './useLastOpened';

//
// Types
//

import type { ContentTypeUID, DocumentID } from '../../types';

//
// Config
//

const config = {
  /** The loading text to show while fetching data. */
  loadingString: '…',

  /** The non-breaking space character. */
  nonBreakingSpace: '\u00A0',
};

//
// Components
//

/**
 * Fetches the last-opened metadata for the given document.
 */
const LastOpenedMetadataLoader = ({
  uid,
  documentId,
  locale,
}: {
  uid: ContentTypeUID;
  documentId: DocumentID;
  locale: string | undefined;
}) => {
  const { formatMessage } = useIntl();
  const translate = (key: string, values?: any): string =>
    formatMessage({ id: prefixKey(key) }, values);

  // To avoid any caching issues when reading the values of the `useDocument()` hook, we manually fetch the last-opened fields here.
  // This call will also update the last-opened fields in the database with the current time and user.
  const lastOpenedFetchState = useLastOpened({ uid, documentId, locale });
  switch (lastOpenedFetchState.status) {
    case FetchStatus.Initial:
    case FetchStatus.InProgress:
      // Show a placeholder text while loading to avoid big layout shifts when the actual values appear.
      return (
        <MetadataRow
          title={translate('opened-at')}
          line1={config.loadingString}
          line2={config.nonBreakingSpace}
        />
      );

    case FetchStatus.Failure:
      // Fail silently in case of an error.
      // We logged the error already in the hook.
      return null;

    case FetchStatus.Success:
      const lastOpened = lastOpenedFetchState.lastOpened;
      if (!lastOpened.openedAt || !lastOpened.openedBy) {
        // Handle case where the document has never been opened before.
        return (
          <MetadataRow title={translate('opened-at')} line1={translate('opened-first-time')} />
        );
      }

      const formattedOpenedAt = recentTimeFormatter({
        date: new Date(lastOpened.openedAt),
        fallbackFormatter: (date) =>
          relativeDateFormatter(date, {
            today: (formattedTime: string) => translate('date.today', { formattedTime }),
            yesterday: (formattedTime: string) => translate('date.yesterday', { formattedTime }),
            other: (formattedDate: string) => translate('date.other', { formattedDate }),
          }),
      });

      const formattedOpenedBy = translate('opened-by', { username: lastOpened.openedBy });
      return (
        <MetadataRow
          title={translate('opened-at')}
          line1={formattedOpenedAt}
          line2={formattedOpenedBy}
        />
      );
  }
};

export default LastOpenedMetadataLoader;
