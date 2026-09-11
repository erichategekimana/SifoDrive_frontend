/**
 * Sifo Drive — Storage Abstraction Interface
 */

export interface IStorage {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}
