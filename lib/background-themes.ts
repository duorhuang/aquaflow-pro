export interface StarParticle {
  count?: number;
  moon?: { size?: number; phase?: 'crescent' | 'full' | 'quarter' };
}

export interface FireParticle {
  count?: number;
  colors?: string[];
}

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
  particles?: { type: 'stars'; config: StarParticle } | { type: 'fire'; config: FireParticle };
}

export const backgroundThemes: BackgroundTheme[] = [
  // Time-based auto-switch themes
  {
    id: 'morning-pool',
    name: '清晨泳池',
    nameEn: 'Morning Pool',
    gradient: 'from-[#1a1505] via-[#1a2020] to-[#0a1520]',
    texture: `url("data:image/svg+xml,%3Csvg width='60' height='20' viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q15 5 30 10 Q45 15 60 10' stroke='rgba(251,191,36,0.08)' fill='none'/%3E%3C/svg%3E")`,
    icon: '🌅',
    timeRange: [6, 9],
  },
  {
    id: 'sunlit-deck',
    name: '阳光泳道',
    nameEn: 'Sunlit Deck',
    gradient: 'from-[#1a2520] via-[#152520] to-[#0a1a25]',
    icon: '☀️',
    timeRange: [9, 14],
  },
  {
    id: 'afternoon-training',
    name: '午后训练',
    nameEn: 'Afternoon Training',
    gradient: 'from-[#151525] via-[#1a1525] to-[#0f0a20]',
    icon: '🏊',
    timeRange: [14, 17],
  },
  {
    id: 'golden-sunset',
    name: '黄昏水面',
    nameEn: 'Golden Sunset',
    gradient: 'from-[#1a0a05] via-[#1a1005] to-[#0a0a15]',
    icon: '🌇',
    timeRange: [17, 20],
  },
  {
    id: 'deep-ocean',
    name: '深蓝海洋',
    nameEn: 'Deep Ocean',
    gradient: 'from-[#050a1a] via-[#0a0f20] to-[#050515]',
    icon: '🌊',
    timeRange: [20, 23],
  },
  {
    id: 'night-waters',
    name: '夜空泳池',
    nameEn: 'Night Waters',
    gradient: 'from-[#0a0a1a] via-[#0d0d2b] to-[#050510]',
    icon: '🌙',
    timeRange: [23, 6],
    particles: {
      type: 'stars',
      config: { count: 40, moon: { size: 60, phase: 'crescent' } },
    },
  },

  // Training-type themes
  {
    id: 'sprint-fire',
    name: '冲刺火焰',
    nameEn: 'Sprint Fire',
    gradient: 'from-[#1a0505] via-[#2d0a0a] to-[#0f0303]',
    icon: '',
    trainingType: 'sprint',
    emotion: 'energetic',
    particles: {
      type: 'fire',
      config: { count: 20, colors: ['#ff4500', '#ff6b35', '#ffa500', '#ff8c00', '#ff3300'] },
    },
  },
  {
    id: 'recovery-calm',
    name: '恢复宁静',
    nameEn: 'Recovery Calm',
    gradient: 'from-[#051510] via-[#0a1a15] to-[#05100a]',
    icon: '🍃',
    trainingType: 'recovery',
    emotion: 'relaxed',
  },
  {
    id: 'aerobic-flow',
    name: '有氧水流',
    nameEn: 'Aerobic Flow',
    gradient: 'from-[#051a1a] via-[#0a1a1a] to-[#050a15]',
    icon: '💧',
    trainingType: 'aerobic',
    emotion: 'focused',
  },
  {
    id: 'anaerobic-power',
    name: '无氧力量',
    nameEn: 'Anaerobic Power',
    gradient: 'from-[#1a0520] via-[#150520] to-[#0a0515]',
    icon: '⚡',
    trainingType: 'anaerobic',
    emotion: 'energetic',
  },

  // Mood/emotion themes (manual pick)
  {
    id: 'calm-waves',
    name: '平静海浪',
    nameEn: 'Calm Waves',
    gradient: 'from-[#051515] via-[#0a1a1a] to-[#050f0a]',
    icon: '🌿',
    emotion: 'calm',
  },
  {
    id: 'energetic-pool',
    name: '活力泳池',
    nameEn: 'Energetic Pool',
    gradient: 'from-[#052020] via-[#0a1a20] to-[#051020]',
    icon: '🏊‍♂️',
    emotion: 'energetic',
  },
  {
    id: 'focused-lane',
    name: '专注泳道',
    nameEn: 'Focused Lane',
    gradient: 'from-[#151520] via-[#101018] to-[#0a0a15]',
    icon: '🎯',
    emotion: 'focused',
  },
  {
    id: 'relaxing-water',
    name: '放松水面',
    nameEn: 'Relaxing Water',
    gradient: 'from-[#051020] via-[#0a1525] to-[#050a1a]',
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
