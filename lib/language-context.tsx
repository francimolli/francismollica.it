"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, Translation } from "./translations";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translation;
    onboardingComplete: boolean;
    setOnboardingComplete: (complete: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("it");

    // Optional: Persist language preference
    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && (savedLang === "it" || savedLang === "en")) {
            setLanguage(savedLang);
        }
    }, []);

    const [onboardingComplete, setOnboardingComplete] = useState(false);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
        onboardingComplete,
        setOnboardingComplete,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
