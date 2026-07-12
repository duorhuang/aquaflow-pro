"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useSessionExpiryWarning } from "@/hooks/useSessionExpiryWarning";
import { PremiumBackground } from "@/components/common/PremiumBackground";

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
        <>
            <SessionWarning />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[300] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
            >
                Skip to main content
            </a>
            <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
                {/* Premium local water refraction caustics background */}
                <PremiumBackground />
                
                {/* Content Container positioned above backgrounds */}
                <div className="relative z-10 flex min-h-screen w-full">
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
            </div>
        </>
    );
}
