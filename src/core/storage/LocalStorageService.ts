import type { IStorage } from './IStorage';
import { Logger } from '../utils/Logger';

const logger = new Logger('LocalStorageService');

export class LocalStorageService implements IStorage {
  private static instance: LocalStorageService;

  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  public getItem<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      logger.error(`Error reading key "${key}" from localStorage:`, e);
      return null;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      logger.error(`Error writing key "${key}" to localStorage:`, e);
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      logger.error(`Error removing key "${key}" from localStorage:`, e);
    }
  }

  public clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      logger.error('Error clearing localStorage:', e);
    }
  }
}
