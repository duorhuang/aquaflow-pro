"use client";

import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
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
import { AlertTriangle, LogOut, Waves, MessageSquare, TrendingUp, Activity, FolderOpen, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Palette, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TrainingPlan, Swimmer } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { getLocalDateISOString, LEVEL_THRESHOLDS } from "@/lib/date-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import dynamic from "next/dynamic";
import { useToast } from "@/components/common/Toast";

const TrainingHistory = dynamic(() => import("@/components/athlete/TrainingHistory").then(m => ({ default: m.TrainingHistory })));
const PerformanceList = dynamic(() => import("@/components/athlete/PerformanceTracker").then(m => ({ default: m.PerformanceList })));

function AthleteWorkoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const { toast } = useToast();
    const { plans, swimmers, attendance, updateSwimmer, weeklyPlans, announcements, archivedAnnouncements, getVisibleAnnouncements, isLoaded: storeLoaded, syncStatus } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [authResolved, setAuthResolved] = useState(false);
    const [pendingReminders, setPendingReminders] = useState(0);
    const [showArchive, setShowArchive] = useState(false);
    const [athleteArchiveLimit, setAthleteArchiveLimit] = useState(5);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // URL-based tab state with localStorage persistence
    const urlTab = searchParams.get('tab');
    const [savedTab, setSavedTab] = useState<string | null>(null);

    // Read localStorage after mount to avoid hydration mismatch
    useEffect(() => {
        const stored = localStorage.getItem('aquaflow_active_tab');
        if (stored === 'feedback' || stored === 'achievements' || stored === 'health') {
            setTimeout(() => {
                setSavedTab(stored);
            }, 0);
        }
    }, []);

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

    // Get all plans/sessions for selected date (hoisted before useMemo that calls it)
    const getSelectedDatePlans = (): (TrainingPlan & { isDerived?: boolean; notes?: string })[] => {
        if (!currentUser) return [];
        const dateStr = getLocalDateISOString(selectedDate);
        const dayPlansObj: (TrainingPlan & { isDerived?: boolean; notes?: string })[] = [];

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

    // Background theme
    const currentTrainingType = useMemo(() => {
        const selectedPlans = getSelectedDatePlans();
        if (selectedPlans.length > 0) return selectedPlans[0].trainingType;
        return undefined;
    }, [selectedDate, plans, weeklyPlans, currentUser]);

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
        const d = new Date(new Date().toISOString().split('T')[0] + "T12:00:00");
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

    // Refs to track values without causing effect re-runs (prevents infinite loop)
    const syncStatusRef = useRef(syncStatus);
    useEffect(() => { syncStatusRef.current = syncStatus; }, [syncStatus]);
    const swimmersRef = useRef(swimmers);
    useEffect(() => { swimmersRef.current = swimmers; }, [swimmers]);
    const storeLoadedRef = useRef(storeLoaded);
    useEffect(() => { storeLoadedRef.current = storeLoaded; }, [storeLoaded]);

    // Auth check — runs ONCE on mount, never re-triggers on dependency changes
    useEffect(() => {
        let isMounted = true;
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;

        const resolveAuth = (user: any) => {
            const userId = user.id;
            localStorage.setItem("aquaflow_athlete_id", userId);

            const tryFind = () => {
                if (!isMounted) return false;
                const found = swimmersRef.current.find(s => s.id === userId);
                if (found) {
                    setCurrentUser(found);
                    setReadiness(found.readiness || 95);
                    if (found.status === "Active" || found.status === "Resting" || found.status === "Injured") {
                        setStatus(found.status);
                    }
                    setAuthResolved(true);
                    loadPendingReminders(userId);
                    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
                    return true;
                }
                return false;
            };

            const currentSyncStatus = syncStatusRef.current;
            const currentStoreLoaded = storeLoadedRef.current;

            if (currentStoreLoaded) {
                if (!tryFind()) {
                    if (currentSyncStatus === 'error') {
                        setAuthResolved(true);
                    } else {
                        localStorage.removeItem("aquaflow_athlete_id");
                        router.push("/login");
                    }
                }
            } else {
                pollTimer = setInterval(() => {
                    if (!isMounted) return;
                    if (storeLoadedRef.current) {
                        clearInterval(pollTimer!);
                        pollTimer = null;
                        if (!tryFind()) {
                            if (syncStatusRef.current === 'error') {
                                setAuthResolved(true);
                            } else {
                                localStorage.removeItem("aquaflow_athlete_id");
                                router.push("/login");
                            }
                        }
                    }
                }, 200);

                retryTimer = setTimeout(() => {
                    if (!isMounted) return;
                    if (!storeLoadedRef.current && !authResolved) {
                        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
                        // Don't set authResolved here — let it stay false so the loading UI shows
                        // The page will keep trying until the DB wakes up
                    }
                }, 30000); // Increased to 30s to give DB more time
            }
        };

        const runAuth = async () => {
            try {
                const user = await api.auth.me();
                if (!isMounted) return;

                if (!user || user?.role !== 'athlete') {
                    if (user === null) {
                        // Cold DB — keep retrying until it wakes up
                        let attempt = 0;
                        const maxAttempts = 20;
                        const pollDB = async () => {
                            if (!isMounted || attempt >= maxAttempts) {
                                // Still cold after many attempts — show error UI
                                if (isMounted) setAuthResolved(true);
                                return;
                            }
                            attempt++;
                            try {
                                const retryUser = await api.auth.me();
                                if (!isMounted) return;
                                if (retryUser && retryUser.role === 'athlete') {
                                    resolveAuth(retryUser);
                                } else if (retryUser === null) {
                                    // Still cold — retry with exponential backoff
                                    const delay = Math.min(3000 * attempt, 30000);
                                    retryTimer = setTimeout(pollDB, delay);
                                } else {
                                    // Wrong role — redirect
                                    localStorage.removeItem("aquaflow_athlete_id");
                                    router.push("/login");
                                }
                            } catch {
                                // Network error — retry
                                const delay = Math.min(3000 * attempt, 30000);
                                retryTimer = setTimeout(pollDB, delay);
                            }
                        };
                        retryTimer = setTimeout(pollDB, 3000);
                    } else {
                        localStorage.removeItem("aquaflow_athlete_id");
                        router.push("/login");
                    }
                    return;
                }
                resolveAuth(user);
            } catch {
                if (isMounted) {
                    localStorage.removeItem("aquaflow_athlete_id");
                    router.push("/login");
                }
            }
        };

        runAuth();

        return () => {
            isMounted = false;
            if (pollTimer) clearInterval(pollTimer);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [router, loadPendingReminders]);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
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
            toast("error", "保存失败，请重试");
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
                    <h2 className="text-xl font-bold text-white">会话已过期</h2>
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
    const swimmerXp = currentUser.totalXp !== undefined ? currentUser.totalXp : (currentUser.xp || 0);
    const level = currentUser.level || 1;
    const currentMin = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextMin = LEVEL_THRESHOLDS[level] || (currentMin + 10000);
    const progress = Math.min(100, Math.max(0, ((swimmerXp - currentMin) / (nextMin - currentMin)) * 100));

    const myAnnouncements = getVisibleAnnouncements().filter((a: any) => {
        if (a.targetGroup && a.targetGroup !== currentUser?.group) return false;
        if (a.targetSwimmerIds && !a.targetSwimmerIds.includes(currentUser?.id)) return false;
        return true;
    });

    return (
        <div className={cn("min-h-screen pb-24 transition-colors duration-700 ease-in-out bg-gradient-to-br", gradientClass)}>
            {/* Skip navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
            >
                跳过导航，直达主要内容
            </a>

            {/* Background texture overlay */}
            <div className="fixed inset-0 bg-theme-texture pointer-events-none z-0 opacity-30" aria-hidden="true" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/65 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
                    <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.3)] bg-slate-900">
                                <AvatarRenderer
                                    gender={currentUser.gender || "male"}
                                    equippedItems={currentUser.equippedItems || {}}
                                    size={40}
                                    animated={false}
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-warning flex items-center justify-center text-xs font-bold text-black border border-black">
                                {level}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-wide font-display-metrics">{currentUser.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                                    <div className="h-full xp-bar-gradient rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-label-caps">{swimmerXp} XP / Lv.{level + 1}</span>
                            </div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowBgPicker(true)}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            title="更换背景"
                            aria-label="更换背景主题"
                        >
                            <Palette className="w-4 h-4" />
                        </button>
                        <ActivityFeed swimmerId={currentUser.id} />
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-error/10 rounded-lg transition-colors text-error disabled:opacity-50"
                            title="登出"
                            aria-label="退出登录"
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

            <main id="main-content" className="p-4 max-w-2xl mx-auto space-y-6">
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
                        <div className="bg-card/50 border border-border/50 rounded-2xl p-4 md:p-5 glow-border">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    onClick={() => navigateWeek(-1)}
                                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                                    title="上一周"
                                    aria-label="上一周"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display-metrics">
                                        <Waves className="w-4 h-4 text-primary" />
                                        {currentWeeklyPlan?.title || t.dashboard.weeklyOverview}
                                    </h2>
                                    {!isCurrentWeek && (
                                        <button
                                            onClick={() => setCurrentWeekStart(getCurrentWeekMonday())}
                                            className="text-xs text-primary hover:underline px-2.5 py-1 rounded-full bg-primary/10 font-label-caps"
                                            aria-label="回到本周"
                                        >
                                            回到本周
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigateWeek(1)}
                                    disabled={isCurrentWeek}
                                    className={cn(
                                        "p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors",
                                        isCurrentWeek ? "text-white/20 cursor-default" : "text-white hover:bg-white/10"
                                    )}
                                    title="下一周"
                                    aria-label="下一周"
                                >
                                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                            {currentWeeklyPlan?.coachNotes && (
                                <p className="text-xs text-muted-foreground mb-4 italic pl-3 border-l-2 border-primary/50">教练说：{currentWeeklyPlan.coachNotes}</p>
                            )}

                            {currentWeeklyPlan?.overviewImageUrl && (
                                <div className="mb-4 rounded-xl overflow-hidden border border-white/5">
                                    <img src={currentWeeklyPlan.overviewImageUrl} alt="本周总览" className="w-full max-h-[250px] object-contain" />
                                </div>
                            )}
                            {currentWeeklyPlan?.overviewContentHtml && (
                                <div
                                    className="mb-4 text-sm text-white prose prose-invert prose-sm max-w-none px-3"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentWeeklyPlan.overviewContentHtml) }}
                                />
                            )}

                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {weekDays.map(date => {
                                    const dateStr = getLocalDateISOString(date);
                                    const isSelected = dateStr === getLocalDateISOString(selectedDate);
                                    const isToday = dateStr === getLocalDateISOString(new Date());

                                    const hasSession = currentWeeklyPlan?.sessions?.some((s: any) => s.date === dateStr) ||
                                        plans.some(p => p.date === dateStr && p.group === currentUser.group);

                                    // Determine training theme type for tags
                                    let typeLabel = "";
                                    let typeColor = "";
                                    if (hasSession) {
                                        const foundPlan = plans.find(p => p.date === dateStr && p.group === currentUser.group);
                                        const type = foundPlan?.trainingType || 
                                            currentWeeklyPlan?.sessions?.find((s: any) => s.date === dateStr)?.trainingType;
                                        
                                        if (type === "aerobic") {
                                            typeLabel = "有氧";
                                            typeColor = "text-primary bg-primary/10 border-primary/20";
                                        } else if (type === "anaerobic" || type === "lactate") {
                                            typeLabel = "无氧";
                                            typeColor = "text-destructive bg-destructive/10 border-destructive/20";
                                        } else if (type === "sprint" || type === "strength" || type === "race_prep") {
                                            typeLabel = "冲刺";
                                            typeColor = "text-warning bg-warning/10 border-warning/20";
                                        } else {
                                            typeLabel = "活跃";
                                            typeColor = "text-primary bg-primary/10 border-primary/20";
                                        }
                                    }

                                    const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', '');

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "flex flex-col items-center justify-between py-2 rounded-xl transition-all relative border min-h-[72px]",
                                                isSelected
                                                    ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(0,242,255,0.4)] ring-2 ring-primary/30"
                                                    : hasSession
                                                        ? "bg-secondary/40 border-primary/20 text-white hover:bg-secondary/50"
                                                        : "bg-surface-container-lowest/50 border-white/5 text-muted-foreground hover:bg-white/5"
                                            )}
                                            aria-label={`${date.getMonth() + 1}月${date.getDate()}日 ${date.toLocaleDateString('zh-CN', { weekday: 'long' })}${hasSession ? '，有训练' : ''}${isSelected ? '，已选择' : ''}`}
                                            aria-pressed={isSelected}
                                        >
                                            <span className={cn("text-[10px] font-bold uppercase font-label-caps", isSelected ? "text-black/60" : "text-muted-foreground")}>{dayName}</span>
                                            <span className="text-sm font-bold font-display-metrics mt-0.5">{date.getDate()}</span>
                                            {hasSession ? (
                                                <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border mt-1 scale-90", isSelected ? "text-black bg-black/10 border-black/20" : typeColor)}>
                                                    {typeLabel}
                                                </span>
                                            ) : (
                                                <span className="text-[8px] text-muted-foreground/30 font-label-caps mt-1">休息</span>
                                            )}
                                            {isToday && (
                                                <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background ring-1 ring-primary", isSelected ? "bg-black" : "bg-primary")} aria-label="今天" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Daily Context */}
                        <div className="pt-2 space-y-6">
                            <h3 className="text-md font-semibold text-white flex items-center gap-2 font-display-metrics">
                                <FolderOpen className="w-5 h-5 text-primary" />
                                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} {t.dashboard.dailyDetails}
                            </h3>

                            {selectedPlansObj.length > 0 ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {myNote && (
                                        <div className="bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/30 p-5 rounded-3xl relative overflow-hidden shadow-md">
                                            <p className="text-white text-lg font-medium italic">&ldquo;{myNote}&rdquo;</p>
                                        </div>
                                    )}
                                    {selectedPlansObj.map((plan, index) => (
                                        <div key={plan.id || index} className="bg-card/50 border border-border/50 rounded-2xl p-6 glow-border relative overflow-hidden">
                                            {/* Decorative background subtle glow */}
                                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] font-label-caps text-primary uppercase tracking-wider block mb-1">今日训练计划</span>
                                                    <h4 className="text-lg font-bold text-white font-display-metrics">{plan.focus || "耐力训练"}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className={cn(
                                                        "text-[10px] font-label-caps px-2.5 py-1 rounded-full border",
                                                        plan.trainingType === "aerobic" ? "text-primary bg-primary/10 border-primary/20" :
                                                        plan.trainingType === "anaerobic" || plan.trainingType === "lactate" ? "text-destructive bg-destructive/10 border-destructive/20" :
                                                        plan.trainingType === "sprint" || plan.trainingType === "strength" ? "text-warning bg-warning/10 border-warning/20" :
                                                        "text-primary bg-primary/10 border-primary/20"
                                                    )}>
                                                        {plan.trainingType ? plan.trainingType.toUpperCase() : "有氧"} 重点
                                                    </span>
                                                </div>
                                            </div>

                                            {plan.isDerived && (
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="inline-block bg-info/20 text-info text-xs font-medium tracking-wider px-2 py-1 rounded-full border border-info/30">
                                                        {t.dashboard.extractedFromWeekly}
                                                    </div>
                                                    {selectedPlansObj.length > 1 && (
                                                        <div className="text-xs text-muted-foreground">{t.dashboard.sessionOf.replace('{n}', String(index + 1)).replace('{total}', String(selectedPlansObj.length))}</div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-surface-container-lowest/40 p-3 rounded-xl border border-white/5">
                                                    <p className="text-[10px] font-label-caps text-muted-foreground uppercase">总距离</p>
                                                    <p className="text-2xl font-bold font-display-metrics text-primary mt-1">
                                                        {plan.totalDistance > 0 ? plan.totalDistance : "3,000"}<span className="text-xs font-label-caps ml-0.5 text-muted-foreground">M</span>
                                                    </p>
                                                </div>
                                                <div className="bg-surface-container-lowest/40 p-3 rounded-xl border border-white/5">
                                                    <p className="text-[10px] font-label-caps text-muted-foreground uppercase">主项泳姿</p>
                                                    <p className="text-sm font-semibold text-white mt-2 truncate">
                                                        {plan.primaryStroke || "自由泳"}
                                                    </p>
                                                </div>
                                            </div>

                                            <SessionRenderer session={plan} className="mb-4" />

                                            {plan.notes && (
                                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                                    <h5 className="text-[10px] font-label-caps text-white uppercase tracking-wider">教练备注</h5>
                                                    <div className="flex gap-2 items-start p-3 bg-surface-container-lowest/30 rounded-xl border border-white/5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{plan.notes}</p>
                                                    </div>
                                                </div>
                                            )}

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

                            {/* Premium Telemetry Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 连续打卡环 */}
                                <div className="bg-card/50 border border-border/50 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between glow-border">
                                    <div className="relative z-10 space-y-1">
                                        <p className="font-label-caps text-xs text-muted-foreground uppercase">连续训练</p>
                                        <h4 className="text-lg font-bold text-white font-display-metrics">14天连续训练</h4>
                                        <p className="text-[11px] text-muted-foreground/80">本月训练率位列全队前 3%</p>
                                    </div>
                                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle className="text-secondary/20" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                                            <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="35.2" strokeWidth="4" strokeLinecap="round"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-display-metrics text-base text-primary">14</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Quick View Analytics */}
                                <div className="bg-card/50 border border-border/50 rounded-2xl p-5 glow-border space-y-3">
                                    <h4 className="font-label-caps text-xs text-muted-foreground uppercase">训练指标分析</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">效率指数</span>
                                            <span className="font-label-caps font-bold text-primary">88% ↑</span>
                                        </div>
                                        <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: '88%' }} />
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">临界速度</span>
                                            <span className="font-label-caps font-bold text-white">1.45 m/s</span>
                                        </div>
                                        <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-warning rounded-full" style={{ width: '65%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stroke Analysis Telemetry */}
                            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 glow-border">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-label-caps text-xs text-primary uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        泳姿分析
                                    </h3>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-[10px] font-label-caps text-muted-foreground">划频</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-warning" />
                                            <span className="text-[10px] font-label-caps text-muted-foreground">速度</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-28 w-full flex items-end gap-1 px-1 pt-4">
                                    <div className="flex-1 bg-primary/20 h-[30%] rounded-t transition-all hover:h-[40%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[45%] rounded-t transition-all hover:h-[55%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[60%] rounded-t transition-all hover:h-[70%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[40%] rounded-t transition-all hover:h-[50%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[75%] rounded-t transition-all hover:h-[85%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[90%] rounded-t transition-all hover:h-[100%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[50%] rounded-t transition-all hover:h-[60%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[65%] rounded-t transition-all hover:h-[75%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[40%] rounded-t transition-all hover:h-[50%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[55%] rounded-t transition-all hover:h-[65%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[80%] rounded-t transition-all hover:h-[90%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[45%] rounded-t transition-all hover:h-[55%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[30%] rounded-t transition-all hover:h-[40%] cursor-pointer" />
                                    <div className="flex-1 bg-primary/20 h-[60%] rounded-t transition-all hover:h-[70%] cursor-pointer" />
                                </div>
                                <div className="flex justify-between mt-2 text-[9px] font-label-caps text-muted-foreground">
                                    <span>0m</span>
                                    <span>200m</span>
                                    <span>400m</span>
                                    <span>600m</span>
                                    <span>800m</span>
                                    <span>1000m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Feedback Section */}
                {activeTab === 'feedback' && currentUser && (
                    <div className="space-y-6">
                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            <div>
                                <h3 className="text-sm font-semibold text-primary">{t.athlete.feedbackInbox}</h3>
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
                            <h2 className="text-md font-semibold text-white mb-4">{t.athlete.currentStatus}</h2>
                            <div className="mb-6">
                                <label htmlFor="readiness-slider" className="text-sm text-muted-foreground mb-2 block">
                                    {t.athlete.readiness}: {readiness}% — {
                                        readiness <= 20 ? t.athlete.veryFatigued :
                                        readiness <= 40 ? t.athlete.fatigued :
                                        readiness <= 60 ? t.athlete.fair :
                                        readiness <= 80 ? t.athlete.good :
                                        t.athlete.excellent
                                    }
                                </label>
                                <input id="readiness-slider" type="range" min="0" max="100" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readiness} aria-label={`${t.athlete.readiness}: ${readiness}%`} />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button onClick={() => setStatus("Active")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Active" ? "bg-success/20 text-success border border-success/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.training}</button>
                                <button onClick={() => setStatus("Resting")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Resting" ? "bg-warning/20 text-warning border border-warning/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.resting}</button>
                                <button onClick={() => setStatus("Injured")} className={cn("py-3 rounded-xl font-medium text-sm min-h-[44px]", status === "Injured" ? "bg-error/20 text-error border border-error/50" : "bg-secondary/50 border border-transparent")}>{t.athlete.injured}</button>
                            </div>
                            <div className="mb-6">
                                <InjuryMap swimmerId={currentUser.id} />
                            </div>
                            <button onClick={handleSaveStatus} disabled={statusSaving} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium relative min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
                                {statusSaving ? "保存中..." : t.athlete.saveStatus}
                                {statusSaved && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-success bg-background border border-success/20 px-3 py-1 rounded-full whitespace-nowrap shadow-lg z-10">
                                        {t.athlete.saved}
                                    </span>
                                )}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.monthlyDistance}</p>
                                <p className="text-xl font-bold text-primary">{monthlyStats.totalDistance}m</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.attendanceDays}</p>
                                <p className="text-base font-semibold text-foreground">{monthlyStats.trainingDays}天</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase">{t.athlete.xpPoints}</p>
                                <p className="text-base font-semibold text-foreground">{swimmerXp}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Achievements */}
                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <div className="bg-warning/10 border border-warning/20 p-4 rounded-2xl flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-warning flex items-center gap-2">
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
            <BottomTabBar activeTab={activeTab} />

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

