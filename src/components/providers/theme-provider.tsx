"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
    children: React.ReactNode;
    attribute?: "class";
    defaultTheme?: Theme;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
};

const STORAGE_KEY = "theme";

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "system",
    enableSystem = true,
    disableTransitionOnChange = true,
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(
        defaultTheme === "dark" ? "dark" : "light",
    );

    const applyTheme = React.useCallback(
        (nextTheme: Theme) => {
            if (typeof document === "undefined") return;

            const resolved: ResolvedTheme =
                nextTheme === "system"
                    ? enableSystem
                        ? getSystemTheme()
                        : "light"
                    : nextTheme;

            const root = document.documentElement;

            if (disableTransitionOnChange) {
                root.classList.add("[&_*]:!transition-none");
                window.setTimeout(() => {
                    root.classList.remove("[&_*]:!transition-none");
                }, 0);
            }

            if (attribute === "class") {
                root.classList.remove("light", "dark");
                root.classList.add(resolved);
            }

            setResolvedTheme(resolved);
        },
        [attribute, disableTransitionOnChange, enableSystem],
    );

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        const initialTheme =
            stored === "light" || stored === "dark" || stored === "system"
                ? stored
                : defaultTheme;
        setThemeState(initialTheme);
        applyTheme(initialTheme);
    }, [applyTheme, defaultTheme]);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (theme === "system") applyTheme("system");
        };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [theme, applyTheme]);

    const setTheme = React.useCallback(
        (nextTheme: Theme) => {
            setThemeState(nextTheme);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, nextTheme);
            }
            applyTheme(nextTheme);
        },
        [applyTheme],
    );

    const value = React.useMemo(
        () => ({ theme, resolvedTheme, setTheme }),
        [theme, resolvedTheme, setTheme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = React.useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}

