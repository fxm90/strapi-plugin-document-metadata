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

export interface User {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
}

export interface LastOpened {
  openedAt: string | null;
  openedBy: User | null;
}
