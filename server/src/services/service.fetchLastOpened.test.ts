import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import service from './service';

//
// Types
//

import type { Core, Schema } from '@strapi/strapi';
import type { AnyDocument, ContentTypeUID, DocumentID, Locale } from '../types';

//
// Mock "hasFieldOfType"
//

let stubbedHasFieldOfTypeResult: boolean;
const mockHasFieldOfType = vi.hoisted(() => vi.fn(() => stubbedHasFieldOfTypeResult));

vi.mock('../utils/hasFieldOfType', () => ({
  hasFieldOfType: mockHasFieldOfType,
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

// The result from a call to `strapi.documents("api::XYZ.XYZ").findOne()`.
let stubbedFindOneResult: AnyDocument;
const mockFindOne = vi.fn(() => stubbedFindOneResult);

const mockDocuments = vi.fn(() => {
  return {
    findOne: mockFindOne,
  };
});

// The result from a call to `strapi.getModel("api::XYZ.XYZ")`.
let stubbedGetModelResult: Schema.ContentType | undefined;
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
    stubbedHasFieldOfTypeResult = true;
    stubbedResolveEffectiveLocaleResult = 'en';
    stubbedFindOneResult = null;
    stubbedGetModelResult = createModel();
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

  it('should invoke `hasFieldOfType()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

    // When
    await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
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
    const locale: Locale = 'de';

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

  it('should invoke `resolveEffectiveLocale()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

    // When
    await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    expect(mockResolveEffectiveLocale).toHaveBeenCalledWith({
      strapi: mockStrapi,
      model: stubbedGetModelResult,
      locale,
    });
  });

  it('should invoke `strapi.documents(uid).findOne()` with correct parameters.', async () => {
    // Given
    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

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
      locale: stubbedResolveEffectiveLocaleResult,
    });
  });

  it('should return result from `strapi.documents(uid).findOne()`.', async () => {
    // Given
    stubbedFindOneResult = {
      id: '1',
      documentId: 'doc-1',
      openedAt: '2026-04-01T12:00:00Z',
      openedBy: 'Jane Doe',
    };

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
