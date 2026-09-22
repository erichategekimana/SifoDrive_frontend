import rwDict from '../../locales/rw.json';
import enDict from '../../locales/en.json';
import { LocalStorageService } from '../storage/LocalStorageService';
import { Logger } from '../utils/Logger';

const logger = new Logger('I18nService');

export type SupportedLanguage = 'rw' | 'en';

export class I18nService {
  private static instance: I18nService;
  private currentLanguage: SupportedLanguage = 'rw';
  private readonly storage: LocalStorageService;
  private readonly dictionaries: Record<SupportedLanguage, Record<string, any>> = {
    rw: rwDict,
    en: enDict,
  };
  private listeners: Array<(lang: SupportedLanguage) => void> = [];

  private constructor() {
    this.storage = LocalStorageService.getInstance();
    const stored = this.storage.getItem<SupportedLanguage>('sifo_language');
    if (stored === 'rw' || stored === 'en') {
      this.currentLanguage = stored;
    } else {
      // Default to Kinyarwanda as required
      this.currentLanguage = 'rw';
    }
    this.updateHtmlLangAttribute(this.currentLanguage);
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Determine primary language based on user role.
   * Only SYSTEM_ADMIN uses English as their primary and only language.
   * All other roles (TRAINING_ADMIN, TUTOR, STUDENT, GUEST, AGENT, etc.)
   * have Kinyarwanda as their primary language.
   */
  public resolveLanguageForRole(role?: string): SupportedLanguage {
    if (role === 'SYSTEM_ADMIN') {
      return 'en';
    }
    return 'rw';
  }

  public setLanguage(lang: SupportedLanguage, isManualUserSelection = true): void {
    if (lang !== this.currentLanguage) {
      logger.info(`Switching platform language: ${this.currentLanguage} -> ${lang}`);
      this.currentLanguage = lang;
      if (isManualUserSelection) {
        this.storage.setItem('sifo_language', lang);
      }
      this.updateHtmlLangAttribute(lang);
      this.listeners.forEach((listener) => listener(lang));
    }
  }

  public subscribe(listener: (lang: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Translate a nested key (e.g. 'nav.courses') with optional parameters.
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const dict = this.dictionaries[this.currentLanguage] || this.dictionaries.rw;
    const fallbackDict = this.dictionaries.rw;

    let value = this.getNestedValue(dict, key);
    if (!value && dict !== fallbackDict) {
      value = this.getNestedValue(fallbackDict, key);
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc, [k, v]) => {
        return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }, value);
    }

    return value;
  }

  private getNestedValue(obj: Record<string, any>, key: string): string | undefined {
    const keys = key.split('.');
    let current: any = obj;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    return typeof current === 'string' ? current : undefined;
  }

  private updateHtmlLangAttribute(lang: SupportedLanguage): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
  }
}
