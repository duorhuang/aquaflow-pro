"use client";

import { useState, useEffect } from "react";
import { Menu, X, Waves, LayoutDashboard, Users, Calendar, Settings, LogOut, PlusCircle, UserCheck, FolderOpen, MessageSquare, Send, Trophy, Activity, FolderPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useLanguage } from "@/lib/i18n";

const NAV_ITEMS = [
    { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "weeklyPlan", href: "/dashboard/weekly-plan", icon: FolderPlus },
    { label: "quickPlan", href: "/dashboard/quick-plan", icon: PlusCircle },
    { label: "athletes", href: "/dashboard/athletes", icon: Users },
    { label: "attendance", href: "/dashboard/attendance", icon: UserCheck },
    { label: "schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "feedbackInbox", href: "/dashboard/feedbacks", icon: MessageSquare },
    { label: "targetedFeedback", href: "/dashboard/feedbacks/targeted", icon: Send },
    { label: "meets", href: "/dashboard/meets", icon: Trophy },
    { label: "injuryMonitor", href: "/dashboard/injury-monitor", icon: Activity },
    { label: "feedbackArchive", href: "/dashboard/archive", icon: FolderOpen },
    { label: "settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useLanguage();

    // Close menu on route change and scroll to top
    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                setIsOpen(false);
                window.scrollTo(0, 0);
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [pathname]);

    return (
        <>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Waves className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">AquaFlow</span>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white/80 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Full Screen Menu Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background pt-24 px-6 animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-label="导航菜单"
                >
                    <nav className="flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const label = t.common[item.label as keyof typeof t.common] ?? item.label;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all min-h-[44px]",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <item.icon className={cn("w-6 h-6", isActive && "text-primary")} aria-hidden="true" />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto mb-8 border-t border-white/10 pt-6">
                        <button
                            onClick={async () => {
                                if (!window.confirm('确认要退出登录吗？')) return;
                                try { await api.auth.logout(); } catch {}
                                window.location.href = '/login?role=coach';
                            }}
                            className="flex items-center gap-4 px-4 py-4 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors min-h-[44px]"
                            aria-label="退出登录"
                        >
                            <LogOut className="w-6 h-6" />
                            {t.common.logout}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
