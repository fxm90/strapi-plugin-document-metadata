//
// Types
//

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import type { ContentTypeUID, DocumentID, LastOpened, Locale } from '../types';

/** The URL path parameters for the last-opened request. */
interface LastOpenedParams {
  uid: ContentTypeUID;
  documentId: DocumentID;
}

/** The query parameters for the last-opened request. */
interface LastOpenedQuery {
  locale?: Locale;
}

/** The Koa context state containing details about the authenticated user. */
interface State {
  user?: {
    documentId?: DocumentID;
  };
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

    // First fetch the previous last-opened metadata.
    const service = strapi.plugin('document-metadata').service('service');
    const previousLastOpened = await service.fetchLastOpened({ uid, documentId, locale });

    // Afterwards we can update the last-opened metadata.
    const openedAt = new Date().toISOString();

    const { user } = ctx.state as State;
    const openedBy = user?.documentId ?? null;

    await service.updateLastOpened({ uid, documentId, locale, openedAt, openedBy });

    // Finally return the previous last-opened metadata.
    ctx.body = previousLastOpened ?? { openedAt: null, openedBy: null };
  },
});

export default controller;
