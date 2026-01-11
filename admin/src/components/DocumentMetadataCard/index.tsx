import { unstable_useDocument as useDocument, useQueryParams } from '@strapi/strapi/admin';
import { Box, Divider, Flex, Grid, Typography } from '@strapi/design-system';
import { Paperclip } from '@strapi/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { prefixKey } from '../../utils/prefixKey';
import { relativeDateFormatter } from '../../utils/relativeDateFormatter';
import { recentTimeFormatter } from '../../utils/recentTimeFormatter';
import LastOpenedMetadataGuard from '../LastOpenedMetadataGuard';
import MetadataRow from '../MetadataRow';

//
// Types
//

import type { CollectionType, ContentTypeUID, DocumentID } from '../../types';

//
// Components
//

/**
 * Renders a document metadata card showing various metadata about the given document.
 */
const DocumentMetadataCard = ({
  collectionType,
  uid,
  documentId,
}: {
  collectionType: CollectionType;
  uid: ContentTypeUID;
  documentId: DocumentID;
}) => {
  const { formatMessage } = useIntl();
  const translate = (key: string, values?: any): string =>
    formatMessage({ id: prefixKey(key) }, values);

  // Fetch the current locale from the query parameters (if available).
  const initialParams = { plugins: { i18n: { locale: undefined } } };
  const [queryParams, _] = useQueryParams(initialParams);
  const locale = queryParams.query.plugins.i18n.locale;

  // Using the `useDocument()` hook here keeps our metadata value `updatedAt` in sync when the document is updated.
  const { document } = useDocument({ documentId, model: uid, collectionType, params: { locale } });
  if (!document) {
    return null;
  }

  const formatDate = (date: Date) =>
    recentTimeFormatter({
      date: new Date(date),
      fallbackFormatter: (date) =>
        relativeDateFormatter(date, {
          today: (formattedTime: string) => translate('date.today', { formattedTime }),
          yesterday: (formattedTime: string) => translate('date.yesterday', { formattedTime }),
          other: (formattedDate: string) => translate('date.other', { formattedDate }),
        }),
    });

  const formatUsername = (user: { firstname: string; lastname: string }) =>
    `${user.firstname} ${user.lastname}`;

  // The field `updatedAt` is always present on a Strapi document,
  // where the field `updatedBy` may be missing (e.g. when updated via an API call).
  let formattedUpdatedAt = formatDate(new Date(document.updatedAt));
  let formattedUpdatedBy = document.updatedBy
    ? translate('updated-by', { username: formatUsername(document.updatedBy) })
    : '';

  // The field `createdAt` is always present on a Strapi document,
  // where the field `createdBy` may be missing (e.g. when created via an API call).
  let formattedCreatedAt = formatDate(new Date(document.createdAt));
  let formattedCreatedBy = document.createdBy
    ? translate('created-by', { username: formatUsername(document.createdBy) })
    : '';

  return (
    <Box
      width="100%"
      padding="16px"
      background="neutral0"
      hasRadius={true}
      borderColor="neutral200"
      borderStyle="solid"
      borderWidth="1px"
    >
      <Grid.Root gap="8px" gridCols={1}>
        <Grid.Item direction="column" alignItems="stretch">
          <Flex gap="8px" direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="sigma" textColor="neutral600">
              <FormattedMessage id={prefixKey('title')} />
            </Typography>
            <Paperclip fill="neutral600" style={{ marginRight: '4px' }} />
          </Flex>
          <Divider style={{ marginTop: '6px', marginBottom: '4px' }} />
        </Grid.Item>

        <LastOpenedMetadataGuard uid={uid} document={document} />

        <MetadataRow
          title={translate('updated-at')}
          line1={formattedUpdatedAt}
          line2={formattedUpdatedBy}
        />

        <MetadataRow
          title={translate('created-at')}
          line1={formattedCreatedAt}
          line2={formattedCreatedBy}
        />
      </Grid.Root>
    </Box>
  );
};

export default DocumentMetadataCard;
