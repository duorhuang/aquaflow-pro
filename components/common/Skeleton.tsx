"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-white/5",
                className
            )}
        />
    );
}

export function PanelSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("bg-card/30 border border-border/50 rounded-2xl p-6 space-y-4", className)}>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}
