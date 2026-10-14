"use client";

import { memo, useState, useEffect } from "react";
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut, 
    UserCheck, 
    MessageSquare, 
    FolderPlus, 
    Trophy,
    MoreHorizontal,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

export const MobileNav = memo(function MobileNav() {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // Auto-close more sheet on route changes
    useEffect(() => {
        setIsMoreOpen(false);
    }, [pathname]);

    const isDashboardActive = pathname === "/dashboard";
    const isPlanActive = pathname?.startsWith("/dashboard/weekly-plan");
    const isAthletesActive = pathname?.startsWith("/dashboard/athletes");
    const isMoreActive = !isDashboardActive && !isPlanActive && !isAthletesActive;

    const SECONDARY_ITEMS = [
        { label: "考勤打卡", href: "/dashboard/attendance", icon: UserCheck },
        { label: "训练反馈", href: "/dashboard/feedbacks", icon: MessageSquare },
        { label: "比赛日程", href: "/dashboard/meets", icon: Trophy },
        { label: "系统设置", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <>
            {/* Top Compact Brand Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">AF</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground tracking-tight">AquaFlow Pro</span>
                </div>
            </header>

            {/* Bottom Persistent Tab Bar */}
            <nav 
                className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-40 pb-[env(safe-area-inset-bottom,0px)]"
                aria-label="移动端底部导航"
            >
                {/* Tab 1: 首页 */}
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors min-h-[48px]",
                        isDashboardActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className={cn("w-5 h-5", isDashboardActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                    <span className="text-[10px] mt-0.5 font-medium">工作台</span>
                </Link>

                {/* Tab 2: 周计划 */}
                <Link
                    href="/dashboard/weekly-plan"
                    className={cn(
                        "flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors min-h-[48px]",
                        isPlanActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <FolderPlus className={cn("w-5 h-5", isPlanActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                    <span className="text-[10px] mt-0.5 font-medium">周计划</span>
                </Link>

                {/* Tab 3: 队员名册 */}
                <Link
                    href="/dashboard/athletes"
                    className={cn(
                        "flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors min-h-[48px]",
                        isAthletesActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Users className={cn("w-5 h-5", isAthletesActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                    <span className="text-[10px] mt-0.5 font-medium">队员</span>
                </Link>

                {/* Tab 4: 更多 */}
                <button
                    type="button"
                    onClick={() => setIsMoreOpen(true)}
                    className={cn(
                        "flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors min-h-[48px]",
                        isMoreActive || isMoreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <MoreHorizontal className={cn("w-5 h-5", isMoreActive || isMoreOpen ? "stroke-[2.5]" : "stroke-[1.75]")} />
                    <span className="text-[10px] mt-0.5 font-medium">更多</span>
                </button>
            </nav>

            {/* Slide-Up Bottom Sheet for "更多" */}
            <AnimatePresence>
                {isMoreOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMoreOpen(false)}
                            className="fixed inset-0 bg-black/30 z-50"
                        />

                        {/* Sheet Content */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl z-50 pb-8 shadow-lg"
                        >
                            <div className="w-8 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
                            
                            <div className="flex items-center justify-between px-5 pb-3 border-b border-border">
                                <h3 className="font-semibold text-sm text-foreground">更多工具</h3>
                                <button
                                    onClick={() => setIsMoreOpen(false)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Secondary items list */}
                            <div className="px-4 py-3 space-y-1">
                                {SECONDARY_ITEMS.map((item) => {
                                    const isActive = pathname?.startsWith(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-foreground hover:bg-secondary"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                            <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Logout */}
                            <div className="px-4 pt-2 border-t border-border mt-1">
                                <button
                                    onClick={async () => {
                                        if (!window.confirm('确认要退出教练登录吗？')) return;
                                        try { await api.auth.logout(); } catch {}
                                        window.location.href = '/login?role=coach';
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">退出教练账号</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});