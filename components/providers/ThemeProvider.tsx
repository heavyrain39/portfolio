"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check local storage first
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
            return;
        }

        // If no saved theme, apply time-based logic
        const checkTime = () => {
            const now = new Date();
            // KR time is UTC+9. However, users are likely local. 
            // We'll use local time of the user's details.
            const currentHour = now.getHours();

            // 08:00 (8) to 17:00 (17) -> Light
            // Else -> Dark
            const isDayTime = currentHour >= 8 && currentHour < 17;
            const newTheme = isDayTime ? "light" : "dark";
            setTheme(newTheme);
            document.documentElement.setAttribute("data-theme", newTheme);
        };

        checkTime();

        // Optional: Update explicitly every minute, but usually on load is enough.
        // Setting an interval might be overkill but good for long sessions.
        const interval = setInterval(checkTime, 60000 * 60);
        return () => clearInterval(interval);

    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
