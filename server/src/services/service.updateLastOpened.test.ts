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
// Mock "hasRelationOfType"
//

let stubbedHasRelationOfTypeResult: boolean;
const mockHasRelationOfType = vi.hoisted(() => vi.fn(() => stubbedHasRelationOfTypeResult));

vi.mock('../utils/hasRelationOfType', () => ({
  hasRelationOfType: mockHasRelationOfType,
}));

//
// Mock "queryEngineWriter"
//

let stubbedUpdateAllDocumentVersionsResult: number;
const mockUpdateAllDocumentVersions = vi.hoisted(() =>
  vi.fn(() => stubbedUpdateAllDocumentVersionsResult)
);

vi.mock('../utils/queryEngineWriter', () => ({
  queryEngineWriter: vi.fn(() => ({
    updateAllDocumentVersions: mockUpdateAllDocumentVersions,
  })),
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

// The result from a call to `strapi.db.query('admin::user').findOne()`.
let stubbedAdminUserResult: { id: number } | null;
const mockDbQueryFindOne = vi.fn(() => stubbedAdminUserResult);

const mockStrapi = {
  getModel: mockGetModel,
  db: {
    query: vi.fn(() => ({
      findOne: mockDbQueryFindOne,
    })),
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

describe(`test method "updateLastOpened()"`, () => {
  beforeEach(() => {
    stubbedHasFieldOfTypeResult = true;
    stubbedHasRelationOfTypeResult = true;
    stubbedGetModelResult = createModel();
    stubbedResolveEffectiveLocaleResult = 'en';
    stubbedUpdateAllDocumentVersionsResult = 2;
    stubbedAdminUserResult = { id: 42 };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke `strapi.getModel(uid)`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

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
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

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
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockHasFieldOfType).toHaveBeenCalledWith(stubbedGetModelResult, 'openedAt', 'datetime');
  });

  it('should throw an error when `hasFieldOfType()` returns false.', async () => {
    // Given
    stubbedHasFieldOfTypeResult = false;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

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

  it('should invoke `hasRelationOfType()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockHasRelationOfType).toHaveBeenCalledWith(
      stubbedGetModelResult,
      'openedBy',
      'oneToOne',
      'admin::user'
    );
  });

  it('should throw an error when `hasRelationOfType()` returns false.', async () => {
    // Given
    stubbedHasRelationOfTypeResult = false;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

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
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

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

  it('should resolve the user document ID to an internal ID via `strapi.db.query`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID = 'user-doc-1';

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockStrapi.db.query).toHaveBeenCalledWith('admin::user');
    expect(mockDbQueryFindOne).toHaveBeenCalledWith({
      where: { documentId: openedBy },
      select: ['id'],
    });
  });

  it('should pass the resolved internal user ID to `queryEngineWriter`.', async () => {
    // Given
    stubbedAdminUserResult = { id: 42 };

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID = 'user-doc-1';

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
        openedBy: 42,
      },
    });
  });

  it('should pass `null` as `openedBy` when no user is provided.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = null;

    // When
    await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(mockDbQueryFindOne).not.toHaveBeenCalled();
    expect(mockUpdateAllDocumentVersions).toHaveBeenCalledWith({
      uid,
      documentId,
      locale: stubbedResolveEffectiveLocaleResult,
      data: {
        openedAt,
        openedBy: null,
      },
    });
  });

  it('should pass `null` as `openedBy` when the admin user cannot be found.', async () => {
    // Given
    stubbedAdminUserResult = null;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID = 'user-doc-1';

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
        openedBy: null,
      },
    });
  });

  it('should return result from `queryEngineWriter.updateAllDocumentVersions()`.', async () => {
    // Given
    stubbedUpdateAllDocumentVersionsResult = 2;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';
    const openedAt: string = '2026-04-01T12:00:00Z';
    const openedBy: DocumentID | null = 'user-doc-1';

    // When
    const result = await service({ strapi: mockStrapi }).updateLastOpened({
      uid,
      documentId,
      locale,
      openedAt,
      openedBy,
    });

    // Then
    expect(result).toBe(2);
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
