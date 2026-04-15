import type { Schema } from '@strapi/strapi';

/**
 * Checks if a content type model has a relation field with the specified relation kind and target.
 *
 * @param contentType - The content type model to check.
 * @param fieldName - The name of the field to check.
 * @param expectedRelation - The expected relation kind (e.g. `'oneToOne'`, `'manyToOne'`).
 * @param expectedTarget - The expected target UID (e.g. `'admin::user'`).
 *
 * @returns `true` if the field exists and matches the expected relation and target, `false` otherwise.
 */
export const hasRelationOfType = (
  contentType: Schema.ContentType,
  fieldName: string,
  expectedRelation: string,
  expectedTarget: string
): boolean => {
  const attribute = contentType.attributes[fieldName];
  return (
    attribute?.type === 'relation' &&
    attribute?.relation === expectedRelation &&
    // Narrows the Relation union to variants that have a `target` (excludes `morphToOne`/`morphToMany`).
    'target' in attribute &&
    attribute?.target === expectedTarget
  );
};
