"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { CoachGuard } from "@/components/auth/CoachGuard";
import { MobileNav } from "@/components/layout/MobileNav";
import { useSessionExpiryWarning } from "@/hooks/useSessionExpiryWarning";

function SessionWarning() {
    useSessionExpiryWarning();
    return null;
}

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CoachGuard>
            <SessionWarning />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[300] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
            >
                Skip to main content
            </a>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
                <div className="hidden md:block">
                    <Sidebar />
                </div>
                <div className="md:hidden">
                    <MobileNav />
                </div>
                <main id="main-content" className="md:pl-64 min-h-screen pt-16 md:pt-0">
                    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-150">
                        {children}
                    </div>
                </main>
            </div>
        </CoachGuard>
    );
}
