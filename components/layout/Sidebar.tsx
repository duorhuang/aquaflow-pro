"use client";

import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut, 
    UserCheck, 
    MessageSquare, 
    FolderPlus, 
    Trophy,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { api } from "@/lib/api-client";

interface SidebarItem {
    label: string;
    href: string;
    icon: any;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: "工作台首页", href: "/dashboard", icon: LayoutDashboard },
    { label: "周训练计划", href: "/dashboard/weekly-plan", icon: FolderPlus },
    { label: "队员名册", href: "/dashboard/athletes", icon: Users },
    { label: "考勤打卡", href: "/dashboard/attendance", icon: UserCheck },
    { label: "训练反馈", href: "/dashboard/feedbacks", icon: MessageSquare },
    { label: "比赛日程", href: "/dashboard/meets", icon: Trophy },
    { label: "系统设置", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = memo(function Sidebar() {
    const pathname = usePathname();

    const isActive = (item: SidebarItem) => {
        if (item.href === "/dashboard") return pathname === "/dashboard";
        return pathname?.startsWith(item.href);
    };

    return (
        <aside className="w-16 lg:w-56 h-screen border-r border-border bg-card flex flex-col fixed left-0 top-0 z-40 pointer-events-auto">
            {/* Brand Header */}
            <div className="h-14 px-3 lg:px-5 flex items-center gap-3 border-b border-border flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-xs">AF</span>
                </div>
                <div className="hidden lg:block min-w-0">
                    <span className="font-semibold text-sm text-foreground tracking-tight truncate block">AquaFlow Pro</span>
                    <span className="text-[10px] text-muted-foreground">教练管理后台</span>
                </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-2 lg:px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar" aria-label="教练主导航">
                {SIDEBAR_ITEMS.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center lg:justify-start gap-3 px-2.5 lg:px-3 py-2.5 rounded-lg transition-colors relative group min-h-[40px]",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            {active && (
                                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" aria-hidden="true" />
                            )}
                            <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-primary" : "")} aria-hidden="true" />
                            <span className={cn("hidden lg:block text-sm", active ? "font-semibold" : "font-normal")}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer: Logout */}
            <div className="px-2 lg:px-3 py-3 border-t border-border">
                <button
                    onClick={async () => {
                        if (!window.confirm('确认要退出教练登录吗？')) return;
                        try { await api.auth.logout(); } catch {}
                        window.location.href = '/login?role=coach';
                    }}
                    className="flex items-center justify-center lg:justify-start gap-3 px-2.5 lg:px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors min-h-[40px]"
                    aria-label="退出登录"
                >
                    <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
                    <span className="hidden lg:block text-sm">退出登录</span>
                </button>
            </div>
        </aside>
    );
});