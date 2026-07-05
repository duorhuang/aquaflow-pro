"use client";

import { Sidebar } from "@/components/layout/Sidebar";

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
        <>
            <SessionWarning />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[300] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
            >
                Skip to main content
            </a>
            <div className="min-h-screen bg-rose-50 text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
                {/* Premium Sunset Nature Background for Coach Area */}
                <div 
                    className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=2080&auto=format&fit=crop')" }}
                />
                
                {/* Ambient Sunset Overlays */}
                <div className="fixed inset-0 bg-gradient-to-br from-orange-900/60 via-red-900/50 to-rose-900/70 z-0 backdrop-blur-[4px]" />
                <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-black/50 to-transparent z-0 pointer-events-none" />
                
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
