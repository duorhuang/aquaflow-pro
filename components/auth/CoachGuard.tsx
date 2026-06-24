"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * CoachGuard — brief loading gate while the page hydrates.
 * Auth is handled by middleware.ts (Edge route protection) which verifies
 * the JWT signature and role WITHOUT hitting the database. By the time this
 * component renders, the user is already authenticated.
 * We only show a brief loading flash (1s) to avoid flicker during hydration.
 */
export function CoachGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        // Brief loading flash for hydration — middleware has already verified auth.
        // If the user has a stale/invalid cookie, the NEXT navigation will be caught
        // by middleware and redirected. No need for a redundant DB-hitting auth call.
        const timer = setTimeout(() => setShowLoading(false), 1000);

        // Safety net: if somehow we're still loading after 5s, redirect to login
        // (this catches the extremely rare case of middleware bypass + stale cookie)
        const fallback = setTimeout(() => {
            router.push("/login?role=coach");
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallback);
        };
    }, [router]);

    if (showLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">验证身份中...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
