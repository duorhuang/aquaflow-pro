"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Waves, UserCheck, FolderOpen, MessageSquare, FolderPlus, Send, Trophy, Activity, PlusCircle, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { api } from "@/lib/api-client";
import { useState } from "react";

const SIDEBAR_ITEMS = [
    { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "weeklyPlan", href: "/dashboard/weekly-plan", icon: FolderPlus },
    { label: "quickPlan", href: "/dashboard/quick-plan", icon: PlusCircle },
    { label: "athletes", href: "/dashboard/athletes", icon: Users },
    { label: "attendance", href: "/dashboard/attendance", icon: UserCheck },
    { label: "schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "feedback", href: null, icon: MessageSquare, children: [
        { label: "feedbackInbox", href: "/dashboard/feedbacks", icon: MessageSquare },
        { label: "targetedFeedback", href: "/dashboard/feedbacks/targeted", icon: Send },
        { label: "feedbackArchive", href: "/dashboard/archive", icon: FolderOpen },
    ]},
    { label: "meets", href: "/dashboard/meets", icon: Trophy },
    { label: "injuryMonitor", href: "/dashboard/injury-monitor", icon: Activity },
    { label: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    // Auto-expand feedback group when on a feedback page
    const isOnFeedbackPage = pathname?.startsWith('/dashboard/feedbacks') || pathname?.startsWith('/dashboard/archive');

    return (
        <div className="w-64 h-screen border-r border-border bg-card/30 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-40 pointer-events-auto">
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
            <nav className="flex-1 px-4 space-y-1 mt-4" aria-label="主导航">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const isGroupActive = item.children?.some(child => pathname === child.href);
                    const label = item.href
                        ? t.common[item.label as keyof typeof t.common] ?? item.label
                        : t.common[item.label as keyof typeof t.common] ?? item.label;
                    const isExpanded = expandedGroup === item.label || (isGroupActive && isOnFeedbackPage);
                    const Icon = item.icon;

                    if (item.children) {
                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => setExpandedGroup(isExpanded ? null : item.label)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors duration-200 group relative min-h-[44px]",
                                        isGroupActive
                                            ? "bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(100,255,218,0.1)]"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {isGroupActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" aria-hidden="true" />
                                    )}
                                    <Icon className={cn("w-5 h-5", isGroupActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} aria-hidden="true" />
                                    <span className="flex-1 text-left">{label}</span>
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                {isExpanded && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {item.children.map(child => {
                                            const childActive = pathname === child.href;
                                            const childLabel = t.common[child.label as keyof typeof t.common] ?? child.label;
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm min-h-[40px]",
                                                        childActive
                                                            ? "bg-primary/10 text-primary font-medium"
                                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                                    )}
                                                    aria-current={childActive ? 'page' : undefined}
                                                >
                                                    <ChildIcon className="w-4 h-4" aria-hidden="true" />
                                                    <span>{childLabel}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group relative overflow-hidden min-h-[44px]",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(100,255,218,0.1)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" aria-hidden="true" />
                            )}
                            <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} aria-hidden="true" />
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
                <button
                    onClick={async () => {
                        if (!window.confirm('确认要退出登录吗？')) return;
                        try { await api.auth.logout(); } catch {}
                        window.location.href = '/login?role=coach';
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors opacity-70 hover:opacity-100 min-h-[44px]"
                    aria-label="退出登录"
                >
                    <LogOut className="w-5 h-5" />
                    <span>{t.common.logout}</span>
                </button>
            </div>
        </div>
    );
}
