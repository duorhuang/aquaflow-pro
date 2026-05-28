"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { WeeklyPlanCard } from "@/components/dashboard/WeeklyPlanCard";
import { TodayAttendance } from "@/components/dashboard/TodayAttendance";
import { SwimmerStatusPanel } from "@/components/dashboard/SwimmerStatusPanel";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { RecentPerformances } from "@/components/dashboard/RecentPerformances";
import { AthletesFeedbackPanel } from "@/components/dashboard/AthletesFeedbackPanel";
import { TeamFeedbackSummary } from "@/components/dashboard/TeamFeedbackSummary";
import { TeamStatsPanel } from "@/components/dashboard/TeamStatsPanel";
import { AnnouncementComposer } from "@/components/dashboard/AnnouncementComposer";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";
import { LogOut, MessageSquare, FolderPlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { PanelSkeleton } from "@/components/common/Skeleton";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { isLoaded, announcements, archivedAnnouncements, deleteAnnouncement, starAnnouncement, weeklyPlans } = useStore();
    const router = useRouter();
    const [showArchive, setShowArchive] = useState(false);
    const [archiveLimit, setArchiveLimit] = useState(5);
    const [showMore, setShowMore] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showDbBanner, setShowDbBanner] = useState(true);

    // Auto-dismiss DB banner after 30s even if isLoaded is still false
    useEffect(() => {
        const timer = setTimeout(() => setShowDbBanner(false), 30000);
        return () => clearTimeout(timer);
    }, []);

    // Use store data instead of duplicate fetch — the store already fetches weeklyPlans on mount
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

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try { await api.auth.logout(); } catch {}
        router.push('/login?role=coach');
    };

    return (
        <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-6">
            {/* Header */}
            <header className="mb-8">
                {/* Database Cold Start Warning */}
                {(!isLoaded && showDbBanner) && (
                    <div className="mb-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between" role="status" aria-live="polite">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            <div>
                                <p className="text-sm text-indigo-400 font-medium">正在连接云端数据库...</p>
                                <p className="text-xs text-indigo-300/60">首次启动可能需要 15-20 秒，请稍候。</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white mb-1">
                            AquaFlow Pro
                        </h1>
                        <p className="text-sm text-muted-foreground">{t.common.dashboard}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RefreshButton />
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2.5 rounded-full bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
                            title={t.common.logout}
                            aria-label={t.common.logout}
                        >
                            {isLoggingOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Quick Action */}
            <div className="md:hidden w-full mb-6">
                <Link href="/dashboard/weekly-plan" className="block w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl shadow-md flex items-center justify-center gap-3">
                    <FolderPlus className="w-6 h-6" />
                    {t.common.weeklyPlan}
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Left Column: Today's Operations */}
                <div className="space-y-6">
                    <TodayAttendance />
                    <AnnouncementComposer />

                    {/* Coach Announcements Feed */}
                    {announcements.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                    {t.dashboard.coachFeed}
                                </h3>
                            </div>
                            {announcements.map((a: any) => (
                                <AnnouncementCard
                                    key={a.id}
                                    announcement={a}
                                    isCoach
                                    onDelete={deleteAnnouncement}
                                    onStar={starAnnouncement}
                                />
                            ))}
                        </div>
                    )}

                    {/* Archived Announcements */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t.dashboard.archivedFeed}
                            </h3>
                            {archivedAnnouncements.length > 0 && (
                                <button
                                    onClick={() => setShowArchive(!showArchive)}
                                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                                >
                                    {showArchive ? (
                                        <>{t.dashboard.collapse} <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>{t.dashboard.viewAll} ({archivedAnnouncements.length}) <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                        {archivedAnnouncements.length === 0 && (
                            <p className="text-xs text-muted-foreground/50 italic">{t.dashboard.archiveHint}</p>
                        )}
                        {showArchive && archivedAnnouncements.slice(0, archiveLimit).map((a: any) => (
                            <div key={a.id} className="opacity-60">
                                <AnnouncementCard
                                    announcement={a}
                                    isCoach
                                    onDelete={deleteAnnouncement}
                                    onStar={starAnnouncement}
                                />
                            </div>
                        ))}
                        {showArchive && archivedAnnouncements.length > archiveLimit && (
                            <button
                                onClick={() => setArchiveLimit(prev => prev + 10)}
                                className="w-full text-center text-xs text-muted-foreground hover:text-white py-2"
                            >
                                {t.dashboard.loadMore} ({archivedAnnouncements.length - archiveLimit} 条)
                            </button>
                        )}
                    </div>
                </div>

                {/* Middle Column: Training Plans */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-md font-semibold text-white">{t.dashboard.recentPlans}</h2>
                        <Link href="/dashboard/weekly-plan" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-md min-h-[44px]">
                            <FolderPlus className="w-4 h-4" aria-hidden="true" />
                            {t.dashboard.createPlan}
                        </Link>
                    </div>

                    {!isLoaded ? (
                        <div className="space-y-4">
                            <PanelSkeleton />
                            <PanelSkeleton />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visiblePlans.map((plan) => (
                                <WeeklyPlanCard key={plan.id} plan={plan} />
                            ))}

                            {visiblePlans.length === 0 && (
                                <div className="bg-card/30 border border-border rounded-2xl p-8 text-center" role="status">
                                    <p className="text-muted-foreground mb-4">{t.dashboard.noPlansYet}</p>
                                    <Link href="/dashboard/weekly-plan" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:brightness-110 transition-all min-h-[44px]">
                                        {t.dashboard.createFirstPlan}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Swimmer Status */}
                <div className="space-y-6">
                    {isLoaded ? <SwimmerStatusPanel /> : <PanelSkeleton />}
                    {isLoaded ? <AthletesFeedbackPanel /> : <PanelSkeleton />}

                    {/* Collapsible "More" section */}
                    <div>
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-muted-foreground uppercase tracking-wider hover:bg-white/5 transition-colors"
                        >
                            <span>{showMore ? t.dashboard.hideMore : t.dashboard.showMore}</span>
                            {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showMore && (
                            <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <RecentPerformances />
                                <TeamFeedbackSummary />
                                <TeamStatsPanel />
                                <OnboardingChecklist />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
