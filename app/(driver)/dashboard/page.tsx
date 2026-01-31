"use client";

import { useStore } from "@/lib/store";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { TodayAttendance } from "@/components/dashboard/TodayAttendance";
import { SwimmerStatusPanel } from "@/components/dashboard/SwimmerStatusPanel";
import { TeamStatsPanel } from "@/components/dashboard/TeamStatsPanel";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { RecentPerformances } from "@/components/dashboard/RecentPerformances";
import { AthletesFeedbackPanel } from "@/components/dashboard/AthletesFeedbackPanel";
import { Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { getVisiblePlans } = useStore();
    const router = useRouter();

    // Get visible plans (active < 14 days OR starred) and sort
    const visiblePlans = getVisiblePlans().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleLogout = () => {
        localStorage.removeItem("aquaflow_coach_session");
        router.push('/login?role=coach');
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            AquaFlow Pro
                        </h1>
                        <p className="text-sm text-muted-foreground">教练仪表板</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RefreshButton />
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">登出</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Quick Actions */}
            <div className="md:hidden w-full mb-6">
                <Link href="/dashboard/quick-plan">
                    <button className="w-full bg-gradient-to-r from-primary to-blue-400 text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Plus className="w-6 h-6" />
                        <span className="text-lg">发布今日训练 (Quick Publish)</span>
                    </button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Attendance & Status */}
                <div className="space-y-6">
                    <TodayAttendance />
                    <TeamStatsPanel />
                </div>

                {/* Middle Column: Plans */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">{t.dashboard.recentPlans}</h2>
                        <Link href="/dashboard/new-plan">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]">
                                <Plus className="w-4 h-4" />
                                {t.dashboard.createPlan}
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {visiblePlans.slice(0, 6).map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}

                        {visiblePlans.length === 0 && (
                            <div className="bg-card/30 border border-border rounded-2xl p-8 text-center">
                                <p className="text-muted-foreground mb-4">还没有训练计划</p>
                                <Link href="/dashboard/new-plan">
                                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:brightness-110 transition-all">
                                        创建第一个计划
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/schedule">
                            <div className="bg-card/30 border border-border rounded-xl p-4 hover:bg-card/50 transition-all cursor-pointer">
                                <p className="text-sm font-medium text-white">📅 日历视图</p>
                                <p className="text-xs text-muted-foreground mt-1">查看训练安排</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/athletes">
                            <div className="bg-card/30 border border-border rounded-xl p-4 hover:bg-card/50 transition-all cursor-pointer">
                                <p className="text-sm font-medium text-white">👥 队员管理</p>
                                <p className="text-xs text-muted-foreground mt-1">编辑队员信息</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Swimmer Status */}
                <div className="space-y-6">
                    <SwimmerStatusPanel />
                    <AthletesFeedbackPanel />
                    <RecentPerformances />
                </div>
            </div>
        </div>
    );
}
