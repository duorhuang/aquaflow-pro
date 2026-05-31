"use client";

import { resolveBackgroundTheme, saveThemePreference, backgroundThemes, type BackgroundTheme } from '@/lib/background-themes';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseBackgroundThemeResult {
  theme: BackgroundTheme;
  mode: 'auto-time' | 'auto-training' | 'manual';
  gradientClass: string;
  setManualTheme: (id: string) => void;
  setAutoMode: () => void;
  allThemes: BackgroundTheme[];
}

export function useBackgroundTheme(trainingType?: string): UseBackgroundThemeResult {
  const [manualOverride, setManualOverride] = useState<{ theme: BackgroundTheme; mode: 'manual' } | null>(null);

  // Recompute resolved theme on every render — no effect needed
  const resolved = useMemo(() => {
    if (manualOverride) return { theme: manualOverride.theme, mode: 'manual' as const };
    return resolveBackgroundTheme(trainingType);
  }, [manualOverride, trainingType]);

  // Re-check time-based theme every minute when in auto mode
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (manualOverride) return;
    const interval = setInterval(() => forceTick(n => n + 1), 60000);
    return () => clearInterval(interval);
  }, [manualOverride]);

  const setManualTheme = useCallback((id: string) => {
    const found = backgroundThemes.find(t => t.id === id);
    if (found) {
      setManualOverride({ theme: found, mode: 'manual' });
      saveThemePreference(id);
    }
  }, []);

  const setAutoMode = useCallback(() => {
    setManualOverride(null);
    saveThemePreference('auto');
  }, []);

  const gradientClass = resolved.theme.gradient;

  return {
    theme: resolved.theme,
    mode: resolved.mode,
    gradientClass,
    setManualTheme,
    setAutoMode,
    allThemes: backgroundThemes,
  };
}
