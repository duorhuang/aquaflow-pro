"use client";

import { useEffect, useRef } from "react";

/**
 * Warns the user before navigating away if there are unsaved changes.
 * Usage: const { setDirty } = useUnsavedChanges();
 * Call setDirty(true) when form is modified, setDirty(false) after save.
 */
export function useUnsavedChanges(message = "You have unsaved changes. Are you sure you want to leave?") {
    const dirtyRef = useRef(false);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (dirtyRef.current) {
                e.preventDefault();
                e.returnValue = message;
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [message]);

    const setDirty = (dirty: boolean) => {
        dirtyRef.current = dirty;
    };

    return { setDirty };
}
