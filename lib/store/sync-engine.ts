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

export function isQuotaError(msg: string): boolean {
  return (
    msg?.includes('data transfer quota') ||
    msg?.includes('HTTP status 402') ||
    msg?.includes('QUOTA-EXHAUSTED') ||
    msg?.includes('Database Quota Exceeded') ||
    msg?.includes('exceeded maximum request size') ||
    msg?.includes('503 Service Unavailable')
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

  const recordMutation = useCallback(() => {
    if (!offlineRef.current) {
      console.log('🔒 Mutation Guard: Locking sync for 15s to prioritize local state.');
    }
    lastMutationAt.current = Date.now();
  }, []);

  // --- Initial load ---
  useEffect(() => {
    let isMounted = true;
    const wakeTimeout = setTimeout(() => setDbWaking(true), WAKE_TIMEOUT_MS);

    const loadData = async () => {
      hasLocalDataRef.current = hasFreshStorage();

      try {
        let syncData: any = null;
        try {
          syncData = await fetchAPI('/sync');
        } catch (e: any) {
          if (isQuotaError(e.message)) {
            if (!offlineRef.current) {
              console.warn('[DB] Quota exceeded — falling back to local data');
              offlineRef.current = true;
              setDbOffline(true);
            }
          }
        }

        if (syncData) {
          await onLoad(syncData);
          // Coming back online after offline
          if (offlineRef.current && dbOffline) {
            console.log('[DB] DB back online — resuming normal sync');
            setDbOffline(false);
            offlineRef.current = false;
          }
        } else if (!hasLocalDataRef.current) {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error('Critical failure during loadData:', error);
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

      setSyncStatus('syncing');
      try {
        let syncData: any = null;
        try {
          syncData = await fetchAPI('/sync', undefined, true, 1);
        } catch (e: any) {
          if (isQuotaError(e.message)) {
            if (!offlineRef.current) {
              console.warn('[DB] Quota exceeded — falling back to local data');
              offlineRef.current = true;
              setDbOffline(true);
            }
            setSyncStatus('idle');
            return;
          }
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
        setSyncStatus('error');
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(wakeTimeout);
      clearInterval(syncInterval);
    };
  }, [onLoad, onSync]);

  return {
    isLoaded,
    dbWaking,
    dbOffline,
    syncStatus,
    offlineRef,
    hasLocalDataRef,
    recordMutation,
  };
}
