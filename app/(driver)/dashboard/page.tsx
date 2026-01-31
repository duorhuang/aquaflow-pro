"use client";

import { useStore } from "@/lib/store";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { AttendanceStats } from "@/components/dashboard/AttendanceStats";
import { Plus, AlertTriangle, Zap, ThumbsDown, ThumbsUp, UserPlus, Settings } from "lucide-react";
import Link from "next/link";
import { MOCK_SWIMMERS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Swimmer } from "@/types";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";
import { SwimmerModal } from "@/components/dashboard/SwimmerModal";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { plans, swimmers, adjustXP, getVisiblePlans } = useStore();
    const [selectedSwimmerId, setSelectedSwimmerId] = useState<string | null>(null);

    // Get visible plans (active < 14 days OR starred) and sort
    const visiblePlans = getVisiblePlans().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Show all swimmers in Radar for XP management
    const allSwimmers = [...swimmers];

    const handleXP = (amount: number) => {
        if (!selectedSwimmerId) return;
        adjustXP(selectedSwimmerId, amount);
        // Optional: Show toast
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            {/* ... */}

            {/* ... Timeline ... */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Col: Plans */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">{t.dashboard.recentPlans}</h2>
                        <Link href="/dashboard/new-plan">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]">
                                <Plus className="w-4 h-4" />
                                {t.dashboard.createPlan}
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visiblePlans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                </div>

                {/* Right Col: Team Radar & XP */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">{t.dashboard.teamRadar}</h2>

                    <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Manage Team XP</h3>
                        <div className="space-y-3">
                            {allSwimmers.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedSwimmerId(selectedSwimmerId === s.id ? null : s.id)}
                                    className={cn(
                                        "p-3 rounded-lg border transition-all cursor-pointer",
                                        selectedSwimmerId === s.id
                                            ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(100,255,218,0.2)]"
                                            : "bg-secondary/20 border-white/5 hover:bg-secondary/40"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                s.readiness < 90 ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                                            )}>
                                                {s.level || 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{s.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{s.xp || 0} XP • {s.status}</p>
                                            </div>
                                        </div>
                                        {s.readiness < 90 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    </div>

                                    {/* XP Actions (Visible if selected) */}
                                    {selectedSwimmerId === s.id && (
                                        <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleXP(5); }}
                                                className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                                            >
                                                <ThumbsUp className="w-3 h-3" /> +5
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleXP(20); }}
                                                className="flex-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                                            >
                                                <Zap className="w-3 h-3" /> +20
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleXP(-10); }}
                                                className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                                            >
                                                <ThumbsDown className="w-3 h-3" /> -10
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Stats */}
                    <AttendanceStats />
                </div>
            </div>
        </div>
    );
}
