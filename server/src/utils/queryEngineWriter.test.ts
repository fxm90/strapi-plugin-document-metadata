import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryEngineWriter } from './queryEngineWriter';

//
// Types
//

import type { Core } from '@strapi/strapi';
import type { AnyDocument, ContentTypeUID, DocumentID, Locale } from '../types';

//
// Mock "Strapi"
//

// The result from a call to `strapi.documents("api::XYZ.XYZ").findMany()` for the content type.
let stubbedFindManyResult: AnyDocument[];
const mockFindMany = vi.fn(() => stubbedFindManyResult);

// The result from a call to `strapi.documents("api::XYZ.XYZ").update()` for the content type.
let stubbedUpdateResult: AnyDocument | null;
const mockUpdate = vi.fn(() => stubbedUpdateResult);

const mockQuery = vi.fn(() => ({
  findMany: mockFindMany,
  update: mockUpdate,
}));

const mockStrapi = {
  db: {
    query: mockQuery,
  },
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
} as unknown as Core.Strapi;

//
// Tests
//

describe(`test method "updateAllDocumentVersions()"`, () => {
  beforeEach(() => {
    stubbedFindManyResult = [];
    stubbedUpdateResult = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke `strapi.db.query()` with the correct uid.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z', openedBy: 1 };
    const locale: Locale | undefined = 'en';

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(mockQuery).toHaveBeenCalledWith(uid);
  });

  it('should invoke `strapi.db.query().findMany()` with correct parameters when a locale is provided.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z', openedBy: 1 };
    const locale: Locale | undefined = 'en';

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { documentId, locale: 'en' },
      select: ['id'],
    });
  });

  it('should invoke `strapi.db.query().findMany()` with correct parameters when no locale is provided.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z', openedBy: 1 };
    const locale: Locale | undefined = undefined;

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { documentId, locale: null },
      select: ['id'],
    });
  });

  it('should not invoke `strapi.db.query().update()` when no entries are found.', async () => {
    // Given
    stubbedFindManyResult = [];

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z', openedBy: 42 };
    const locale: Locale | undefined = 'en';

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(mockUpdate).toHaveBeenCalledTimes(0);
  });

  it('should invoke `strapi.db.query().update()` for each found entry individually.', async () => {
    // Given
    stubbedFindManyResult = [
      { id: 1, documentId: 'doc-1' },
      { id: 2, documentId: 'doc-2' },
    ];

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z', openedBy: 42 };
    const locale: Locale | undefined = 'en';

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(mockUpdate).toHaveBeenCalledTimes(2);

    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 1 }, data });
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 2 }, data });
  });

  it('should return the number of updated entries.', async () => {
    // Given
    stubbedFindManyResult = [
      { id: 1, documentId: 'doc-1' },
      { id: 2, documentId: 'doc-2' },
      { id: 3, documentId: 'doc-3' },
    ];

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const data = { openedAt: '2026-04-01T12:00:00Z' };
    const locale: Locale | undefined = undefined;

    // When
    const writer = queryEngineWriter({ strapi: mockStrapi });
    const result = await writer.updateAllDocumentVersions({ uid, documentId, data, locale });

    // Then
    expect(result).toBe(3);
  });
});
