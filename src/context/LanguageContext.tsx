import { createContext, useContext, useState, type ReactNode } from 'react';
import { getLanguage, setLanguage, type Language } from '../utils/i18n';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [langState, setLangState] = useState<Language>(() => getLanguage());

  const handleSetLang = (next: Language) => {
    setLangState(next);
    setLanguage(next);
  };

  return (
    <LanguageContext.Provider value={{ lang: langState, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};


