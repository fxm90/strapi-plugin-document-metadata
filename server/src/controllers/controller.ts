import { formatUserDisplayName } from '../utils/formatUserDisplayName';
import { isValidContentTypeUID } from '../utils/isValidContentTypeUID';
import { isValidDocumentId } from '../utils/isValidDocumentId';
import { isValidLocale } from '../utils/isValidLocale';

//
// Types
//

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import type { User } from '../types';

/** The URL path parameters for the last-opened request. */
interface LastOpenedParams {
  uid: unknown;
  documentId: unknown;
}

/** The query parameters for the last-opened request. */
interface LastOpenedQuery {
  locale?: unknown;
}

/** The Koa context state containing details about the authenticated user. */
interface State {
  user?: User;
}

//
// Controller
//

/**
 * The controller for the document metadata plugin, containing the HTTP request handling logic for the plugin's routes.
 *
 *  - Note: Controllers validate HTTP input shape and format (presence, type, format of request parameters).
 */
const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Controller method for the route that fetches and updates the last-opened fields
   * of a document with the given `uid` and `documentId` path parameters (POST request).
   */
  async lastOpened(ctx: Context) {
    const { uid, documentId } = ctx.params as LastOpenedParams;
    const { locale } = ctx.query as LastOpenedQuery;

    // Validate the content type UID format before it reaches `strapi.getModel()` and `strapi.documents()`,
    // which use it to look up internal schema definitions and build database queries.
    if (!isValidContentTypeUID(uid)) {
      ctx.badRequest(`Invalid content type UID.`);
      return;
    }

    // Validate the document ID format before it reaches the raw Knex query in `updateLastOpened()`,
    // which bypasses Strapi's Document Service API and writes directly to the database.
    if (!isValidDocumentId(documentId)) {
      ctx.badRequest(`Invalid document ID.`);
      return;
    }

    // Validate the locale query value before it reaches the raw Knex query in `updateLastOpened()`,
    // which bypasses Strapi's Document Service API and writes directly to the database.
    if (!isValidLocale(locale)) {
      ctx.badRequest(`Invalid locale.`);
      return;
    }

    // First fetch the previous last-opened metadata.
    const service = strapi.plugin('document-metadata').service('service');
    const previousLastOpened = await service.fetchLastOpened({ uid, documentId, locale });

    // Afterwards we can update the last-opened metadata.
    const openedAt = new Date().toISOString();

    // We store a formatted string of user details in the `openedBy` field instead of a user ID.
    // This is intentional and avoids several issues:
    //
    // 1. Display in the admin UI
    //    - If we stored only the user ID (as a string), the list view would display that raw ID instead of
    //      a human-readable name.
    //
    // 2. Avoiding relational side effects
    //    - Using a relation would make Strapi automatically populate the user in the list view,
    //      but updating such a relation introduces unwanted side effects:
    //
    //      a) Document Service API
    //         - Updating via the Document Service API would mark the document as modified,
    //           which is undesirable for internal metadata changes like "last opened".
    //
    //      b) Direct database updates
    //         - Updating via Strapi’s database layer would trigger lifecycle hooks (e.g. `beforeUpdate`, `afterUpdate`),
    //           which may cause unintended behavior such as publishing a draft.
    const { user } = ctx.state as State;
    const openedBy = user ? formatUserDisplayName(user) : null;

    const numberOfUpdatedDocumentVersions = await service.updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    if (numberOfUpdatedDocumentVersions === 0) {
      ctx.notFound('Document was not found.');
      return;
    }

    // Finally return the previous last-opened metadata.
    ctx.body = previousLastOpened;
  },
});

export default controller;
