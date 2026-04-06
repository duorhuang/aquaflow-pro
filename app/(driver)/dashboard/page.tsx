"use client";

import { useStore } from "@/lib/store";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { TodayAttendance } from "@/components/dashboard/TodayAttendance";
import { SwimmerStatusPanel } from "@/components/dashboard/SwimmerStatusPanel";
import { TeamStatsPanel } from "@/components/dashboard/TeamStatsPanel";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { RecentPerformances } from "@/components/dashboard/RecentPerformances";
import { AthletesFeedbackPanel } from "@/components/dashboard/AthletesFeedbackPanel";
import { TeamFeedbackSummary } from "@/components/dashboard/TeamFeedbackSummary";
import { Plus, LogOut, MessageSquare, FolderOpen, Send } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { getVisiblePlans, isLoaded } = useStore();
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
                {/* Database Cold Start Warning */}
                {!isLoaded && (
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                            <div>
                                <p className="text-sm font-bold text-indigo-400">正在连接云端数据库...</p>
                                <p className="text-xs text-indigo-300/70">首次启动可能需要 15-20 秒，请稍候。</p>
                            </div>
                        </div>
                    </div>
                )}

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
                <Link href="/dashboard/weekly-plan">
                    <button className="w-full bg-gradient-to-r from-primary to-blue-400 text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <FolderOpen className="w-6 h-6" />
                        <span className="text-lg">新建培训夹 (Weekly Upload)</span>
                    </button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Attendance & Status */}
                <div className="space-y-6">
                    <TodayAttendance />
                    <TeamFeedbackSummary />
                    <TeamStatsPanel />
                    <Link href="/dashboard/feedbacks" className="bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full group-hover:bg-white/20 transition-colors">NEW</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-white mb-1">📥 队员反馈收件箱</h3>
                            <p className="text-xs text-muted-foreground">查看队员每日反思与周总结，写评语</p>
                        </div>
                    </Link>
                </div>

                {/* Middle Column: Plans */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">{t.dashboard.recentPlans}</h2>
                        <Link href="/dashboard/weekly-plan">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]">
                                <FolderOpen className="w-4 h-4" />
                                {t.dashboard.createPlan} (按周)
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
                                <Link href="/dashboard/weekly-plan">
                                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:brightness-110 transition-all">
                                        创建第一个周计划
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/weekly-plan">
                            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer group">
                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-purple-400" />
                                    📂 周训练管理
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">上传照片·发布计划</p>
                            </div>
                        </Link>
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
                        <Link href="/dashboard/feedbacks/targeted">
                            <div className="bg-card/30 border border-border rounded-xl p-4 hover:bg-card/50 transition-all cursor-pointer">
                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                    <Send className="w-4 h-4 text-orange-400" />
                                    🎯 训练反馈
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">发起专项问卷·查看回复</p>
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
