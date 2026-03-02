"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("ko"); // 기본 랜더링을 위한 임시갑
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // 클라이언트 마운트 시 저장소 확인
        const savedLang = localStorage.getItem("portfolio-lang") as Language;
        if (savedLang === "ko" || savedLang === "en") {
            setLanguageState(savedLang);
        } else {
            // 저장된 언어가 없으면 브라우저 언어 감지
            const browserLang = navigator.language;
            if (browserLang.startsWith("ko")) {
                setLanguageState("ko");
            } else {
                setLanguageState("en");
            }
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("portfolio-lang", lang);
    };

    const toggleLanguage = () => {
        setLanguage(language === "ko" ? "en" : "ko");
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isMounted }}>
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
