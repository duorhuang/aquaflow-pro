/**
 * PersistLayer — localStorage persistence for store collections.
 * Read/write interface with 7-day TTL and timestamp tracking.
 */

const STORAGE_KEYS = [
  'plans', 'swimmers', 'feedbacks', 'attendance', 'performances',
  'weeklyPlans', 'announcements', 'archivedAnnouncements', 'templates',
] as const;

const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export type StorageKey = typeof STORAGE_KEYS[number];

export function persist(key: StorageKey, data: unknown[]) {
  try {
    localStorage.setItem(`aquaflow_local_${key}`, JSON.stringify(data));
    localStorage.setItem('aquaflow_local_timestamp', Date.now().toString());
  } catch (e) {
    console.warn('[localStorage] Failed to persist:', e);
  }
}

export function persistAll(snapshot: Record<string, unknown[]>) {
  try {
    for (const key of STORAGE_KEYS) {
      if (snapshot[key]) localStorage.setItem(`aquaflow_local_${key}`, JSON.stringify(snapshot[key]));
    }
    localStorage.setItem('aquaflow_local_timestamp', Date.now().toString());
  } catch (e) {
    console.warn('[localStorage] Failed to persist all:', e);
  }
}

export function loadFromStorage(): { hasData: boolean; collections: Record<string, unknown[]> } {
  try {
    const timestamp = localStorage.getItem('aquaflow_local_timestamp');
    if (!timestamp) return { hasData: false, collections: {} };

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > MAX_AGE) return { hasData: false, collections: {} };

    const collections: Record<string, unknown[]> = {};
    let hasData = false;
    for (const key of STORAGE_KEYS) {
      const raw = localStorage.getItem(`aquaflow_local_${key}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.length > 0) {
          hasData = true;
          collections[key] = data;
        }
      }
    }
    return { hasData, collections };
  } catch (e) {
    console.warn('[localStorage] Failed to load:', e);
    return { hasData: false, collections: {} };
  }
}

export function loadCollection(key: StorageKey): unknown[] {
  try {
    const raw = localStorage.getItem(`aquaflow_local_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
