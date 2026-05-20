"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function CoachGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

    useEffect(() => {
        // Allow 15s for cold-start DB connections (Neon serverless)
        const timer = setTimeout(() => {
            if (status === "loading") {
                router.push("/login?role=coach");
            }
        }, 15000);

        api.auth.me()
            .then((user: any) => {
                clearTimeout(timer);
                if (user?.role === "coach") {
                    setStatus("authorized");
                } else {
                    router.push("/login?role=coach");
                }
            })
            .catch(() => {
                clearTimeout(timer);
                router.push("/login?role=coach");
            });

        return () => clearTimeout(timer);
    }, [router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">验证身份中...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthorized") {
        return null;
    }

    return <>{children}</>;
}
