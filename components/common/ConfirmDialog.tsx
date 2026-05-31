"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "确认",
    cancelLabel = "取消",
    variant = "default",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div
                className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"
                        )}>
                            <AlertTriangle className={cn(
                                "w-5 h-5",
                                variant === "danger" ? "text-red-400" : "text-yellow-400"
                            )} />
                        </div>
                        <h2 id="confirm-dialog-title" className="text-lg font-bold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-white rounded-lg"
                        aria-label="关闭对话框"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{description}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-medium bg-secondary/50 border border-white/10 text-white hover:bg-white/10 transition-colors min-h-[44px]"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-white transition-colors min-h-[44px]",
                            variant === "danger"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Simple hook to manage confirm dialog state
 */
export function useConfirm() {
    const [config, setConfig] = useState<ConfirmDialogProps | null>(null);

    const confirm = useCallback((
        title: string,
        description: string,
        options?: { confirmLabel?: string; cancelLabel?: string; variant?: "danger" | "default" }
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfig({
                open: true,
                title,
                description,
                confirmLabel: options?.confirmLabel || "Confirm",
                cancelLabel: options?.cancelLabel || "Cancel",
                variant: options?.variant || "default",
                onConfirm: () => {
                    setConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfig(null);
                    resolve(false);
                },
            });
        });
    }, []);

    const dialog = config ? <ConfirmDialog {...config} /> : null;

    return { confirm, dialog };
}
