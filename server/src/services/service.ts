import { hasFieldOfType } from '../utils/hasFieldOfType';
import { rawDocumentWriter } from '../utils/rawDocumentWriter';
import { resolveEffectiveLocale } from '../utils/resolveEffectiveLocale';

//
// Types
//

import type { Core } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

//
// Service
//

/*
 * The service for the document metadata plugin, containing the core business logic for
 * fetching and updating the last-opened fields of documents.
 *
 *  - Note: Services validate business and domain invariants (e.g. content type existence, required fields, data consistency).
 */
const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Fetches the last-opened fields for a specific document within a content type.
   *
   * @param uid - The unique identifier of the content type (e.g. 'api::products.products').
   * @param documentId - The ID of the document to fetch.
   * @param locale - The current locale of the content type / `undefined` if localization is turned off.
   */
  async fetchLastOpened({
    uid,
    documentId,
    locale,
  }: {
    uid: ContentTypeUID;
    documentId: DocumentID;
    locale: Locale | undefined;
  }) {
    const model = strapi.getModel(uid);
    if (!model) {
      throw new Error(`Content type "${uid}" not found.`);
    }

    if (!hasFieldOfType(model, 'openedAt', 'datetime')) {
      throw new Error(
        `Content type "${uid}" must define an "openedAt" attribute of type "datetime".`
      );
    }

    if (!hasFieldOfType(model, 'openedBy', 'string')) {
      throw new Error(
        `Content type "${uid}" must define an "openedBy" attribute of type "string".`
      );
    }

    const effectiveLocale = await resolveEffectiveLocale({ strapi, model, locale });
    return strapi.documents(uid).findOne({
      documentId,
      fields: ['openedAt', 'openedBy'],
      locale: effectiveLocale,
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
    openedBy: string | null;
  }) {
    const model = strapi.getModel(uid);
    if (!model) {
      throw new Error(`Content type "${uid}" not found.`);
    }

    if (!hasFieldOfType(model, 'openedAt', 'datetime')) {
      throw new Error(
        `Content type "${uid}" must define an "openedAt" attribute of type "datetime".`
      );
    }

    if (!hasFieldOfType(model, 'openedBy', 'string')) {
      throw new Error(
        `Content type "${uid}" must define an "openedBy" attribute of type "string".`
      );
    }

    const effectiveLocale = await resolveEffectiveLocale({ strapi, model, locale });

    // We intentionally bypass the Document Service API here and write directly to the database via Knex.
    // Normally this is discouraged because it skips lifecycle hooks and couples the code to Strapi’s internal schema.
    //
    // In this case it is acceptable because:
    //
    // 1. Modifying the document using the Document Service API always sets a published document back to a draft state.
    //    Using `publish()` afterwards would publish the entire draft, potentially surfacing content changes the editor
    //    has not yet intentionally published.
    //
    // 2. Modifying the document using the Document Service API would further update the `updatedAt` / `updatedBy` values and
    //    trigger lifecycle hooks, which is undesirable for an internal metadata update.
    //
    // 3. `openedAt` / `openedBy` are plugin-managed metadata fields, not user-authored content.
    //    They have no business being in a draft state — their purpose is to reflect the metadata of the live document,
    //    regardless of any unpublished changes in the draft.
    const documentWriter = rawDocumentWriter({ strapi });
    return documentWriter.updateAllDocumentVersions({
      uid,
      documentId,
      locale: effectiveLocale,
      data: {
        openedAt,
        openedBy,
      },
    });
  },
});

export default service;
