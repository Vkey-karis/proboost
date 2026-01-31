
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Theme } from '../types.ts';
import { translations } from '../translations.ts';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('proboost-lang') as Language) || 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('proboost-theme') as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('proboost-theme', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('proboost-lang', lang);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
