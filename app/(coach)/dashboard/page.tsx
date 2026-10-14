"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { WeeklyPlanCard } from "@/components/dashboard/WeeklyPlanCard";
import { SwimmerStatusPanel } from "@/components/dashboard/SwimmerStatusPanel";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { AthletesFeedbackPanel } from "@/components/dashboard/AthletesFeedbackPanel";
import { AnnouncementComposer } from "@/components/dashboard/AnnouncementComposer";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";
import { FolderPlus, MessageSquare, Loader2, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { PanelSkeleton } from "@/components/common/Skeleton";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { isLoaded, announcements, archivedAnnouncements, deleteAnnouncement, starAnnouncement, weeklyPlans, swimmers, attendance } = useStore();
    const [showDbBanner, setShowDbBanner] = useState(true);

    // Auto-dismiss DB banner after 30s
    useEffect(() => {
        const timer = setTimeout(() => setShowDbBanner(false), 30000);
        return () => clearTimeout(timer);
    }, []);

    // Recent plans: within ±2 weeks, sorted newest first
    const visiblePlans = isLoaded
        ? weeklyPlans.filter(plan => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
            const planDate = new Date(plan.weekStart);
            planDate.setHours(0, 0, 0, 0);
            const diffTime = planDate.getTime() - now.getTime();
            return diffTime >= -twoWeeksMs && diffTime <= twoWeeksMs;
        }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
        : [];

    // Simple today stats
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const todayAttendedCount = new Set(todayAttendance.map(a => a.swimmerId)).size;

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
    const dateStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

    return (
        <div className="min-h-screen bg-background">
            {/* Database loading banner */}
            {(!isLoaded && showDbBanner) && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-secondary border border-border flex items-center gap-3" role="status" aria-live="polite">
                    <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                    <div>
                        <p className="text-sm text-foreground font-medium">正在连接云端数据库...</p>
                        <p className="text-xs text-muted-foreground">首次启动可能需要 15–20 秒，请稍候。</p>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <header className="mb-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">{greeting}，教练 👋</h1>
                        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
                    </div>
                    <RefreshButton />
                </div>

                {/* Quick Stats Row */}
                {isLoaded && (
                    <div className="flex gap-4 mt-5 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{swimmers.length} 名队员</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span>今日 {todayAttendedCount} 人已到场</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FolderPlus className="w-4 h-4 text-primary" />
                            <span>{visiblePlans.length} 个近期计划</span>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Quick Action */}
            <div className="md:hidden w-full mb-6">
                <Link
                    href="/dashboard/weekly-plan"
                    className="flex items-center justify-center gap-2.5 w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors hover:opacity-90"
                >
                    <FolderPlus className="w-5 h-5" />
                    布置本周训练计划
                </Link>
            </div>

            {/* Main Two-Column Layout */}
            <div id="main-content" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── LEFT COLUMN: Actions + Plans ── */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <section>
                        <h2 className="heading-section mb-3">快捷操作</h2>
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/weekly-plan"
                                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FolderPlus className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">布置周训练计划</p>
                                        <p className="text-xs text-muted-foreground">创建或编辑本周训练课表</p>
                                    </div>
                                </div>
                                <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">前往 →</span>
                            </Link>
                            <Link
                                href="/dashboard/feedbacks"
                                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <MessageSquare className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">查看训练反馈</p>
                                        <p className="text-xs text-muted-foreground">队员最新日记与状态</p>
                                    </div>
                                </div>
                                <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">前往 →</span>
                            </Link>
                        </div>
                    </section>

                    {/* Announcement Composer */}
                    <section>
                        <h2 className="heading-section mb-3">发布公告</h2>
                        <AnnouncementComposer />
                    </section>

                    {/* Recent Announcements */}
                    {announcements.length > 0 && (
                        <section>
                            <h2 className="heading-section mb-3">近期公告</h2>
                            <div className="space-y-3">
                                {announcements.slice(0, 3).map((a: any) => (
                                    <AnnouncementCard
                                        key={a.id}
                                        announcement={a}
                                        isCoach
                                        onDelete={deleteAnnouncement}
                                        onStar={starAnnouncement}
                                    />
                                ))}
                                {announcements.length > 3 && (
                                    <p className="text-xs text-muted-foreground text-center py-1">还有 {announcements.length - 3} 条公告</p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Recent Training Plans */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="heading-section">近期训练计划</h2>
                            <Link href="/dashboard/weekly-plan" className="text-xs text-primary font-medium hover:underline">
                                + 新建计划
                            </Link>
                        </div>

                        {!isLoaded ? (
                            <div className="space-y-3">
                                <PanelSkeleton />
                                <PanelSkeleton />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visiblePlans.map((plan) => (
                                    <WeeklyPlanCard key={plan.id} plan={plan} />
                                ))}
                                {visiblePlans.length === 0 && (
                                    <div className="border border-dashed border-border rounded-xl p-8 text-center" role="status">
                                        <FolderPlus className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground mb-3">{t.dashboard.noPlansYet}</p>
                                        <Link
                                            href="/dashboard/weekly-plan"
                                            className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                        >
                                            {t.dashboard.createFirstPlan}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── RIGHT COLUMN: Team Status + Feedback ── */}
                <div className="space-y-8">
                    {/* Swimmer Status */}
                    <section>
                        <h2 className="heading-section mb-3">队伍动态</h2>
                        {isLoaded ? <SwimmerStatusPanel /> : <PanelSkeleton />}
                    </section>

                    {/* Feedback Summary */}
                    <section>
                        <h2 className="heading-section mb-3">最新反馈</h2>
                        {isLoaded ? <AthletesFeedbackPanel /> : <PanelSkeleton />}
                    </section>
                </div>
            </div>
        </div>
    );
}
