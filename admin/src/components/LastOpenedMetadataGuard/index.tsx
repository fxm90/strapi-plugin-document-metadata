import LastOpenedMetadataLoader from '../LastOpenedMetadataLoader';

//
// Types
//

import type { AnyDocument, ContentTypeUID } from '../../types';

//
// Components
//

/**
 * A wrapper component that conditionally renders the `LastOpenedMetadataLoader`
 * when the current content-type being edited contains the last-opened fields.
 */
const LastOpenedMetadataGuard = ({
  uid,
  document,
}: {
  uid: ContentTypeUID;
  document: AnyDocument;
}) => {
  const hasLastOpenedFields = 'openedAt' in document && 'openedBy' in document;
  if (!hasLastOpenedFields) {
    return null;
  }

  return (
    <LastOpenedMetadataLoader uid={uid} documentId={document.documentId} locale={document.locale} />
  );
};

export default LastOpenedMetadataGuard;
