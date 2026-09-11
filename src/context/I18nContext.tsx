import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { I18nService, type SupportedLanguage } from '../core/services/I18nService';
import { useAuth } from './AuthContext';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const i18n = I18nService.getInstance();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<SupportedLanguage>(() => i18n.getLanguage());

  // Listen to external service language changes
  useEffect(() => {
    const unsubscribe = i18n.subscribe((newLang) => {
      setLanguageState(newLang);
    });
    return unsubscribe;
  }, [i18n]);

  // When user role changes or logs in, apply default language rules if no manual selection was saved
  useEffect(() => {
    if (user) {
      const targetLang = i18n.resolveLanguageForRole(user.role);
      if (targetLang !== language) {
        i18n.setLanguage(targetLang, false);
      }
    }
  }, [user, i18n]);

  const setLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      i18n.setLanguage(newLang, true);
    },
    [i18n]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return i18n.t(key, params);
    },
    [i18n, language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
