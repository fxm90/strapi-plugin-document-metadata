import { unstable_useDocument as useDocument, useQueryParams } from '@strapi/strapi/admin';
import { Box, Divider, Flex, Grid, Typography } from '@strapi/design-system';
import { Paperclip } from '@strapi/icons';
import { FormattedMessage } from 'react-intl';
import { useFormatters } from '../../hooks/useFormatters';
import { prefixKey } from '../../utils/prefixKey';

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
  const { translate, formatDate, formatUserDisplayName } = useFormatters();

  // Fetch the current locale from the query parameters (if available).
  const [queryParams] = useQueryParams({ plugins: { i18n: { locale: undefined } } });
  const locale = queryParams.query.plugins?.i18n?.locale;

  // Using the `useDocument()` hook here keeps our metadata value `updatedAt` in sync when the document is updated.
  const { document, schema } = useDocument({
    documentId,
    model: uid,
    collectionType,
    params: { locale },
  });

  if (!document || !schema) {
    return null;
  }

  // The field `updatedAt` is always present on a Strapi document,
  // where the field `updatedBy` may be missing (e.g. when updated via an API call).
  const formattedUpdatedAt = formatDate(new Date(document.updatedAt));
  const formattedUpdatedByUsername = document.updatedBy
    ? formatUserDisplayName(document.updatedBy)
    : null;

  const formattedUpdatedBy = formattedUpdatedByUsername
    ? translate('updated-by', { username: formattedUpdatedByUsername })
    : null;

  // The field `createdAt` is always present on a Strapi document,
  // where the field `createdBy` may be missing (e.g. when created via an API call).
  const formattedCreatedAt = formatDate(new Date(document.createdAt));
  const formattedCreatedByUsername = document.createdBy
    ? formatUserDisplayName(document.createdBy)
    : null;

  const formattedCreatedBy = formattedCreatedByUsername
    ? translate('created-by', { username: formattedCreatedByUsername })
    : null;

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

        <LastOpenedMetadataGuard
          uid={uid}
          documentId={documentId}
          locale={locale}
          schema={schema}
        />

        <MetadataRow
          title={translate('updated-at')}
          line1={formattedUpdatedAt}
          line2={formattedUpdatedBy ?? undefined}
        />

        <MetadataRow
          title={translate('created-at')}
          line1={formattedCreatedAt}
          line2={formattedCreatedBy ?? undefined}
        />
      </Grid.Root>
    </Box>
  );
};

export default DocumentMetadataCard;
