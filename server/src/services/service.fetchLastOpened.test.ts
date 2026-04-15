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
// Mock "hasRelationOfType"
//

let stubbedHasRelationOfTypeResult: boolean;
const mockHasRelationOfType = vi.hoisted(() => vi.fn(() => stubbedHasRelationOfTypeResult));

vi.mock('../utils/hasRelationOfType', () => ({
  hasRelationOfType: mockHasRelationOfType,
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

// The result from a call to `strapi.documents("api::XYZ.XYZ").findOne()` for the content type.
let stubbedFindOneResult: AnyDocument | null;
const mockFindOne = vi.fn(() => stubbedFindOneResult);

const mockDocuments = vi.fn(() => ({
  findOne: mockFindOne,
}));

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
    stubbedHasRelationOfTypeResult = true;
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
    const locale: Locale = 'de';

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
    expect(mockHasFieldOfType).toHaveBeenCalledWith(stubbedGetModelResult, 'openedAt', 'datetime');
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

  it('should invoke `hasRelationOfType()` with correct parameters.', async () => {
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
      fields: ['openedAt'],
      populate: {
        openedBy: true,
      },
      locale: stubbedResolveEffectiveLocaleResult,
    });
  });

  it('should return `null` when the document is not found.', async () => {
    // Given
    stubbedFindOneResult = null;

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

    // When
    const result = await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    expect(result).toBeNull();
  });

  it('should return `{ openedBy: null }` when `openedBy` is not set.', async () => {
    // Given
    const openedAt = '2026-04-01T12:00:00Z';
    const openedBy = null;
    stubbedFindOneResult = { id: '1', documentId: 'doc-1', openedAt, openedBy };

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

    // When
    const result = await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    expect(result).toEqual({ openedAt, openedBy });
  });

  it('should return the populated user fields when `openedBy` is a relation.', async () => {
    // Given
    const openedAt = '2026-04-01T12:00:00Z';
    const openedBy = {
      id: 123,
      documentId: 'doc-123',
      username: 'jdoe',
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
      password: 'secret',
    };

    stubbedFindOneResult = {
      id: '1',
      documentId: 'doc-1',
      openedAt,
      openedBy,
    };

    const uid: ContentTypeUID = 'api::test.test';
    const documentId: DocumentID = 'doc-1';
    const locale: Locale = 'de';

    // When
    const result = await service({ strapi: mockStrapi }).fetchLastOpened({
      uid,
      documentId,
      locale,
    });

    // Then
    const { username, firstname, lastname, email } = openedBy;
    expect(result).toEqual({
      openedAt,
      openedBy: { username, firstname, lastname, email },
    });
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
