import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Thin wrapper around Capacitor Preferences for async key-value persistence.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Reads a stored value by key.
   * @param {string} key - The storage key to look up.
   * @returns {Promise<string | null>} The stored value, or `null` when the key is missing.
   */
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  /**
   * Persists a string value under the given key.
   * @param {string} key - The storage key to write.
   * @param {string} value - The string value to persist.
   * @returns {Promise<void>} Resolves once the value has been written.
   */
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  /**
   * Removes a stored value by key.
   * @param {string} key - The storage key to remove.
   * @returns {Promise<void>} Resolves once the key has been removed.
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
