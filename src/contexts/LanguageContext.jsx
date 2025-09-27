import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '@/locales/en.json';
import hiTranslations from '@/locales/hi.json';
import knTranslations from '@/locales/kn.json';

const languages = {
  en: { name: 'English', translations: enTranslations },
  hi: { name: 'हिंदी', translations: hiTranslations },
  kn: { name: 'ಕನ್ನಡ', translations: knTranslations }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('waterSupply_language');
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('waterSupply_language', languageCode);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = languages[currentLanguage].translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const getAvailableLanguages = () => {
    return Object.keys(languages).map(code => ({
      code,
      name: languages[code].name
    }));
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      getAvailableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};