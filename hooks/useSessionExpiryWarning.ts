"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/common/Toast";

const WARNING_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours before expiry
const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

/**
 * Warns the user when their session is about to expire (within 24 hours).
 * Shows a toast notification prompting them to re-login before losing work.
 */
export function useSessionExpiryWarning() {
    const { toast } = useToast();
    const hasWarnedRef = useRef(false);

    const checkSession = useCallback(() => {
        try {
            const cookies = document.cookie.split(';');
            const sessionCookie = cookies.find(c => c.trim().startsWith('aquaflow_session='));
            if (!sessionCookie) return;

            const token = sessionCookie.split('=')[1];
            if (!token) return;

            const parts = token.split('.');
            if (parts.length < 2) return;

            const payload = JSON.parse(atob(parts[0]));
            if (!payload.exp) return;

            const expiresAt = payload.exp * 1000;
            const timeRemaining = expiresAt - Date.now();

            if (timeRemaining <= 0) {
                // Already expired
                toast('info', 'Session expired. Please log in again.', 8000);
                return;
            }

            if (timeRemaining <= WARNING_THRESHOLD && !hasWarnedRef.current) {
                const hoursLeft = Math.round(timeRemaining / (60 * 60 * 1000));
                toast('info', `Your session expires in ~${hoursLeft}h. Save your work and re-login soon.`, 10000);
                hasWarnedRef.current = true;
            }
        } catch {
            // Ignore parse errors
        }
    }, [toast]);

    useEffect(() => {
        checkSession();
        const interval = setInterval(checkSession, CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [checkSession]);
}
