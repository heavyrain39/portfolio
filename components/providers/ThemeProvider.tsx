"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    DAY_END_HOUR,
    DAY_START_HOUR,
    LEGACY_THEME_STORAGE_KEY,
    THEME_STORAGE_KEY
} from "./theme-script";

type Theme = "light" | "dark";
// "auto" follows the visitor's local time; "light"/"dark" are explicit choices.
export type ThemePreference = "auto" | Theme;

interface ThemeContextType {
    theme: Theme;
    preference: ThemePreference;
    setPreference: (preference: ThemePreference) => void;
    cyclePreference: () => void;
    isMounted: boolean;
}

// New key: the old "theme" key was written by ?theme= URL overrides and could pin a
// browser to one theme forever, so it is discarded instead of migrated.
const STORAGE_KEY = THEME_STORAGE_KEY;
const LEGACY_STORAGE_KEY = LEGACY_THEME_STORAGE_KEY;
const CYCLE: ThemePreference[] = ["auto", "light", "dark"];
const AUTO_CHECK_INTERVAL_MS = 60 * 1000;

const getTimeBasedTheme = (): Theme => {
    const hour = new Date().getHours();
    return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? "light" : "dark";
};

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>("auto");
    // A ?theme= override applies to the current visit only and is never persisted.
    const [urlOverride, setUrlOverride] = useState<Theme | null>(null);
    const [autoTheme, setAutoTheme] = useState<Theme>("light");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        localStorage.removeItem(LEGACY_STORAGE_KEY);

        const urlTheme = new URLSearchParams(window.location.search).get("theme");
        if (isTheme(urlTheme)) setUrlOverride(urlTheme);

        const saved = localStorage.getItem(STORAGE_KEY);
        if (isTheme(saved)) setPreferenceState(saved);

        setAutoTheme(getTimeBasedTheme());
        setIsMounted(true);
    }, []);

    // Re-evaluate the clock while following local time so 08:00 / 17:00 switch on time.
    useEffect(() => {
        if (preference !== "auto" || urlOverride) return;
        const interval = window.setInterval(() => setAutoTheme(getTimeBasedTheme()), AUTO_CHECK_INTERVAL_MS);
        return () => window.clearInterval(interval);
    }, [preference, urlOverride]);

    const theme: Theme = urlOverride ?? (preference === "auto" ? autoTheme : preference);

    useEffect(() => {
        if (!isMounted) return;
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme, isMounted]);

    const setPreference = useCallback((next: ThemePreference) => {
        // An explicit choice replaces any URL override for the rest of the visit.
        setUrlOverride(null);
        setPreferenceState(next);
        if (next === "auto") {
            localStorage.removeItem(STORAGE_KEY);
            setAutoTheme(getTimeBasedTheme());
        } else {
            localStorage.setItem(STORAGE_KEY, next);
        }
    }, []);

    const cyclePreference = useCallback(() => {
        setPreference(CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length]);
    }, [preference, setPreference]);

    return (
        <ThemeContext.Provider value={{ theme, preference, setPreference, cyclePreference, isMounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
