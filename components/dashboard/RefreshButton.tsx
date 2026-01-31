"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function RefreshButton() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const handleRefresh = () => {
        setIsRefreshing(true);

        // Reload the page to get fresh data from localStorage
        window.location.reload();
    };

    const getTimeAgo = () => {
        const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);

        if (seconds < 60) return `${seconds}秒前`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
        return `${Math.floor(seconds / 3600)}小时前`;
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                "bg-card/50 border-border hover:bg-card hover:border-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
        >
            <RefreshCw className={cn(
                "w-4 h-4",
                isRefreshing && "animate-spin"
            )} />
            <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-white">刷新数据</span>
                <span className="text-[10px] text-muted-foreground">
                    {getTimeAgo()}
                </span>
            </div>
        </button>
    );
}
