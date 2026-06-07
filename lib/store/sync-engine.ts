/**
 * SyncEngine — polling, mutation guard, quota detection, and initial API load.
 * Extracted from the monolithic store to isolate sync concerns.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { fetchAPI } from '../api-client';

const MUTATION_GUARD_MS = 15000;
const POLL_INTERVAL_MS = 60000;
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

/** Shared mutation-guard clock — read by the sync interval, written by recordMutation. */
const lastMutationAt = { current: 0 };

export function useSyncEngine({
  onLoad,
  onSync,
}: {
  onLoad: (data: any) => Promise<void>;
  onSync: (data: any) => void;
}) {
  const [dbWaking, setDbWaking] = useState(false);
  const [dbOffline, setDbOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isLoaded, setIsLoaded] = useState(false);
  const offlineRef = useRef(false);
  const hasLocalDataRef = useRef(false);
  /** Tracks whether the last sync attempt returned 401. When true, polling is paused until recovery. */
  const unauthenticatedRef = useRef(false);

  const recordMutation = useCallback(() => {
    if (!offlineRef.current) {
      console.log('🔒 Mutation Guard: Locking sync for 15s to prioritize local state.');
    }
    lastMutationAt.current = Date.now();
  }, []);

  /** Reset unauthenticated flag — call this after a successful login to resume polling. */
  const resetAuth = useCallback(() => {
    unauthenticatedRef.current = false;
  }, []);

  /** Single fetch wrapper: tries /api/sync, sets auth/quota/offline flags, returns data or null. */
  const trySync = useCallback(async (): Promise<any> => {
    try {
      // Don't use silent4xx — we need 401 to throw so the catch block can set unauthenticatedRef
      const data = await fetchAPI('/sync', undefined, false, 1);
      // Success — clear unauthenticated flag if it was set
      if (unauthenticatedRef.current) {
        unauthenticatedRef.current = false;
      }
      return data;
    } catch (e: any) {
      if (isAuthError(e.message)) {
        unauthenticatedRef.current = true;
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

  // --- Initial load ---
  useEffect(() => {
    let isMounted = true;
    const wakeTimeout = setTimeout(() => setDbWaking(true), WAKE_TIMEOUT_MS);

    const loadData = async () => {
      hasLocalDataRef.current = hasFreshStorage();

      try {
        const syncData = await trySync();

        if (syncData) {
          await onLoad(syncData);
          // Coming back online after offline
          if (offlineRef.current && dbOffline) {
            console.log('[DB] DB back online — resuming normal sync');
            setDbOffline(false);
            offlineRef.current = false;
          }
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
        setDbWaking(false);
        if (isMounted) setIsLoaded(true);
      }
    };

    loadData();

    // --- Polling ---
    const syncInterval = setInterval(async () => {
      // Skip during mutation guard window
      if (Date.now() - lastMutationAt.current < MUTATION_GUARD_MS) return;
      // Skip polling when unauthenticated — no session cookie, so /api/sync returns 401 every time
      if (unauthenticatedRef.current) return;
      // Skip polling when DB is offline (quota exceeded, DB waking, etc.) — retry after delay
      if (offlineRef.current) {
        // Schedule a single recovery retry after 30s
        setTimeout(async () => {
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

      setSyncStatus('syncing');
      try {
        const syncData = await trySync();

        if (unauthenticatedRef.current) {
          // 401 during polling — stop, set idle (not error, this is expected when session expires)
          setSyncStatus('idle');
          return;
        }

        // DB back online — recovery path
        if (syncData && offlineRef.current) {
          console.log('[DB] DB back online — resuming normal sync');
          setDbOffline(false);
          offlineRef.current = false;
        }

        if (syncData) onSync(syncData);
        setSyncStatus('idle');
      } catch {
        if (!unauthenticatedRef.current) {
          setSyncStatus('error');
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(wakeTimeout);
      clearInterval(syncInterval);
    };
  }, [onLoad, onSync, trySync]);

  return {
    isLoaded,
    dbWaking,
    dbOffline,
    syncStatus,
    offlineRef,
    hasLocalDataRef,
    recordMutation,
    resetAuth,
  };
}
