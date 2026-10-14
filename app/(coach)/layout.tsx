"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useSessionExpiryWarning } from "@/hooks/useSessionExpiryWarning";

function SessionWarning() {
    useSessionExpiryWarning();
    return null;
}

export default function CoachLayout({
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
                跳转至主要内容
            </a>
            <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
                <div className="flex min-h-screen w-full">
                    <div className="hidden md:block">
                        <Sidebar />
                    </div>
                    
                    <main id="main-content" className="w-full md:pl-16 lg:pl-56 min-h-screen pb-24 md:pb-8 pt-14 md:pt-0 transition-all duration-200">
                        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
                            {children}
                        </div>
                    </main>

                    {/* Mobile Navigation (Header + Bottom Bar) */}
                    <div className="md:hidden">
                        <MobileNav />
                    </div>
                </div>
            </div>
        </>
    );
}
