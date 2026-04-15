import { hasFieldOfType } from '../utils/hasFieldOfType';
import { hasRelationOfType } from '../utils/hasRelationOfType';
import { queryEngineWriter } from '../utils/queryEngineWriter';
import { resolveEffectiveLocale } from '../utils/resolveEffectiveLocale';

//
// Types
//

import type { Core } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, LastOpened, Locale } from '../types';

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
   * This includes resolving the `openedBy` value to a full user object.
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
  }): Promise<LastOpened | null> {
    const model = strapi.getModel(uid);
    if (!model) {
      throw new Error(`Content type "${uid}" not found.`);
    }

    if (!hasFieldOfType(model, 'openedAt', 'datetime')) {
      throw new Error(
        `Content type "${uid}" must define an "openedAt" attribute of type "datetime".`
      );
    }

    // Strapi's admin panel only allows `oneToOne` relations to `admin::user` (not `manyToOne`).
    if (!hasRelationOfType(model, 'openedBy', 'oneToOne', 'admin::user')) {
      throw new Error(
        `Content type "${uid}" must define an "openedBy" attribute of type "relation:oneToOne" with target "admin::user".`
      );
    }

    const effectiveLocale = await resolveEffectiveLocale({ strapi, model, locale });
    const result = await strapi.documents(uid).findOne({
      documentId,
      fields: ['openedAt'],
      // Populate all fields of the related admin user because `admin::user` does not support
      // field selection through the Document Service API. Sensitive fields are stripped below.
      populate: {
        openedBy: true,
      },
      locale: effectiveLocale,
    });

    if (!result) {
      return null;
    }

    const { openedAt, openedBy } = result;
    if (!openedBy) {
      return { openedAt, openedBy: null };
    }

    return {
      openedAt,
      openedBy: {
        // Only return selected fields of the user to avoid exposing sensitive information.
        username: openedBy.username,
        firstname: openedBy.firstname,
        lastname: openedBy.lastname,
        email: openedBy.email,
      },
    };
  },

  /**
   * Updates the last-opened fields for a specific document within a content type.
   *
   * @param uid - The unique identifier of the content type (e.g. 'api::products.products').
   * @param documentId - The ID of the document to update.
   * @param locale - The current locale of the content type / `undefined` if localization is turned off.
   * @param openedAt - The date and time when the document was last opened.
   * @param openedBy - The document ID of the user who last opened the document.
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
    openedBy: DocumentID | null;
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

    // Strapi's admin panel only allows `oneToOne` relations to `admin::user` (not `manyToOne`).
    if (!hasRelationOfType(model, 'openedBy', 'oneToOne', 'admin::user')) {
      throw new Error(
        `Content type "${uid}" must define an "openedBy" attribute of type "relation:oneToOne" with target "admin::user".`
      );
    }

    const effectiveLocale = await resolveEffectiveLocale({ strapi, model, locale });

    // Resolve the user’s document ID to their internal numeric ID, which is needed by the Query Engine to set the relation.
    let openedById: number | null = null;
    if (openedBy) {
      const adminUser = await strapi.db.query('admin::user').findOne({
        where: { documentId: openedBy },
        select: ['id'],
      });

      openedById = adminUser?.id ?? null;
    }

    // We intentionally bypass the Document Service API here and write via the Query Engine (`strapi.db.query`).
    //
    // This is acceptable because:
    //
    // 1. Modifying the document using the Document Service API always sets a published document back to a draft state.
    //    Using `publish()` afterwards would publish the entire draft, potentially surfacing content changes the editor
    //    has not yet intentionally published.
    //
    // 2. Modifying the document using the Document Service API would further update the `updatedAt` / `updatedBy` values,
    //    which is undesirable for an internal metadata update.
    //
    // 3. `openedAt` / `openedBy` are plugin-managed metadata fields, not user-authored content.
    //    They have no business being in a draft state — their purpose is to reflect the metadata of the live document,
    //    regardless of any unpublished changes in the draft.
    //
    // - Note: The Query Engine triggers database-level lifecycle hooks (`beforeUpdate`, `afterUpdate`),
    //         which is an acceptable tradeoff for relation support.
    const documentWriter = queryEngineWriter({ strapi });
    return documentWriter.updateAllDocumentVersions({
      uid,
      documentId,
      locale: effectiveLocale,
      data: {
        openedAt,
        openedBy: openedById,
      },
    });
  },
});

export default service;
