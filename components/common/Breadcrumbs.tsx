"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// Map paths to breadcrumb labels (dictionary keys)
const BREADCRUMB_MAP: Record<string, string> = {
    dashboard: "common.dashboard",
    weekly: "common.weeklyPlan",
    "weekly-plan": "common.weeklyPlan",
    "quick-plan": "common.quickPlan",
    athletes: "common.athletes",
    attendance: "common.attendance",
    schedule: "common.schedule",
    feedbacks: "common.feedbackInbox",
    targeted: "common.targetedFeedback",
    meets: "common.meets",
    "injury-monitor": "common.injuryMonitor",
    archive: "common.feedbackArchive",
    settings: "common.settings",
    plan: "Recent Plans",
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const { t } = useLanguage();

    // Build breadcrumb segments from path
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    // Helper to resolve a label from dictionary
    const resolveLabel = (keyPath: string): string => {
        const [section, key] = keyPath.split('.');
        if (section === 'common' && key && t.common[key as keyof typeof t.common]) {
            return t.common[key as keyof typeof t.common] as string;
        }
        if (key && t.dashboard?.[key as keyof typeof t.dashboard]) {
            return t.dashboard[key as keyof typeof t.dashboard] as string;
        }
        return key;
    };

    // Build breadcrumb items
    const items: { label: string; href: string }[] = [];
    let accumulatedPath = '';

    for (const segment of segments) {
        accumulatedPath += `/${segment}`;
        const dictKey = BREADCRUMB_MAP[segment];
        if (dictKey) {
            items.push({ label: resolveLabel(dictKey), href: accumulatedPath });
        }
    }

    // Skip breadcrumb if only one segment (dashboard)
    if (items.length <= 1) return null;

    return (
        <nav aria-label="面包屑导航" className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">
                {t.common.dashboard}
            </Link>
            {items.slice(1).map((item, i) => (
                <span key={item.href} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    {i === items.length - 2 ? (
                        <span className="text-white font-medium">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-white transition-colors">
                            {item.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
