"use client";

import { RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useStoreSelector } from "@/lib/store";
import { cn } from "@/lib/utils";
import { memo } from "react";

export const RefreshButton = memo(function RefreshButton() {
    const syncStatus = useStoreSelector(s => s.syncStatus);
    const triggerSync = useStoreSelector(s => s.triggerSync);

    const handleRefresh = () => {
        triggerSync(true);
    };

    return (
        <button
            onClick={handleRefresh}
            className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-left transition-colors",
                syncStatus === 'idle' && "bg-card border-border hover:bg-secondary",
                syncStatus === 'syncing' && "bg-primary/10 border-primary/30",
                syncStatus === 'error' && "bg-destructive/10 border-destructive/30 text-destructive"
            )}
        >
            {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : syncStatus === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
            
            <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-foreground">
                    {syncStatus === 'syncing' ? "正在同步..." : 
                     syncStatus === 'error' ? "同步异常" : "云端在线"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {syncStatus === 'error' ? "请重试或检查状态" : "自动定时同步"}
                </span>
            </div>
        </button>
    );
});