"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    Activity,
    Waves
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Athletes", href: "/dashboard/athletes", icon: Users },
    { label: "Schedule", href: "/dashboard/schedule", icon: Calendar },
    { label: "Poolside Mode", href: "/poolside", icon: Activity, special: true },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 flex flex-col border-r border-border bg-card/50 backdrop-blur-xl fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <Waves className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">AquaFlow</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground font-medium shadow-[0_0_20px_rgba(100,255,218,0.3)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Team Status</p>
                    <div className="flex justify-between items-center text-sm">
                        <span>Online</span>
                        <span className="text-primary font-mono">12/15</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
