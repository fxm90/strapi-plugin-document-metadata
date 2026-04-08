import { rawDocumentWriter } from '../utils/rawDocumentWriter';

//
// Types
//

import type { Core, Schema } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

/**
 * Describes the configuration options for Strapi's i18n plugin.
 *
 * This represents the shape of the `i18n` object stored under `pluginOptions` for a content type.
 * It indicates whether localization is enabled.
 */
export interface I18nPluginOptions {
  localized?: boolean;
}

/**
 * Describes the subset of a Strapi content type model that includes plugin options,
 * specifically the i18n configuration injected at runtime.
 *
 * This mirrors the internal structure used by Strapi to attach plugin configuration to content type schemas.
 * It is not part of Strapi's public type surface.
 *
 * - Note: Exported for testing and type-guarding purposes only.
 */
export interface ModelI18nOptions {
  pluginOptions?: {
    i18n?: I18nPluginOptions;
  };
}

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

    const effectiveLocale = resolveEffectiveLocale(model, locale);
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

    const effectiveLocale = resolveEffectiveLocale(model, locale);

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
    //
    // 4. We update all rows sharing the same `document_id` (both draft and published) in a single query,
    //    keeping both versions in sync without any state transition.
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

//
// Helper
//
/**
 * Resolves the effective locale to use for queries, returning `undefined` for non-localized content types.
 *
 * Strapi adds `plugins[i18n][locale]=<LAST-SELECTED-LOCALE>` to the URL, even for content types where localization is disabled.
 * Passing that locale value to a non-localized type causes problems:
 *
 * - The raw Knex writer fails to match any rows, because the `locale` column is stored as `NULL` for non-localized types.
 * - The Document Service API silently ignores it, but we strip it anyway to keep both callers consistent.
 *
 * @param model - The content type's model, potentially containing the i18n plugin options.
 * @param locale - The locale value injected by Strapi's i18n plugin / `undefined` if localization is turned off.
 *
 * @returns The locale for localized types, or `undefined` for non-localized types.
 */
const resolveEffectiveLocale = (
  model: Schema.ContentType & ModelI18nOptions,
  locale: Locale | undefined
): Locale | undefined => {
  const isLocalized = model.pluginOptions?.i18n?.localized === true;
  return isLocalized ? locale : undefined;
};
