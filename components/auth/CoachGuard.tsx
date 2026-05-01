"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function CoachGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        api.auth.me()
            .then((user: any) => {
                if (user.role === 'coach') {
                    setIsAuthorized(true);
                } else {
                    router.push("/login?role=coach");
                }
            })
            .catch(() => {
                router.push("/login?role=coach");
            });
    }, [router]);

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
