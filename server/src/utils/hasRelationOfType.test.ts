import { describe, it, expect } from 'vitest';
import { hasRelationOfType } from './hasRelationOfType';

//
// Types
//

import type { Schema } from '@strapi/strapi';

//
// Tests
//

describe(`test method "hasRelationOfType()"`, () => {
  it('should return `false` if field name does not exist.', async () => {
    // Given
    const contentType = createContentTypeModel({});
    const fieldName = 'fooBar';
    const expectedRelation = 'oneToOne';
    const expectedTarget = 'admin::user';

    // When
    const result = hasRelationOfType(contentType, fieldName, expectedRelation, expectedTarget);

    // Then
    expect(result).toBe(false);
  });

  it('should return `false` if field is not a relation.', async () => {
    // Given
    const contentType = createContentTypeModel({
      fooBar: { type: 'string' },
    });

    const fieldName = 'fooBar';
    const expectedRelation = 'oneToOne';
    const expectedTarget = 'admin::user';

    // When
    const result = hasRelationOfType(contentType, fieldName, expectedRelation, expectedTarget);

    // Then
    expect(result).toBe(false);
  });

  it('should return `false` if relation kind does not match.', async () => {
    // Given
    const contentType = createContentTypeModel({
      fooBar: { type: 'relation', relation: 'manyToOne', target: 'admin::user' },
    });

    const fieldName = 'fooBar';
    const expectedRelation = 'oneToOne';
    const expectedTarget = 'admin::user';

    // When
    const result = hasRelationOfType(contentType, fieldName, expectedRelation, expectedTarget);

    // Then
    expect(result).toBe(false);
  });

  it('should return `false` if target does not match.', async () => {
    // Given
    const contentType = createContentTypeModel({
      fooBar: { type: 'relation', relation: 'oneToOne', target: 'api::post.post' },
    });

    const fieldName = 'fooBar';
    const expectedRelation = 'oneToOne';
    const expectedTarget = 'admin::user';

    // When
    const result = hasRelationOfType(contentType, fieldName, expectedRelation, expectedTarget);

    // Then
    expect(result).toBe(false);
  });

  it('should return `true` if field matches relation and target.', async () => {
    // Given
    const contentType = createContentTypeModel({
      fooBar: { type: 'relation', relation: 'oneToOne', target: 'admin::user' },
    });

    const fieldName = 'fooBar';
    const expectedRelation = 'oneToOne';
    const expectedTarget = 'admin::user';

    // When
    const result = hasRelationOfType(contentType, fieldName, expectedRelation, expectedTarget);

    // Then
    expect(result).toBe(true);
  });
});

//
// Helper
//

const createContentTypeModel = (attributes: Schema.Attributes): Schema.ContentType => ({
  modelType: 'contentType',
  modelName: 'test',
  globalId: 'Test',
  uid: 'api::test.test',
  kind: 'collectionType',
  info: { singularName: 'test', pluralName: 'tests', displayName: 'Test' },
  options: {},
  attributes,
  pluginOptions: {},
});
