import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import service from './service';

//
// Types
//

import type { Core } from '@strapi/strapi';
import type { AnyDocument, ContentTypeUID, DocumentID, Locale } from '../types';
import type { ModelI18nOptions } from './service';

//
// Mock "rawDocumentWriter"
//

let stubbedUpdateAllDocumentVersionsResult: number;
const mockUpdateAllDocumentVersions = vi.hoisted(() =>
  vi.fn(() => stubbedUpdateAllDocumentVersionsResult)
);

vi.mock('../utils/rawDocumentWriter', () => ({
  rawDocumentWriter: vi.fn(() => ({
    updateAllDocumentVersions: mockUpdateAllDocumentVersions,
  })),
}));

//
// Mock "Strapi"
//

// The result from a call to `strapi.documents("api::XYZ.XYZ").findOne()`.
let stubbedFindOneResult: AnyDocument;
const mockFindOne = vi.fn(() => stubbedFindOneResult);

const mockDocuments = vi.fn(() => {
  return {
    findOne: mockFindOne,
  };
});

// The result from a call to `strapi.getModel("api::XYZ.XYZ")`.
let stubbedGetModelResult: ModelI18nOptions | undefined;
const mockGetModel = vi.fn(() => stubbedGetModelResult);

const mockStrapi = {
  documents: mockDocuments,
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

describe(`test method "fetchLastOpened()"`, () => {
  beforeEach(() => {
    stubbedGetModelResult = createModelWithLocalization(false);
    stubbedFindOneResult = { id: '1', documentId: 'doc-1' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should invoke `strapi.getModel(uid)`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';

    // When
    await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
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

    // When
    await expect(() =>
      service({ strapi: mockStrapi }).fetchLastOpened({
        uid,
        documentId,
        locale,
      })
    )
      // Then
      .rejects.toThrow();
  });

  it('should invoke `strapi.documents(uid)` with correct uid.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';

    // When
    await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    expect(mockDocuments).toHaveBeenCalledWith(uid);
  });

  it.each([{ isLocalized: true }, { isLocalized: false }])(
    'should invoke `strapi.documents(uid).findOne()` with correct parameters (isLocalized: $isLocalized).',
    async ({ isLocalized }) => {
      // Given
      stubbedGetModelResult = createModelWithLocalization(isLocalized);

      // Given
      const uid: ContentTypeUID = 'api::test.test';
      const documentId: DocumentID = 'doc-1';
      const locale: Locale = 'en';

      // When
      await service({ strapi: mockStrapi }).fetchLastOpened({
        uid,
        documentId,
        locale,
      });

      // Then
      expect(mockFindOne).toHaveBeenCalledWith({
        documentId,
        fields: ['openedAt', 'openedBy'],
        locale: isLocalized ? locale : undefined,
      });
    }
  );

  it('should return result from `strapi.documents(uid).findOne()`.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'en';

    // When
    const result = await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    expect(result).toBe(stubbedFindOneResult);
  });
});

describe(`test method "updateLastOpened()"`, () => {
  beforeEach(() => {
    stubbedGetModelResult = createModelWithLocalization(false);
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

  it.each([{ isLocalized: true }, { isLocalized: false }])(
    'should invoke `documentWriter.updateAllDocumentVersions()` with correct parameters (isLocalized: $isLocalized).',
    async ({ isLocalized }) => {
      // Given
      stubbedGetModelResult = createModelWithLocalization(isLocalized);

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
        locale: isLocalized ? locale : undefined,
        data: {
          openedAt,
          openedBy,
        },
      });
    }
  );

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

/** Creates a model with localization enabled or disabled. */
const createModelWithLocalization = (localized: boolean): ModelI18nOptions => ({
  pluginOptions: {
    i18n: {
      localized,
    },
  },
});
