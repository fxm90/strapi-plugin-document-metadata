import { hasFieldOfType } from '../../utils/hasFieldOfType';
import LastOpenedMetadataLoader from '../LastOpenedMetadataLoader';

//
// Types
//

import type { Schema } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID } from '../../types';

//
// Components
//

/**
 * A wrapper component that conditionally renders the `LastOpenedMetadataLoader`
 * when the current content-type being edited contains the last-opened fields.
 */
const LastOpenedMetadataGuard = ({
  uid,
  documentId,
  locale,
  schema,
}: {
  uid: ContentTypeUID;
  documentId: DocumentID;
  locale: string | undefined;
  schema: Schema.ContentType;
}) => {
  const hasLastOpenedFields =
    hasFieldOfType(schema, 'openedAt', 'datetime') && hasFieldOfType(schema, 'openedBy', 'string');

  if (!hasLastOpenedFields) {
    return null;
  }

  return <LastOpenedMetadataLoader uid={uid} documentId={documentId} locale={locale} />;
};

export default LastOpenedMetadataGuard;
