import type { UID, Data, Modules } from '@strapi/strapi';

//
// Shared types for the admin part.
//
// - See also: https://docs.strapi.io/cms/typescript/documents-and-entries#type-imports
//

export type AnyDocument = Modules.Documents.AnyDocument;
export type CollectionType = 'single-types' | 'collection-types';
export type ContentTypeUID = UID.ContentType;
export type DocumentID = Data.DocumentID;

/**
 * A user object as returned by the Strapi Users & Permissions plugin.
 */
export interface User {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
}

/**
 * The shape of the last-opened metadata fields of a document as returned by the plugin's API.
 * The `openedBy` field is a formatted string of the user details.
 */
export interface LastOpened {
  openedAt: string | null;
  openedBy: string | null;
}
