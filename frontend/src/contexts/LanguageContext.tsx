import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fallbackLanguage, translations, type Language, type TranslationSchema } from '@/lib/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => unknown;
  translations: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'gran-dzilam:language';

const resolvePath = (object: Record<string, unknown>, path: string) => {
  return path.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, object);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(fallbackLanguage);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Language | null) : null;
    if (stored && translations[stored]) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const value = useMemo<LanguageContextValue>(() => {
    const currentTranslations = translations[language] ?? translations[fallbackLanguage];
    return {
      language,
      setLanguage,
      translations: currentTranslations,
      t: (path: string) => resolvePath(currentTranslations as Record<string, unknown>, path),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
};
