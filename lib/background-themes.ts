export interface BackgroundTheme {
  id: string;
  name: string;
  nameEn: string;
  gradient: string;
  texture?: string;
  icon: string;
  timeRange?: [number, number];
  trainingType?: string;
  emotion?: string;
}

export const backgroundThemes: BackgroundTheme[] = [
  // Time-based auto-switch themes
  {
    id: 'morning-pool',
    name: '清晨泳池',
    nameEn: 'Morning Pool',
    gradient: 'from-amber-950/40 via-background to-sky-900/30',
    texture: `url("data:image/svg+xml,%3Csvg width='60' height='20' viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q15 5 30 10 Q45 15 60 10' stroke='rgba(251,191,36,0.08)' fill='none'/%3E%3C/svg%3E")`,
    icon: '🌅',
    timeRange: [6, 9],
  },
  {
    id: 'sunlit-deck',
    name: '阳光泳道',
    nameEn: 'Sunlit Deck',
    gradient: 'from-sky-950/30 via-background to-blue-900/20',
    icon: '☀️',
    timeRange: [9, 14],
  },
  {
    id: 'afternoon-training',
    name: '午后训练',
    nameEn: 'Afternoon Training',
    gradient: 'from-blue-950/30 via-background to-indigo-900/20',
    icon: '🏊',
    timeRange: [14, 17],
  },
  {
    id: 'golden-sunset',
    name: '黄昏水面',
    nameEn: 'Golden Sunset',
    gradient: 'from-orange-950/40 via-background to-rose-900/30',
    icon: '🌇',
    timeRange: [17, 20],
  },
  {
    id: 'deep-ocean',
    name: '深蓝海洋',
    nameEn: 'Deep Ocean',
    gradient: 'from-blue-950/50 via-background to-cyan-900/20',
    icon: '🌊',
    timeRange: [20, 23],
  },
  {
    id: 'night-waters',
    name: '夜空泳池',
    nameEn: 'Night Waters',
    gradient: 'from-slate-950 via-background to-indigo-950/30',
    icon: '🌙',
    timeRange: [23, 6],
  },

  // Training-type themes
  {
    id: 'sprint-fire',
    name: '冲刺火焰',
    nameEn: 'Sprint Fire',
    gradient: 'from-red-950/40 via-background to-orange-900/30',
    icon: '🔥',
    trainingType: 'sprint',
    emotion: 'energetic',
  },
  {
    id: 'recovery-calm',
    name: '恢复宁静',
    nameEn: 'Recovery Calm',
    gradient: 'from-emerald-950/40 via-background to-teal-900/30',
    icon: '🍃',
    trainingType: 'recovery',
    emotion: 'relaxed',
  },
  {
    id: 'aerobic-flow',
    name: '有氧水流',
    nameEn: 'Aerobic Flow',
    gradient: 'from-blue-950/30 via-background to-cyan-900/20',
    icon: '💧',
    trainingType: 'aerobic',
    emotion: 'focused',
  },
  {
    id: 'anaerobic-power',
    name: '无氧力量',
    nameEn: 'Anaerobic Power',
    gradient: 'from-purple-950/40 via-background to-pink-900/30',
    icon: '⚡',
    trainingType: 'anaerobic',
    emotion: 'energetic',
  },

  // Mood/emotion themes (manual pick)
  {
    id: 'calm-waves',
    name: '平静海浪',
    nameEn: 'Calm Waves',
    gradient: 'from-teal-950/30 via-background to-cyan-900/20',
    icon: '🌿',
    emotion: 'calm',
  },
  {
    id: 'energetic-pool',
    name: '活力泳池',
    nameEn: 'Energetic Pool',
    gradient: 'from-cyan-950/30 via-background to-blue-900/20',
    icon: '🏊‍♂️',
    emotion: 'energetic',
  },
  {
    id: 'focused-lane',
    name: '专注泳道',
    nameEn: 'Focused Lane',
    gradient: 'from-slate-900 via-background to-blue-950/30',
    icon: '🎯',
    emotion: 'focused',
  },
  {
    id: 'relaxing-water',
    name: '放松水面',
    nameEn: 'Relaxing Water',
    gradient: 'from-sky-950/20 via-background to-indigo-900/10',
    icon: '💙',
    emotion: 'relaxed',
  },
];

/**
 * Get the auto-switch background theme based on current time of day.
 */
export function getTimeBasedTheme(): BackgroundTheme | undefined {
  const hour = new Date().getHours();
  return backgroundThemes.find(t => {
    if (!t.timeRange) return false;
    const [start, end] = t.timeRange;
    if (start < end) return hour >= start && hour < end;
    // Overnight range (e.g., 23-6)
    return hour >= start || hour < end;
  });
}

/**
 * Get the training-type based background theme.
 */
export function getTrainingTypeTheme(trainingType: string): BackgroundTheme | undefined {
  return backgroundThemes.find(t => t.trainingType === trainingType);
}

/**
 * Safe localStorage getter for SSR environments.
 */
function safeGetItem(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore in SSR
  }
}

/**
 * Get the currently selected theme from localStorage, or fall back to auto.
 */
export function resolveBackgroundTheme(
  trainingType?: string,
): { theme: BackgroundTheme; mode: 'auto-time' | 'auto-training' | 'manual' } {
  const stored = safeGetItem('aquaflow_bg_theme');
  if (stored && stored !== 'auto') {
    const manual = backgroundThemes.find(t => t.id === stored);
    if (manual) return { theme: manual, mode: 'manual' };
  }

  if (trainingType) {
    const typeTheme = getTrainingTypeTheme(trainingType);
    if (typeTheme) return { theme: typeTheme, mode: 'auto-training' };
  }

  const timeTheme = getTimeBasedTheme();
  if (timeTheme) return { theme: timeTheme, mode: 'auto-time' };

  return { theme: backgroundThemes[0], mode: 'auto-time' };
}

/**
 * Save theme preference to localStorage.
 */
export function saveThemePreference(themeId: string | 'auto'): void {
  safeSetItem('aquaflow_bg_theme', themeId);
}

/**
 * Get current preference.
 */
export function getThemePreference(): string | 'auto' {
  const stored = safeGetItem('aquaflow_bg_theme');
  return (stored as string | 'auto') || 'auto';
}
