//
// Types
//

import type { Core } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

//
// Service
//

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Fetches the last-opened fields for a specific document within a content type.
   *
   * @param uid - The unique identifier of the content type (e.g. 'api::products.products').
   * @param documentId - The ID of the document to fetch.
   * @param locale - The current locale of the content type / `undefined` if localization is turned off.
   */
  fetchLastOpened: async ({
    uid,
    documentId,
    locale,
  }: {
    uid: ContentTypeUID;
    documentId: DocumentID;
    locale: Locale | undefined;
  }) => {
    return await strapi.documents(uid).findOne({
      documentId,
      fields: ['openedAt', 'openedBy'],
      locale,
    });
  },

  /**
   * Updates the last-opened fields for a specific document within a content type.
   *
   * @param uid - The unique identifier of the content type (e.g. 'api::products.products').
   * @param documentId - The ID of the document to update.
   * @param locale - The current locale of the content type / `undefined` if localization is turned off.
   * @param openedAt - The date and time when the document was last opened.
   * @param openedBy - The name of the user who last opened the document.
   */
  async updateLastOpened({
    uid,
    documentId,
    locale,
    openedAt,
    openedBy,
  }: {
    uid: ContentTypeUID;
    documentId: DocumentID;
    locale: Locale | undefined;
    openedAt: string;
    openedBy: string;
  }) {
    // We explicitly have to use a raw SQL query here, cause when using the Document Service API
    // the field `updatedAt` would automatically gets updated, which we explicitly want to avoid.
    const tableName = strapi.getModel(uid).collectionName;
    if (!tableName) {
      throw new Error(
        `Expected to have a collection name for the content type "${uid}" at this point.`
      );
    }

    return await strapi.db
      .connection(tableName)
      .update({
        opened_at: openedAt,
        opened_by: openedBy,
      })
      .where({
        document_id: documentId,
        locale: locale,
      });
  },
});

export default service;
