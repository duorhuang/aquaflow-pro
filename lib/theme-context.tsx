"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type ThemeId = "poolside" | "competition" | "training";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  accentColor: string;
  previewClass: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: "poolside",
    name: "清新水感",
    subtitle: "明亮透彻 · 日光泳池",
    isDark: false,
    accentColor: "#0284c7",
    previewClass: "bg-sky-50 border-sky-300 text-sky-900",
  },
  {
    id: "competition",
    name: "竞技深邃",
    subtitle: "沉稳专注 · 极速破浪",
    isDark: true,
    accentColor: "#38bdf8",
    previewClass: "bg-slate-900 border-sky-500 text-sky-300",
  },
  {
    id: "training",
    name: "温润中性",
    subtitle: "温和护眼 · 舒缓自然",
    isDark: false,
    accentColor: "#0f766e",
    previewClass: "bg-stone-50 border-teal-300 text-teal-900",
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeConfig[];
  currentThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "poolside",
  setTheme: () => {},
  themes: AVAILABLE_THEMES,
  currentThemeConfig: AVAILABLE_THEMES[0],
});

const STORAGE_KEY = "aquaflow_theme_v2";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("poolside");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (saved && (saved === "poolside" || saved === "competition" || saved === "training")) {
        setThemeState(saved);
      }
    } catch {
      // ignore localStorage errors in private browsing
    }
    setMounted(true);
  }, []);

  const setTheme = (nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore
    }
  };

  // Sync with document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    
    // Toggle standard .dark class for compatibility with Tailwind dark mode rules
    if (theme === "competition") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const currentThemeConfig = useMemo(() => {
    return AVAILABLE_THEMES.find((t) => t.id === theme) || AVAILABLE_THEMES[0];
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: AVAILABLE_THEMES,
      currentThemeConfig,
    }),
    [theme, currentThemeConfig]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
