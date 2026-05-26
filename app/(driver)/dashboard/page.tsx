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
import { LogOut, MessageSquare, FolderPlus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { PanelSkeleton } from "@/components/common/Skeleton";

export default function DashboardPage() {
    const { t } = useLanguage();
    const { isLoaded, announcements, archivedAnnouncements, deleteAnnouncement, starAnnouncement } = useStore();
    const router = useRouter();
    const [showArchive, setShowArchive] = useState(false);
    const [archiveLimit, setArchiveLimit] = useState(5);
    const [showMore, setShowMore] = useState(false);

    const [visiblePlans, setVisiblePlans] = useState<any[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const plans = await api.weeklyPlans.getAll();
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

                const filteredPlans = plans.filter(plan => {
                    const planDate = new Date(plan.weekStart);
                    planDate.setHours(0, 0, 0, 0);
                    const diffTime = planDate.getTime() - now.getTime();
                    return diffTime >= -twoWeeksMs && diffTime <= twoWeeksMs;
                });

                setVisiblePlans(filteredPlans.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()));
            } catch (error: any) {
                if (error.message?.includes('timed out')) return;
                console.error("Failed to load weekly plans", error);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleLogout = async () => {
        try { await api.auth.logout(); } catch {}
        router.push('/login?role=coach');
    };

    return (
        <div className="min-h-screen bg-background px-4 md:px-8 lg:px-12 py-6">
            {/* Header */}
            <header className="mb-8">
                {/* Database Cold Start Warning */}
                {!isLoaded && (
                    <div className="mb-6 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <div>
                                <p className="text-sm text-indigo-400">正在连接云端数据库...</p>
                                <p className="text-xs text-indigo-300/60">首次启动可能需要 15-20 秒，请稍候。</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            AquaFlow Pro
                        </h1>
                        <p className="text-sm text-muted-foreground">{t.common.dashboard}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RefreshButton />
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">{t.common.logout}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Quick Action */}
            <div className="md:hidden w-full mb-6">
                <Link href="/dashboard/weekly-plan" className="block w-full bg-gradient-to-r from-primary to-blue-400 text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
                    <FolderPlus className="w-6 h-6" />
                    {t.common.weeklyPlan}
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
                        <h2 className="text-xl font-semibold text-white">{t.dashboard.recentPlans}</h2>
                        <Link href="/dashboard/weekly-plan" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]">
                            <FolderPlus className="w-4 h-4" />
                            {t.dashboard.createPlan}
                        </Link>
                    </div>

                    {plansLoading ? (
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
                                <div className="bg-card/30 border border-border rounded-2xl p-8 text-center">
                                    <p className="text-muted-foreground mb-4">{t.dashboard.noPlansYet}</p>
                                    <Link href="/dashboard/weekly-plan" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:brightness-110 transition-all">
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
