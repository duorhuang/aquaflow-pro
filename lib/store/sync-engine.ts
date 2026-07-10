/**
 * SyncEngine — polling, mutation guard, quota detection, and initial API load.
 * Extracted from the monolithic store to isolate sync concerns.
 *
 * V13 STABILITY:
 * - Added `triggerSync` for manual re-sync (replaces full page reload).
 * - Skip initial sync API call on unauthenticated pages to avoid wasteful 401s.
 * - Prevent `setSyncStatus('syncing')` churn that caused RefreshButton flicker.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { fetchAPI } from '../api-client';

const MUTATION_GUARD_MS = 15000;
const POLL_INTERVAL_MS = 20000;
const WAKE_TIMEOUT_MS = 2000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Check if an error message indicates the user is unauthenticated (401) or forbidden (403). */
function isAuthError(msg: string): boolean {
  return msg?.includes('Unauthorized') || msg?.includes('Forbidden') || msg?.includes('API Error: 401') || msg?.includes('API Error: 403');
}

export function isQuotaError(msg: string): boolean {
  return (
    msg?.includes('data transfer quota') ||
    msg?.includes('HTTP status 402') ||
    msg?.includes('QUOTA-EXHAUSTED') ||
    msg?.includes('Database Quota Exceeded') ||
    msg?.includes('exceeded maximum request size') ||
    msg?.includes('503 Service Unavailable') ||
    msg?.includes('API Error: 503') ||
    msg?.includes('Database waking up') ||
    msg?.includes('DB warmup timeout')
  );
}

/** Check if localStorage has data within the TTL window. */
export function hasFreshStorage(): boolean {
  try {
    const ts = localStorage.getItem('aquaflow_local_timestamp');
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) <= MAX_AGE_MS;
  } catch {
    return false;
  }
}

/**
 * Quick check for whether the user has a session cookie set.
 * Used to skip the initial /api/sync call on public pages (home, login)
 * to avoid a guaranteed 401 and the associated state churn.
 */
function hasSessionCookie(): boolean {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith('aquaflow_session='));
  } catch {
    return false;
  }
}

/** Shared mutation-guard clock — read by the sync interval, written by recordMutation. */
const lastMutationAt = { current: 0 };

