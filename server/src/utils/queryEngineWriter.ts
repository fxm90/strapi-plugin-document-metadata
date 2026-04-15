//
// Types
//

import type { Core } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

//
// Implementation
//

export const queryEngineWriter = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Updates all database rows belonging to a document (both draft and published) with the given data,
   * using the Query Engine API (`strapi.db.query`).
   *
   * This is intentionally done via the Query Engine rather than the Document Service API because:
   *
   * - The Document Service has no way to update a single field across both versions.
   *
   * - Using `.update()` + `.publish()` would publish the entire draft, potentially
   *   surfacing content changes the editor has not yet intentionally published.
   *
   * - Note: The Query Engine triggers database-level lifecycle hooks (`beforeUpdate`, `afterUpdate`),
   *         which is an acceptable tradeoff for relation support.
   *
   * @throws If no rows are found for the given document.
   */
  async updateAllDocumentVersions({
    uid,
    documentId,
    data,
    locale,
  }: {
    uid: ContentTypeUID;
    documentId: DocumentID;
    data: Record<string, unknown>;
    locale: Locale | undefined;
  }): Promise<number> {
    const where: Record<string, unknown> = { documentId };

    if (locale) {
      where.locale = locale;
    } else {
      // For non-localized content types, locale is stored as NULL in the database.
      where.locale = null;
    }

    // Fetch all entries (draft and published) for the given document ID, then update them one by one.
    const entries = await strapi.db.query(uid).findMany({
      where,
      select: ['id'],
    });

    for (const entry of entries) {
      await strapi.db.query(uid).update({
        where: { id: entry.id },
        data,
      });
    }

    return entries.length;
  },
});
