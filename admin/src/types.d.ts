import type { UID, Data } from '@strapi/strapi';

//
// Shared types for the admin part.
//
// - See also: https://docs.strapi.io/cms/typescript/documents-and-entries#type-imports
//

export type AnyDocument = Data.AnyDocument;
export type CollectionType = 'single-types' | 'collection-types';
export type ContentTypeUID = UID.ContentType;
export type DocumentID = Data.DocumentID;

export interface LastOpened {
  openedAt?: string;
  openedBy?: string;
}
