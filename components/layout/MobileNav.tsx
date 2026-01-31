"use client";

import { useState, useEffect } from "react";
import { Menu, X, Waves, LayoutDashboard, Users, Calendar, Settings, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Quick Plan", href: "/dashboard/quick-plan", icon: PlusCircle }, // New Feature
    { label: "Athletes", href: "/dashboard/athletes", icon: Users },
    { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-[#0a192f]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Waves className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">AquaFlow</span>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white/80 hover:text-white transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Full Screen Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-[#0a192f] pt-24 px-6 animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col">
                    <nav className="flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("w-6 h-6", isActive && "text-primary")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto mb-8 border-t border-white/10 pt-6">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="flex items-center gap-4 px-4 py-4 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-6 h-6" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