export function useSyncEngine({
  onLoad,
  onSync,
}: {
  onLoad: (data: any) => Promise<void>;
  onSync: (data: any) => void;
}) {
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [dbWaking, setDbWaking] = useState(false);
  const [dbOffline, setDbOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isLoaded, setIsLoaded] = useState(false);
  const offlineRef = useRef(false);
  const hasLocalDataRef = useRef(false);
  /** Tracks whether the last sync attempt returned 401. When true, polling is paused until recovery. */
  const unauthenticatedRef = useRef(false);
  /** Ref to track recovery timeout so it can be cleared on unmount. */
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Prevents concurrent triggerSync / polling overlaps */
  const syncInFlightRef = useRef(false);
  /** Tracks timestamp of the last sync call to throttle focus-triggered syncs */
  const lastSyncAtRef = useRef(0);
  /** Stable refs for callbacks so triggerSync always sees the latest */
  const onSyncRef = useRef(onSync);
  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  const recordMutation = useCallback(() => {
    if (!offlineRef.current) {
      console.log('🔒 Mutation Guard: Locking sync for 15s to prioritize local state.');
    }
    lastMutationAt.current = Date.now();
  }, []);

  /** Reset unauthenticated flag — call this after a successful login to resume polling. */
  const resetAuth = useCallback(() => {
    unauthenticatedRef.current = false;
    setUnauthenticated(false);
  }, []);

  /** Single fetch wrapper: tries /api/sync, sets auth/quota/offline flags, returns data or null. */
  const trySync = useCallback(async (): Promise<any> => {
    try {
      // Don't use silent4xx — we need 401 to throw so the catch block can set unauthenticatedRef
      const data = await fetchAPI('/sync', undefined, false, 1);
      // Success — clear unauthenticated flag if it was set
      if (unauthenticatedRef.current) {
        unauthenticatedRef.current = false;
        setUnauthenticated(false);
      }
      // Success — clear offline flag if it was set
      if (offlineRef.current) {
        console.log('[DB] DB back online — resuming normal sync');
        offlineRef.current = false;
        setDbOffline(false);
      }
      return data;
    } catch (e: any) {
      if (isAuthError(e.message)) {
        unauthenticatedRef.current = true;
        setUnauthenticated(true);
        return null; // Expected on public pages — don't log
      }
      if (isQuotaError(e.message)) {
        if (!offlineRef.current) {
          console.warn('[DB] Quota exceeded — falling back to local data');
          offlineRef.current = true;
          setDbOffline(true);
        }
        return null;
      }
      // Unexpected error — rethrow so callers can handle it
      throw e;
    }
  }, []);

  /**
   * Manual sync trigger — replaces window.location.reload() for the RefreshButton.
   * Fetches fresh data from /api/sync and applies it through onSync, without
   * unmounting the entire React tree.
   */
  const triggerSync = useCallback(async (force: boolean = false) => {
    // Prevent overlapping sync requests
    if (syncInFlightRef.current) return;

    // Cooldown guard to prevent spamming the server: max once every 10 seconds (unless forced)
    if (!force && Date.now() - lastSyncAtRef.current < 10000) {
      return;
    }

    syncInFlightRef.current = true;
    setSyncStatus('syncing');

    try {
      const syncData = await trySync();
      lastSyncAtRef.current = Date.now();

      if (unauthenticatedRef.current) {
        setSyncStatus('idle');
        return;
      }

      if (syncData) {
        onSyncRef.current(syncData);
        setSyncStatus('idle');
      } else {
        // null data but no exception — could be quota/offline
        setSyncStatus(offlineRef.current ? 'error' : 'idle');
      }
    } catch {
      if (!unauthenticatedRef.current) {
        setSyncStatus('error');
      }
    } finally {
      syncInFlightRef.current = false;
    }
  }, [trySync]);

  // --- Initial load ---
  useEffect(() => {
    let isMounted = true;
    const wakeTimeout = setTimeout(() => setDbWaking(true), WAKE_TIMEOUT_MS);

    const loadData = async () => {
      hasLocalDataRef.current = hasFreshStorage();

      // Skip /api/sync entirely on pages where the user is clearly not authenticated.
      // This prevents a guaranteed 401 → `setUnauthenticated(true)` → state churn
      // on the home/login page. The StoreProvider at root layout means this effect
      // runs even on public pages.
      if (!hasSessionCookie()) {
        unauthenticatedRef.current = true;
        setUnauthenticated(true);
        clearTimeout(wakeTimeout);
        if (isMounted) {
          setDbWaking(false);
          setIsLoaded(true);
        }
        return;
      }

      try {
        const syncData = await trySync();
        lastSyncAtRef.current = Date.now();

        if (syncData) {
          await onLoad(syncData);
        } else if (!hasLocalDataRef.current && !unauthenticatedRef.current) {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error('[Sync] Critical failure during loadData:', error);
        if (!unauthenticatedRef.current) {
          setSyncStatus('error');
        }
      } finally {
        clearTimeout(wakeTimeout);
        if (isMounted) {
          setDbWaking(false);
          setIsLoaded(true);
        }
      }
    };

    loadData();

    // --- Polling ---
    const syncInterval = setInterval(async () => {
      // Skip polling if the tab is hidden to save server compute and DB CPU
      if (typeof document !== 'undefined' && document.hidden) return;
      // Skip during mutation guard window
      if (Date.now() - lastMutationAt.current < MUTATION_GUARD_MS) return;
      // Skip polling when unauthenticated — no session cookie, so /api/sync returns 401 every time
      if (unauthenticatedRef.current) return;
      // Skip if a manual sync is already in flight
      if (syncInFlightRef.current) return;
      // Skip polling when DB is offline (quota exceeded, DB waking, etc.) — retry after delay
      if (offlineRef.current) {
        // Schedule a single recovery retry after 30s
        recoveryTimeoutRef.current = setTimeout(async () => {
          if (!offlineRef.current) return; // Already recovered
          console.log('[DB] Attempting DB recovery check...');
          try {
            const data = await trySync();
            if (data && offlineRef.current) {
              console.log('[DB] DB back online — resuming normal sync');
              setDbOffline(false);
              offlineRef.current = false;
            }
          } catch {
            // Still down — keep offline flag, try again on next interval
          }
        }, 30000);
        return;
      }

      syncInFlightRef.current = true;
      setSyncStatus('syncing');
      try {
        const syncData = await trySync();
        lastSyncAtRef.current = Date.now();

        if (unauthenticatedRef.current) {
          // 401 during polling — stop, set idle (not error, this is expected when session expires)
          setSyncStatus('idle');
          return;
        }

        if (syncData) onSyncRef.current(syncData);
        setSyncStatus('idle');
      } catch {
        if (!unauthenticatedRef.current) {
          setSyncStatus('error');
        }
      } finally {
        syncInFlightRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(wakeTimeout);
      clearInterval(syncInterval);
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    };
  }, [onLoad, trySync]);

  // --- Focus & Visibility Revalidation ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Sync] Tab became visible — triggering background sync');
        triggerSync();
      }
    };

    const handleFocus = () => {
      console.log('[Sync] Window focused — triggering background sync');
      triggerSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [triggerSync]);
  // NOTE: Removed `onSync` from deps — we use `onSyncRef` instead to avoid
  // re-creating the polling interval whenever the callback reference changes.

  return {
    isLoaded,
    dbWaking,
    dbOffline,
    syncStatus,
    unauthenticated,
    offlineRef,
    hasLocalDataRef,
    recordMutation,
    resetAuth,
    triggerSync,
  };
}
