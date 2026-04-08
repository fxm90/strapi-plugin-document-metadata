import { describe, it, expect } from 'vitest';
import { formatUserDisplayName } from './formatUserDisplayName';

//
// Types
//

import type { User } from '../types';

//
// Tests
//

describe(`test method "formatUserDisplayName()"`, () => {
  it('should return username when available.', async () => {
    // Given
    const user: User = {
      username: 'j.doe',
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
    };

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBe('j.doe');
  });

  it('should return full name when username is not available.', async () => {
    // Given
    const user: User = { firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com' };

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBe('Jane Doe');
  });

  it('should return only firstname when lastname is not available.', async () => {
    // Given
    const user: User = { firstname: 'Jane', email: 'jane@example.com' };

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBe('Jane');
  });

  it('should return only lastname when firstname is not available.', async () => {
    // Given
    const user: User = { lastname: 'Doe', email: 'jane@example.com' };

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBe('Doe');
  });

  it('should return email when neither username nor name is available.', async () => {
    // Given
    const user: User = { email: 'jane@example.com' };

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBe('jane@example.com');
  });

  it('should return null when no fields are available.', async () => {
    // Given
    const user: User = {};

    // When
    const result = formatUserDisplayName(user);

    // Then
    expect(result).toBeNull();
  });
});
