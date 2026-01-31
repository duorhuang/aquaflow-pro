"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Waves } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const SIDEBAR_ITEMS = [
    { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "athlete", href: "/dashboard/athletes", icon: Users },
    { label: "schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <div className="w-64 h-screen border-r border-border bg-card/30 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-40">
            {/* Brand */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Waves className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight text-white">AquaFlow</h1>
                    <p className="text-xs text-primary font-mono tracking-widest">PRO V12</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const label = item.label === 'dashboard' ? t.common.dashboard :
                        item.label === 'athlete' ? t.common.athlete :
                            item.label === 'settings' ? t.common.settings :
                                "Schedule";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(100,255,218,0.1)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                            )}
                            <item.icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "opacity-70 group-hover:opacity-100")} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between px-2">
                    <LanguageToggle />
                </div>
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors opacity-70 hover:opacity-100">
                    <LogOut className="w-5 h-5" />
                    <span>{t.common.logout}</span>
                </button>
            </div>
        </div>
    );
}
