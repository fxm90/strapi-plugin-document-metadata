//
// Types
//

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

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
  user: {
    firstname: string;
    lastname: string;
  };
}

//
// Controller
//

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Controller method for the route that fetches and updates the last-opened fields
   * of a document with the given `uid` and `documentId` path parameters (GET request).
   */
  async lastOpened(ctx: Context) {
    const { uid, documentId } = ctx.params as LastOpenedParams;
    const { locale } = ctx.request.query as LastOpenedQuery;

    // First fetch the previous last-opened metadata.
    const previousLastOpened = await strapi
      .plugin('document-metadata')
      .service('service')
      .fetchLastOpened({ uid, documentId, locale });

    // Afterwards we can update the last-opened metadata.
    const openedAt = new Date().toISOString();
    const { user } = ctx.state as State;
    const openedBy = `${user.firstname} ${user.lastname}`;

    await strapi
      .plugin('document-metadata')
      .service('service')
      .updateLastOpened({ uid, documentId, locale, openedAt, openedBy });

    // Finally return the previous last-opened metadata.
    ctx.response.body = previousLastOpened;
  },
});

export default controller;
