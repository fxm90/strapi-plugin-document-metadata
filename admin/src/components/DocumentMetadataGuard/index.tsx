import { useLocation } from 'react-router-dom';
import DocumentMetadataCard from '../DocumentMetadataCard';

//
// Types
//

import type { CollectionType, ContentTypeUID, DocumentID } from '../../types';

//
// Config
//

const config: {
  supportedCollectionType: CollectionType;
  documentIdLength: number;
} = {
  /**
   * The supported collection type.
   * We currently only support "collection-types", as "single-types" don't have their document ID as part of the URL.
   */
  supportedCollectionType: 'collection-types',

  /**
   * The expected length of a valid document ID.
   *
   * > To address this limitation, Strapi 5 introduced documentId, a 24-character alphanumeric string, as a unique and
   * > persistent identifier for a content entry, independent of its physical records.
   *
   * https://docs.strapi.io/cms/api/document-service
   */
  documentIdLength: 24,
};

//
// Components
//

/**
 * A wrapper component that conditionally renders the `DocumentMetadataCard` and its contents
 * when the current document being edited is supported.
 */
const DocumentMetadataGuard = () => {
  // Get `collectionType`, `uid` and `documentId` from the URL (they are expected to be the last three components).
  // We can't use `unstable_useContentManagerContext` here, as importing it fails in production builds (https://github.com/strapi/strapi/issues/22985).
  const location = useLocation();

  // Get the pathname and split by "/".
  // `filter(Boolean)` removes empty strings that occur if the path starts or ends with "/".
  const urlPathComponents = location.pathname.split('/').filter(Boolean);
  const [collectionType, uid, documentId] = urlPathComponents.slice(-3);

  const isValidCollectionType = collectionType === config.supportedCollectionType;
  const isValidUID = uid && uid.length;
  const isValidDocumentId = documentId && documentId.length === config.documentIdLength;

  if (!isValidCollectionType || !isValidUID || !isValidDocumentId) {
    return null;
  }

  return (
    <DocumentMetadataCard
      collectionType={collectionType as CollectionType}
      uid={uid as ContentTypeUID}
      documentId={documentId as DocumentID}
    />
  );
};

export default DocumentMetadataGuard;
