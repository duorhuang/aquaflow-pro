"use client";

import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
import { PerformanceList } from "@/components/athlete/PerformanceTracker";
import { TrainingHistory } from "@/components/athlete/TrainingHistory";
import { BlockFeedbackPanel } from "@/components/athlete/BlockFeedbackPanel";
import { WeeklyFeedbackForm } from "@/components/athlete/WeeklyFeedbackForm";
import { TargetedFeedbackForm } from "@/components/athlete/TargetedFeedbackForm";
import { CoachReplyPanel } from "@/components/athlete/CoachReplyPanel";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";
import { InjuryMap } from "@/components/athlete/InjuryMap";
import { ActivityFeed } from "@/components/athlete/ActivityFeed";
import { MeetCountdown } from "@/components/athlete/MeetCountdown";
import { AvatarRenderer } from "@/components/athlete/AvatarRenderer";
import { BottomTabBar } from "@/components/athlete/BottomTabBar";
import { BackgroundPicker } from "@/components/athlete/BackgroundPicker";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { useBackgroundTheme } from "@/hooks/useBackgroundTheme";
import { api } from "@/lib/api-client";
import { AlertTriangle, LogOut, Waves, MessageSquare, TrendingUp, Activity, FolderOpen, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Palette } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TrainingPlan, Swimmer } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { getLocalDateISOString } from "@/lib/date-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";

function AthleteWorkoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const { plans, swimmers, attendance, updateSwimmer, weeklyPlans, announcements, archivedAnnouncements, getVisibleAnnouncements, isLoaded: storeLoaded, syncStatus } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [authResolved, setAuthResolved] = useState(false);
    const [pendingReminders, setPendingReminders] = useState(0);
    const [showArchive, setShowArchive] = useState(false);
    const [athleteArchiveLimit, setAthleteArchiveLimit] = useState(5);
    const [showBgPicker, setShowBgPicker] = useState(false);

    // URL-based tab state with localStorage persistence
    const urlTab = searchParams.get('tab');
    const savedTab = typeof window !== 'undefined' ? localStorage.getItem('aquaflow_active_tab') : null;
    const activeTab = (urlTab === 'feedback' || urlTab === 'achievements' || urlTab === 'health')
        ? urlTab as 'feedback' | 'achievements' | 'health'
        : (savedTab === 'feedback' || savedTab === 'achievements' || savedTab === 'health')
            ? savedTab as 'feedback' | 'achievements' | 'health'
            : 'training' as const;

    // Persist activeTab for round-trip navigation (e.g. from /profile)
    useEffect(() => {
        if (activeTab !== 'training') {
            localStorage.setItem('aquaflow_active_tab', activeTab);
        }
    }, [activeTab]);

    // Background theme
    const currentTrainingType = useMemo(() => {
        const selectedPlans = getSelectedDatePlans();
        if (selectedPlans.length > 0) return selectedPlans[0].trainingType;
        return undefined;
    }, [activeTab, selectedDate, plans, weeklyPlans, currentUser]);

    const {
        theme: bgTheme,
        mode: bgMode,
        gradientClass,
        setManualTheme: setBgTheme,
        setAutoMode: setBgAuto,
        allThemes,
    } = useBackgroundTheme(currentTrainingType);

    // Current viewing week (navigable with arrows)
    const getCurrentWeekMonday = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };
    const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekMonday());

    const navigateWeek = (direction: -1 | 1) => {
        const d = new Date(currentWeekStart + "T12:00:00");
        d.setDate(d.getDate() + direction * 7);
        setCurrentWeekStart(d.toISOString().split('T')[0]);
    };

    const isCurrentWeek = currentWeekStart === getCurrentWeekMonday();

    // Status form
    const [readiness, setReadiness] = useState(95);
    const [status, setStatus] = useState<"Active" | "Resting" | "Injured">("Active");
    const [statusSaved, setStatusSaved] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);

    const loadPendingReminders = useCallback(async (swimmerId: string) => {
        try {
            const res = await api.feedbackReminders.getForSwimmer(swimmerId);
            const pending = res.filter((r: any) => !r.isResponded);
            setPendingReminders(pending.length);
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            if (!err.message?.includes('API Error: 4')) {
                console.error("Failed to load reminders count", e);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const storedId = localStorage.getItem("aquaflow_athlete_id");
        if (!storedId) {
            router.push("/login");
            return;
        }

        const timer = setTimeout(() => {
            if (!isMounted) return;
            const user = swimmers.find(s => s.id === storedId);
            if (user) {
                setCurrentUser(user);
                setReadiness(user.readiness || 95);
                if (user.status === "Active" || user.status === "Resting" || user.status === "Injured") {
                    setStatus(user.status);
                }
            }
            if (storeLoaded) {
                setAuthResolved(true);
            }

            loadPendingReminders(storedId);
        }, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [swimmers, storeLoaded, router, loadPendingReminders]);

    const handleLogout = async () => {
        try { await api.auth.logout(); } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        router.push('/login');
    };

    const handleSaveStatus = async () => {
        if (!currentUser || statusSaving) return;
        setStatusSaving(true);
        try {
            const updates: any = {
                readiness,
                status: status as "Active" | "Resting" | "Injured",
                lastProfileUpdate: new Date().toISOString()
            };
            await updateSwimmer(currentUser.id, updates);
            setStatusSaved(true);
            setTimeout(() => setStatusSaved(false), 3000);
        } catch (e) {
            console.error("Failed to save status:", e);
        } finally {
            setStatusSaving(false);
        }
    };

    // Check if a weekly plan is visible to this swimmer
    const isWeeklyPlanVisible = (wp: any): boolean => {
        if (!currentUser) return false;
        const targetGroup: string[] = Array.isArray(wp.targetGroup)
            ? wp.targetGroup
            : typeof wp.targetGroup === 'string' ? (() => { try { return JSON.parse(wp.targetGroup || '[]'); } catch { return []; } })() : [];
        const targetSwimmerIds: string[] = Array.isArray(wp.targetSwimmerIds)
            ? wp.targetSwimmerIds
            : typeof wp.targetSwimmerIds === 'string' ? (() => { try { return JSON.parse(wp.targetSwimmerIds || '[]'); } catch { return []; } })() : [];

        const hasGroupTarget = targetGroup.length > 0;
        const hasIndividualTarget = targetSwimmerIds.length > 0;

        if (!hasGroupTarget && !hasIndividualTarget) return true;
        if (hasGroupTarget && targetGroup.includes(currentUser.group)) return true;
        if (hasIndividualTarget && targetSwimmerIds.includes(currentUser.id)) return true;

        return false;
    };

    // Get all plans/sessions for selected date
    const getSelectedDatePlans = (): (TrainingPlan & { isDerived?: boolean })[] => {
        if (!currentUser) return [];
        const dateStr = getLocalDateISOString(selectedDate);
        const dayPlansObj: (TrainingPlan & { isDerived?: boolean })[] = [];

        const dayPlans = plans.filter(p => p.date === dateStr && p.group === currentUser.group);
        if (dayPlans.length > 0) dayPlansObj.push(...dayPlans);

        for (const wp of weeklyPlans) {
            if (!isWeeklyPlanVisible(wp)) continue;
            const sessions = wp.sessions?.filter((s: any) => s.date === dateStr);
            if (sessions && sessions.length > 0) {
                sessions.forEach((session: any) => {
                    dayPlansObj.push({
                        id: `derived-${session.id}`,
                        date: dateStr,
                        group: currentUser.group,
                        totalDistance: session.totalDistance || 0,
                        focus: session.label,
                        imageUrl: session.imageUrl || session.imageData,
                        blocks: session.trainingBlocks || [],
                        isDerived: true,
                        targetedNotes: {},
                        status: "Published",
                        editorMode: session.editorMode,
                        contentBlocks: session.contentBlocks,
                        trainingBlocks: session.trainingBlocks,
                        contentHtml: session.contentHtml,
                        imageData: session.imageData,
                        imageType: session.imageType,
                        notes: session.notes,
                        trainingType: session.trainingType,
                        primaryStroke: session.primaryStroke,
                    } as any);
                });
            }
        }

        return dayPlansObj;
    };

    // Calculate monthly stats
    const getMonthlyStats = () => {
        try {
            if (!currentUser) return { totalDistance: 0, trainingDays: 0, completionRate: 0 };

            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthPlans = (plans || []).filter(p => {
                const planDate = new Date(p.date);
                return planDate >= firstDay &&
                    planDate <= now &&
                    p.group === currentUser.group;
            });

            const totalDistance = monthPlans.reduce((sum, p) => sum + (p.totalDistance || 0), 0);
            const trainingDays = monthPlans.length;

            const monthAttendance = (attendance || []).filter(a => {
                const attDate = new Date(a.date);
                return attDate >= firstDay &&
                    attDate <= now &&
                    a.swimmerId === currentUser.id;
            });

            const completionRate = trainingDays > 0
                ? Math.round((monthAttendance.length / trainingDays) * 100)
                : 0;

            return { totalDistance, trainingDays, completionRate };
        } catch (e) {
            console.error("Stats calculation error", e);
            return { totalDistance: 0, trainingDays: 0, completionRate: 0 };
        }
    };

    if (!authResolved || !storeLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center group">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-widest">
                        正在加载训练内容...
                    </p>
                </div>
            </div>
        );
    }

    if (syncStatus === 'error' && (!swimmers || swimmers.length === 0)) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-center">
                <div className="space-y-6 max-w-sm glass-panel border border-white/5 bg-slate-900/40 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.08)]">
                    <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white tracking-wide">网络连接失败</h2>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            无法连接到 AquaFlow 核心服务器。<br />
                            可能由于数据库正在休眠唤醒中，或当前网络存在波动。
                        </p>
                    </div>
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary hover:bg-primary/95 text-black font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(100,255,218,0.2)] hover:shadow-[0_0_25px_rgba(100,255,218,0.35)]"
                        >
                            重新尝试连接
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/5 transition-all duration-300"
                        >
                            返回登录页
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
                <div className="space-y-4 max-w-xs">
                    <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Session Expired</h2>
                    <p className="text-sm text-muted-foreground">无法识别您的队员身份，请尝试重新登录程序。</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold"
                    >
                        返回登录页
                    </button>
                </div>
            </div>
        );
    }

    const selectedPlansObj = getSelectedDatePlans();
    const myNote = (selectedPlansObj.length > 0 && selectedPlansObj[0].targetedNotes && currentUser) ? selectedPlansObj[0].targetedNotes[currentUser.id] : null;
    const monthlyStats = getMonthlyStats();

    // Find weekly plan that covers the viewing week
    const currentWeeklyPlan = weeklyPlans.find(wp => {
        if (!isWeeklyPlanVisible(wp)) return false;
        if (!wp.weekStart || !wp.weekEnd) return false;
        return currentWeekStart >= wp.weekStart && currentWeekStart <= wp.weekEnd;
    });

    const weekDays = (() => {
        const days = [];
        const start = new Date(currentWeekStart + "T12:00:00");
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    })();

    // Gamification
    const xp = currentUser.xp || 0;
    const level = currentUser.level || 1;
    const progress = (xp % 100);

    const myAnnouncements = getVisibleAnnouncements().filter((a: any) => {
        if (a.targetGroup && a.targetGroup !== currentUser?.group) return false;
        if (a.targetSwimmerIds && !a.targetSwimmerIds.includes(currentUser?.id)) return false;
        return true;
    });

    return (
        <div className={cn("min-h-screen pb-24 transition-colors duration-700 ease-in-out bg-gradient-to-br", gradientClass)}>
            {/* Background texture overlay */}
            <div className="fixed inset-0 bg-theme-texture pointer-events-none z-0 opacity-30" aria-hidden="true" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
                    <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center shadow-[0_0_12px_rgba(100,255,218,0.3)] bg-slate-900">
                                <AvatarRenderer
                                    gender={currentUser.gender || "male"}
                                    equippedItems={currentUser.equippedItems || {}}
                                    size={40}
                                    animated={false}
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black border border-black">
                                {level}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">{currentUser.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{xp} XP / Lv.{level + 1}</span>
                            </div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowBgPicker(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            title="更换背景"
                            aria-label="Change background theme"
                        >
                            <Palette className="w-4 h-4" />
                        </button>
                        <ActivityFeed swimmerId={currentUser.id} />
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                            title="登出"
                            aria-label="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                {/* Meet Countdown Widget */}
                <MeetCountdown />

                {/* Tab Content: Training Section */}
                {activeTab === 'training' && (
                    <div className="space-y-6">
                        {/* Coach Announcements Feed */}
                        {myAnnouncements.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                        {t.dashboard.coachFeed}
                                    </h2>
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
                                </div>
                                {myAnnouncements.map((a: any) => (
                                    <AnnouncementCard key={a.id} announcement={a} />
                                ))}
                                {showArchive && (
                                    <div className="pt-4 border-t border-white/10 space-y-3">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.dashboard.archivedFeed}</p>
                                        {archivedAnnouncements.length === 0 && (
                                            <p className="text-xs text-muted-foreground/50 italic">{t.dashboard.archiveHint}</p>
                                        )}
                                        {archivedAnnouncements.slice(0, athleteArchiveLimit).map((a: any) => (
                                            <div key={a.id} className="opacity-60">
                                                <AnnouncementCard announcement={a} />
                                            </div>
                                        ))}
                                        {archivedAnnouncements.length > athleteArchiveLimit && (
                                            <button
                                                onClick={() => setAthleteArchiveLimit(prev => prev + 10)}
                                                className="w-full text-center text-xs text-muted-foreground hover:text-white py-2"
                                            >
                                                {t.dashboard.loadMore} ({archivedAnnouncements.length - athleteArchiveLimit} 条)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Weekly Framework */}
                        <div className="bg-card/50 border border-border/50 rounded-2xl p-4 md:p-5">
                            <div className="flex items-center justify-between mb-1">
                                <button
                                    onClick={() => navigateWeek(-1)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="上一周"
                                    aria-label="Previous week"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Waves className="w-4 h-4 text-emerald-400" />
                                    {currentWeeklyPlan?.title || t.dashboard.weeklyOverview}
                                </h2>
                                <button
                                    onClick={() => navigateWeek(1)}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isCurrentWeek ? "text-white/20 cursor-default" : "text-white hover:bg-white/10"
                                    )}
                                    title="下一周"
                                    disabled={isCurrentWeek}
                                    aria-label="Next week"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            {currentWeeklyPlan?.coachNotes && (
                                <p className="text-xs text-blue-200/70 mb-3 italic">教练说：{currentWeeklyPlan.coachNotes}</p>
                            )}

                            {currentWeeklyPlan?.overviewImageUrl && (
                                <div className="mb-3 rounded-lg overflow-hidden">
                                    <img src={currentWeeklyPlan.overviewImageUrl} alt="本周总览" className="w-full max-h-[250px] object-contain" />
                                </div>
                            )}
                            {currentWeeklyPlan?.overviewContentHtml && (
                                <div
                                    className="mb-3 text-sm text-white prose prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentWeeklyPlan.overviewContentHtml) }}
                                />
                            )}

                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {weekDays.map(date => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
                                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                                    const hasSession = currentWeeklyPlan?.sessions?.some((s: any) => s.date === dateStr) ||
                                        plans.some(p => p.date === dateStr && p.group === currentUser.group);

                                    const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', '');

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "flex flex-col items-center py-2 rounded-lg transition-all relative border min-h-[52px]",
                                                isSelected
                                                    ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(100,255,218,0.3)]"
                                                    : hasSession
                                                        ? "bg-primary/10 border-primary/20 text-white hover:bg-primary/20"
                                                        : "bg-secondary/50 border-white/5 text-muted-foreground hover:bg-white/5"
                                            )}
                                            aria-label={`${dateStr}${hasSession ? ' 有训练' : ''}${isSelected ? ' 已选择' : ''}`}
                                        >
                                            <span className="text-xs font-bold">{dayName}</span>
                                            <span className="text-sm font-bold mt-0.5">{date.getDate()}</span>
                                            {isToday && (
                                                <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background", isSelected ? "bg-black" : "bg-emerald-500")} />
                                            )}
                                            {hasSession && !isSelected && (
                                                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Daily Context */}
                        <div className="pt-2">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-purple-400" />
                                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} {t.dashboard.dailyDetails}
                            </h3>

                            {selectedPlansObj.length > 0 ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {myNote && (
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-5 rounded-3xl relative overflow-hidden shadow-lg">
                                            <p className="text-white text-lg font-medium italic">&ldquo;{myNote}&rdquo;</p>
                                        </div>
                                    )}
                                    {selectedPlansObj.map((plan, index) => (
                                        <div key={plan.id || index} className="bg-card/50 border border-border/50 rounded-2xl p-6">
                                            {plan.isDerived && (
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="inline-block bg-purple-500/20 text-purple-300 text-xs uppercase font-bold tracking-widest px-2 py-1 rounded-full border border-purple-500/30">
                                                        {t.dashboard.extractedFromWeekly}
                                                    </div>
                                                    {selectedPlansObj.length > 1 && (
                                                        <div className="text-xs text-muted-foreground">{t.dashboard.sessionOf.replace('{n}', String(index + 1)).replace('{total}', String(selectedPlansObj.length))}</div>
                                                    )}
                                                </div>
                                            )}
                                            <SessionRenderer session={plan} className="mb-4" />
                                            {plan.totalDistance > 0 && (
                                                <div className="text-4xl font-mono font-bold text-white mb-2">{plan.totalDistance}m</div>
                                            )}
                                            <div className="text-xs text-muted-foreground uppercase">{plan.focus}</div>
                                            {plan.blocks && plan.blocks.length > 0 && currentUser && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.dashboard.techniqueFeedback}</div>
                                                    {plan.blocks.map((block: any) => (
                                                        <BlockFeedbackPanel
                                                            key={block.id}
                                                            planId={plan.id}
                                                            blockId={block.id}
                                                            swimmerId={currentUser.id}
                                                            blockName={block.type || block.items?.[0]?.description}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl">
                                    <Waves className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">{t.dashboard.noTrainingToday}</p>
                                    <p className="text-xs text-muted-foreground/50 mt-2">{t.dashboard.tryFeedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content: Feedback Section */}
                {activeTab === 'feedback' && currentUser && (
                    <div className="space-y-6">
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4">
                            <MessageSquare className="w-6 h-6 text-purple-400" />
                            <div>
                                <h3 className="text-sm font-bold text-white">{t.athlete.feedbackInbox}</h3>
                                <p className="text-xs text-muted-foreground">{t.athlete.feedbackInboxDesc}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">{t.athlete.targetedTasks} ({pendingReminders} {t.athlete.pending})</h4>
                            <TargetedFeedbackForm swimmerId={currentUser.id} />
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border/50">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">{t.athlete.weeklySummary}</h4>
                            <WeeklyFeedbackForm swimmerId={currentUser.id} weekStart={currentWeekStart} />
                        </div>

                        <CoachReplyPanel swimmerId={currentUser.id} />
                    </div>
                )}

                {/* Tab Content: Health & Stats */}
                {activeTab === 'health' && (
                    <div className="space-y-6">
                        <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">{t.athlete.currentStatus}</h2>
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">
                                    {t.athlete.readiness}: {readiness}% — {
                                        readiness <= 20 ? t.athlete.veryFatigued :
                                        readiness <= 40 ? t.athlete.fatigued :
                                        readiness <= 60 ? t.athlete.fair :
                                        readiness <= 80 ? t.athlete.good :
                                        t.athlete.excellent
                                    }
                                </label>
                                <input type="range" min="0" max="100" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button onClick={() => setStatus("Active")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Active" ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.training}</button>
                                <button onClick={() => setStatus("Resting")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Resting" ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.resting}</button>
                                <button onClick={() => setStatus("Injured")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Injured" ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.injured}</button>
                            </div>
                            <div className="mb-6">
                                <InjuryMap swimmerId={currentUser.id} />
                            </div>
                            <button onClick={handleSaveStatus} disabled={statusSaving} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium relative min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
                                {statusSaving ? "保存中..." : t.athlete.saveStatus}
                                {statusSaved && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-green-400 bg-background border border-green-500/20 px-3 py-1 rounded-full whitespace-nowrap shadow-lg z-10">
                                        {t.athlete.saved}
                                    </span>
                                )}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.monthlyDistance}</p>
                                <p className="text-lg font-bold text-white">{monthlyStats.totalDistance}m</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.attendanceDays}</p>
                                <p className="text-lg font-bold text-white">{monthlyStats.trainingDays}天</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.xpPoints}</p>
                                <p className="text-lg font-bold text-white">{xp}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Achievements */}
                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between">
                            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                {t.athlete.achievements}
                            </h3>
                            <Link href="/archive" className="text-xs text-primary hover:underline flex items-center gap-1">
                                {t.athlete.viewFullArchive} <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <TrainingHistory swimmerId={currentUser.id} />
                        <PerformanceList swimmerId={currentUser.id} />
                    </div>
                )}
            </main>

            {/* Background Picker Modal */}
            <BackgroundPicker
                open={showBgPicker}
                onClose={() => setShowBgPicker(false)}
                currentThemeId={bgTheme.id}
                currentMode={bgMode}
                onThemeSelect={(id) => {
                    setBgTheme(id);
                    setShowBgPicker(false);
                }}
                onAutoMode={() => {
                    setBgAuto();
                    setShowBgPicker(false);
                }}
            />

            {/* Bottom Tab Bar */}
            <BottomTabBar />

            {/* Wave Animation */}
            <WaveAnimation />
        </div>
    );
}

export default function AthleteWorkoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AthleteWorkoutContent />
        </Suspense>
    );
}

