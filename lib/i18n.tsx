"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DICTIONARY, Language } from './dictionary';

type Dictionary = typeof DICTIONARY.en;

interface LanguageContextType {
    language: Language;
    t: Dictionary;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('zh');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('aquaflow-lang') as Language;
        if (saved && (saved === 'en' || saved === 'zh')) {
            setLanguage(saved);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('aquaflow-lang', lang);
    };

    const toggleLanguage = () => {
        handleSetLanguage(language === 'en' ? 'zh' : 'en');
    };

    return (
        <LanguageContext.Provider value={{
            language,
            t: DICTIONARY[language],
            setLanguage: handleSetLanguage,
            toggleLanguage
        }}>
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
