"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CoachGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem("aquaflow_coach_session");
        if (session === "active") {
            setIsAuthorized(true);
        } else {
            router.push("/login?role=coach");
        }
    }, [router]);

    if (!isAuthorized) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}
