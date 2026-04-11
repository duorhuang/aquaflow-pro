"use client";

import { RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RefreshButton() {
    const { syncStatus } = useStore();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <button
            onClick={handleRefresh}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                syncStatus === 'idle' && "bg-card/50 border-border hover:bg-card hover:border-primary/50",
                syncStatus === 'syncing' && "bg-primary/10 border-primary animate-pulse",
                syncStatus === 'error' && "bg-red-500/10 border-red-500/50 text-red-500"
            )}
        >
            {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            ) : syncStatus === 'error' ? (
                <AlertTriangle className="w-4 h-4" />
            ) : (
                <Check className="w-4 h-4 text-primary" />
            )}
            
            <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                    {syncStatus === 'syncing' ? "正在同步..." : 
                     syncStatus === 'error' ? "同步异常" : "云端在线"}
                </span>
                <span className="text-[9px] text-muted-foreground">
                    {syncStatus === 'error' ? "请重试或检查数据库状态" : "每 30s 自动同步数据"}
                </span>
            </div>
        </button>
    );
}
