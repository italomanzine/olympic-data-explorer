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

  // Persistir escolha (opcional, simples via localStorage)
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
    // Se o idioma for inglês, retorna o original (que já é inglês)
    if (language === 'en') return sportName;
    
    // Tenta encontrar no dicionário específico
    const dict = sportTranslations[language];
    if (dict && dict[sportName]) {
      return dict[sportName];
    }
    
    // Se não achar, retorna o original em inglês
    return sportName;
  };

  const tCountry = (noc: string) => {
     // Se o idioma for inglês, retorna o código por enquanto ou tenta achar o nome original na lista (mas aqui usamos o código como chave)
     // O ideal seria ter um mapa Code -> English Name também se quiséssemos traduzir do código para inglês, mas o backend já manda "Nome (Code)".
     // Aqui vamos retornar apenas o nome traduzido se houver.
     
     if (language === 'en') return ''; // Deixa o frontend usar o label original do backend se for EN (ou implementamos EN no dicionário)

     const dict = countryTranslations[language];
     if (dict && dict[noc]) {
       return dict[noc];
     }
     return ''; // Retorna vazio para indicar "use o fallback/label original"
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
