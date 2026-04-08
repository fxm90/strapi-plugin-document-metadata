import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import service from './service';

//
// Types
//

import type { Core, Schema } from '@strapi/strapi';
import type { ContentTypeUID, DocumentID, Locale } from '../types';

//
// Mock "hasFieldOfType"
//

let stubbedHasFieldOfTypeResult: boolean;
const mockHasFieldOfType = vi.hoisted(() => vi.fn(() => stubbedHasFieldOfTypeResult));

vi.mock('../utils/hasFieldOfType', () => ({
  hasFieldOfType: mockHasFieldOfType,
}));

//
// Mock "rawDocumentWriter"
//

let stubbedUpdateAllDocumentVersionsResult: number;
const mockUpdateAllDocumentVersions = vi.hoisted(() =>
  vi.fn(() => stubbedUpdateAllDocumentVersionsResult)
);

const mockRawDocumentWriter = vi.hoisted(() =>
  vi.fn(() => ({
    updateAllDocumentVersions: mockUpdateAllDocumentVersions,
  }))
);

vi.mock('../utils/rawDocumentWriter', () => ({
  rawDocumentWriter: mockRawDocumentWriter,
}));

//
// Mock "resolveEffectiveLocale"
//

let stubbedResolveEffectiveLocaleResult: Locale | undefined;
const mockResolveEffectiveLocale = vi.hoisted(() =>
  vi.fn(() => stubbedResolveEffectiveLocaleResult)
);

vi.mock('../utils/resolveEffectiveLocale', () => ({
  resolveEffectiveLocale: mockResolveEffectiveLocale,
}));

//
// Mock "Strapi"
//

// The result from a call to `strapi.getModel("api::XYZ.XYZ")`.
let stubbedGetModelResult: Schema.ContentType | undefined;
const mockGetModel = vi.fn(() => stubbedGetModelResult);

const mockStrapi = {
  getModel: mockGetModel,
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

describe(`test method "updateLastOpened()"`, () => {
  beforeEach(() => {
    stubbedHasFieldOfTypeResult = true;
    stubbedResolveEffectiveLocaleResult = 'en';
    stubbedGetModelResult = createModel();
    stubbedUpdateAllDocumentVersionsResult = 123;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke `strapi.getModel(uid)`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockGetModel).toHaveBeenCalledWith(uid);
  });

  it('should throw an error when `strapi.getModel(uid)` returns undefined.', async () => {
    // Given
    stubbedGetModelResult = undefined;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await expect(() =>
      service({ strapi: mockStrapi }).updateLastOpened({
        uid,
        documentId,
        locale,
        openedAt,
        openedBy,
      })
    )
      // Then
      .rejects.toThrow();
  });

  it('should invoke `hasFieldOfType()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockHasFieldOfType).toHaveBeenCalledTimes(2);
    expect(mockHasFieldOfType).toHaveBeenCalledWith(stubbedGetModelResult, 'openedAt', 'datetime');
    expect(mockHasFieldOfType).toHaveBeenCalledWith(stubbedGetModelResult, 'openedBy', 'string');
  });

  it('should throw an error when `hasFieldOfType()` returns false.', async () => {
    // Given
    stubbedHasFieldOfTypeResult = false;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await expect(() =>
      service({ strapi: mockStrapi }).updateLastOpened({
        uid,
        documentId,
        locale,
        openedAt,
        openedBy,
      })
    )
      // Then
      .rejects.toThrow();
  });

  it('should invoke `resolveEffectiveLocale()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockResolveEffectiveLocale).toHaveBeenCalledWith({
      strapi: mockStrapi,
      model: stubbedGetModelResult,
      locale,
    });
  });

  it('should invoke `rawDocumentWriter()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string = 'user-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockRawDocumentWriter).toHaveBeenCalledWith({ strapi: mockStrapi });
  });

  it('should invoke `documentWriter.updateAllDocumentVersions()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string | null = 'user-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockUpdateAllDocumentVersions).toHaveBeenCalledWith({
      uid,
      documentId,
      locale: stubbedResolveEffectiveLocaleResult,
      data: {
        openedAt,
        openedBy,
      },
    });
  });

  it('should return result from `documentWriter.updateAllDocumentVersions()`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: string | null = 'user-1';

    // When
    const result = await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(result).toBe(stubbedUpdateAllDocumentVersionsResult);
  });
});

//
// Helper
//

const createModel = (): Schema.ContentType => ({
  modelType: 'contentType',
  modelName: 'test',
  globalId: 'Test',
  uid: 'api::test.test',
  kind: 'collectionType',
  info: { singularName: 'test', pluralName: 'tests', displayName: 'Test' },
  options: {},
  attributes: {},
  pluginOptions: {},
});
