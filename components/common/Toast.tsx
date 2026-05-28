"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toast: (type: ToastType, message: string, duration?: number) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toastFn = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(7);
        // Loading toasts persist until dismissed; others auto-dismiss
        const autoDuration = type === 'loading' ? 0 : duration;
        setToasts(prev => [...prev, { id, type, message, duration: autoDuration }]);
        if (autoDuration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, autoDuration);
        }
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const icons: Record<ToastType, ReactNode> = {
        success: <CheckCircle className="w-4 h-4 text-green-400" />,
        error: <AlertCircle className="w-4 h-4 text-red-400" />,
        info: <AlertCircle className="w-4 h-4 text-blue-400" />,
        loading: <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />,
    };

    const bgMap: Record<ToastType, string> = {
        success: "bg-green-950/90 border-green-500/30",
        error: "bg-red-950/90 border-red-500/30",
        info: "bg-blue-950/90 border-blue-500/30",
        loading: "bg-yellow-950/90 border-yellow-500/30",
    };

    return (
        <ToastContext.Provider value={{ toast: toastFn, dismiss }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "pointer-events-auto flex items-start gap-3 p-3 rounded-xl border backdrop-blur-sm shadow-lg",
                        bgMap[t.type]
                    )}>
                        <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
                        <p className="text-sm text-white flex-1">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/50 hover:text-white shrink-0 rounded-lg hover:bg-white/10 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
