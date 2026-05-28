"use client";

import { resolveBackgroundTheme, saveThemePreference, getThemePreference, backgroundThemes, type BackgroundTheme } from '@/lib/background-themes';
import { useState, useEffect, useCallback } from 'react';

interface UseBackgroundThemeResult {
  theme: BackgroundTheme;
  mode: 'auto-time' | 'auto-training' | 'manual';
  gradientClass: string;
  setManualTheme: (id: string) => void;
  setAutoMode: () => void;
  allThemes: BackgroundTheme[];
}

export function useBackgroundTheme(trainingType?: string): UseBackgroundThemeResult {
  const [theme, setTheme] = useState<BackgroundTheme>(() => {
    const resolved = resolveBackgroundTheme(trainingType);
    return resolved.theme;
  });
  const [mode, setMode] = useState<'auto-time' | 'auto-training' | 'manual'>(() => {
    const resolved = resolveBackgroundTheme(trainingType);
    return resolved.mode;
  });

  // Re-resolve when trainingType changes (for auto-training mode)
  useEffect(() => {
    const pref = getThemePreference();
    if (pref === 'auto') {
      const resolved = resolveBackgroundTheme(trainingType);
      setTheme(resolved.theme);
      setMode(resolved.mode);
    }
  }, [trainingType]);

  // Re-check time-based theme every minute
  useEffect(() => {
    const pref = getThemePreference();
    if (pref === 'auto') {
      const interval = setInterval(() => {
        const resolved = resolveBackgroundTheme(trainingType);
        setTheme(resolved.theme);
        setMode(resolved.mode);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [trainingType]);

  const setManualTheme = useCallback((id: string) => {
    const found = backgroundThemes.find(t => t.id === id);
    if (found) {
      setTheme(found);
      setMode('manual');
      saveThemePreference(id);
    }
  }, []);

  const setAutoMode = useCallback(() => {
    const resolved = resolveBackgroundTheme(trainingType);
    setTheme(resolved.theme);
    setMode(resolved.mode);
    saveThemePreference('auto');
  }, [trainingType]);

  const gradientClass = theme.gradient;

  return {
    theme,
    mode,
    gradientClass,
    setManualTheme,
    setAutoMode,
    allThemes: backgroundThemes,
  };
}
