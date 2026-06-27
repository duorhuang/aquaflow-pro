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
    name: '清晨微波',
    nameEn: 'Morning Ripples',
    gradient: 'from-[#0b1b24] via-[#122e38] to-[#081f21]',
    texture: `url("data:image/svg+xml,%3Csvg width='60' height='20' viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q15 5 30 10 Q45 15 60 10' stroke='rgba(0,242,255,0.03)' fill='none'/%3E%3C/svg%3E")`,
    icon: '🌅',
    timeRange: [6, 9],
  },
  {
    id: 'sunlit-deck',
    name: '阳光碧蓝',
    nameEn: 'Sunlit Aqua',
    gradient: 'from-[#052136] via-[#093754] to-[#031526]',
    icon: '☀️',
    timeRange: [9, 14],
  },
  {
    id: 'afternoon-training',
    name: '午后晶蓝',
    nameEn: 'Crystalline Afternoon',
    gradient: 'from-[#04132b] via-[#082b54] to-[#041021]',
    icon: '🏊',
    timeRange: [14, 17],
  },
  {
    id: 'golden-sunset',
    name: '落日金粼',
    nameEn: 'Golden Sunset Waves',
    gradient: 'from-[#19152b] via-[#241a2e] to-[#0f0e1f]',
    icon: '🌇',
    timeRange: [17, 20],
  },
  {
    id: 'deep-ocean',
    name: '深海潜流',
    nameEn: 'Deep Ocean Current',
    gradient: 'from-[#020914] via-[#051630] to-[#010408]',
    icon: '🌊',
    timeRange: [20, 23],
  },
  {
    id: 'night-waters',
    name: '星夜静水',
    nameEn: 'Starlit Waters',
    gradient: 'from-[#020512] via-[#050b24] to-[#01020a]',
    icon: '🌙',
    timeRange: [23, 6],
    particles: {
      type: 'stars',
      config: { count: 60, moon: { size: 70, phase: 'crescent' } },
    },
  },

  // Training-type themes
  {
    id: 'sprint-fire',
    name: '极限冲刺',
    nameEn: 'Abyssal Spark',
    gradient: 'from-[#1a0812] via-[#2d0916] to-[#0f0308]',
    icon: '🔥',
    trainingType: 'sprint',
    emotion: 'energetic',
    particles: {
      type: 'fire',
      config: { count: 30, colors: ['#00f2ff', '#00bfff', '#ff3366', '#ff003c', '#ff5500'] }, // Fusion of aquatic blue and aggressive red
    },
  },
  {
    id: 'recovery-calm',
    name: '治愈清泉',
    nameEn: 'Healing Spring',
    gradient: 'from-[#051c1a] via-[#09332f] to-[#021211]',
    icon: '🍃',
    trainingType: 'recovery',
    emotion: 'relaxed',
  },
  {
    id: 'aerobic-flow',
    name: '律动水流',
    nameEn: 'Rhythmic Flow',
    gradient: 'from-[#031526] via-[#062c4a] to-[#020e1a]',
    icon: '💧',
    trainingType: 'aerobic',
    emotion: 'focused',
  },
  {
    id: 'anaerobic-power',
    name: '高压深潜',
    nameEn: 'High Pressure Dive',
    gradient: 'from-[#0b0521] via-[#1a0c47] to-[#050212]',
    icon: '⚡',
    trainingType: 'anaerobic',
    emotion: 'energetic',
  },

  // Mood/emotion themes (manual pick)
  {
    id: 'calm-waves',
    name: '静谧海湾',
    nameEn: 'Tranquil Cove',
    gradient: 'from-[#031c26] via-[#073445] to-[#02131a]',
    icon: '🌿',
    emotion: 'calm',
  },
  {
    id: 'energetic-pool',
    name: '沸腾泳池',
    nameEn: 'Boiling Pool',
    gradient: 'from-[#082a3d] via-[#0e4869] to-[#041724]',
    icon: '🏊‍♂️',
    emotion: 'energetic',
  },
  {
    id: 'focused-lane',
    name: '深邃泳道',
    nameEn: 'Profound Lane',
    gradient: 'from-[#04081c] via-[#0a143b] to-[#02040d]',
    icon: '🎯',
    emotion: 'focused',
  },
  {
    id: 'relaxing-water',
    name: '漂浮时光',
    nameEn: 'Floating Time',
    gradient: 'from-[#06192e] via-[#0a294f] to-[#030d17]',
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
