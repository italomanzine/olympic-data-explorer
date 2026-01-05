"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, sportTranslations, countryTranslations } from '../lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tSport: (sportName: string) => string;
  tCountry: (noc: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt-BR');

  useEffect(() => {
    const saved = localStorage.getItem('olympic-lang') as Language;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('olympic-lang', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const tSport = (sportName: string) => {
    if (language === 'en') return sportName;
    
    const dict = sportTranslations[language];
    if (dict && dict[sportName]) {
      return dict[sportName];
    }
    
    return sportName;
  };

  const tCountry = (noc: string) => {
     if (language === 'en') return '';

     const dict = countryTranslations[language];
     if (dict && dict[noc]) {
       return dict[noc];
     }
     return '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, tSport, tCountry }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
