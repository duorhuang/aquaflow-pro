"use client";

import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
import { ChevronLeft, ChevronRight, FolderOpen, MessageSquare, ThumbsUp, ThumbsDown, MessageCircle, Target, Calendar, Waves, ChevronRight as ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Swimmer } from "@/types";
import { BottomTabBar } from "@/components/athlete/BottomTabBar";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { useLanguage } from "@/lib/i18n";

// Check if a weekly plan is visible to this swimmer
function isWeeklyPlanVisible(wp: any, swimmer: any): boolean {
    if (!swimmer) return false;
    const targetGroup: string[] = Array.isArray(wp.targetGroup)
        ? wp.targetGroup
        : typeof wp.targetGroup === 'string' ? (() => { try { return JSON.parse(wp.targetGroup || '[]'); } catch { return []; } })() : [];
    const targetSwimmerIds: string[] = Array.isArray(wp.targetSwimmerIds)
        ? wp.targetSwimmerIds
        : typeof wp.targetSwimmerIds === 'string' ? (() => { try { return JSON.parse(wp.targetSwimmerIds || '[]'); } catch { return []; } })() : [];
    const hasGroupTarget = targetGroup.length > 0;
    const hasIndividualTarget = targetSwimmerIds.length > 0;
    if (!hasGroupTarget && !hasIndividualTarget) return true;
    if (hasGroupTarget && targetGroup.includes(swimmer.group)) return true;
    if (hasIndividualTarget && targetSwimmerIds.includes(swimmer.id)) return true;
    return false;
}

interface TrainingDayEntry {
    date: string;
    type: 'standalone' | 'weekly';
    plan: any;
    weeklyPlanTitle?: string;
    attended: boolean;
}

interface FeedbackItem {
    type: 'block' | 'weekly' | 'targeted';
    date: string;
    data: any;
}

export default function TrainingArchivePage() {
    const router = useRouter();
    const { plans, swimmers, attendance, weeklyPlans, isLoaded: storeLoaded } = useStore();
    const { t } = useLanguage();
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [authResolved, setAuthResolved] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());
    const [selectedEntry, setSelectedEntry] = useState<TrainingDayEntry | null>(null);
    const [activeTab, setActiveTab] = useState<'training' | 'feedback'>('training');

    // Feedback history state
    const [feedbackData, setFeedbackData] = useState<{ blockFeedbacks: any[]; weeklyFeedbacks: any[]; targetedFeedbacks: any[] } | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const loadFeedbackHistory = useCallback(async () => {
        if (!currentUser) return;
        setFeedbackLoading(true);
        try {
            const res = await api.archive.getFeedbacks({ swimmerId: currentUser.id, type: 'all' });
            setFeedbackData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setFeedbackLoading(false);
        }
    }, [currentUser]);

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
            if (user) setCurrentUser(user);
            if (storeLoaded) setAuthResolved(true);
        }, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [swimmers, storeLoaded, router]);

    useEffect(() => {
        let isMounted = true;
        if (activeTab === 'feedback' && currentUser && !feedbackData) {
            const timer = setTimeout(() => {
                if (isMounted) {
                    loadFeedbackHistory();
                }
            }, 0);
            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, [activeTab, currentUser, feedbackData, loadFeedbackHistory]);

    // Build merged feedback timeline
    const allFeedbackItems: FeedbackItem[] = [];
    if (feedbackData) {
        for (const bf of feedbackData.blockFeedbacks) {
            allFeedbackItems.push({ type: 'block', date: bf.createdAt, data: bf });
        }
        for (const wf of feedbackData.weeklyFeedbacks) {
            allFeedbackItems.push({ type: 'weekly', date: wf.submittedAt || wf.createdAt, data: wf });
        }
        for (const tf of feedbackData.targetedFeedbacks) {
            allFeedbackItems.push({ type: 'targeted', date: tf.createdAt, data: tf });
        }
        allFeedbackItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Filter feedback to current viewing month
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const monthFeedback = allFeedbackItems.filter(item => {
        const d = new Date(item.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    if (!authResolved || !storeLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-center p-6">
                <div className="space-y-4 max-w-xs">
                    <h2 className="text-xl font-bold text-white">{t.archive.sessionExpired}</h2>
                    <p className="text-sm text-muted-foreground">{t.archive.cannotIdentify}</p>
                    <button onClick={() => router.push('/login')} className="w-full bg-primary text-white py-3 rounded-xl font-bold min-h-[44px]">{t.archive.backToLogin}</button>
                </div>
            </div>
        );
    }

    // Collect all training days for this swimmer
    const allEntries: TrainingDayEntry[] = [];

    // 1. Standalone plans
    const myPlans = plans.filter(p => p.group === currentUser.group);
    for (const p of myPlans) {
        const attended = attendance.some(a => a.swimmerId === currentUser!.id && a.date === p.date);
        allEntries.push({ date: p.date, type: 'standalone', plan: p, attended });
    }

    // 2. Weekly plan sessions
    for (const wp of weeklyPlans) {
        if (!isWeeklyPlanVisible(wp, currentUser)) continue;
        for (const session of (wp.sessions || [])) {
            const attended = attendance.some(a => a.swimmerId === currentUser!.id && a.date === session.date);
            allEntries.push({
                date: session.date,
                type: 'weekly',
                plan: session,
                weeklyPlanTitle: wp.title || `${wp.weekStart}周`,
                attended,
            });
        }
    }

    // Sort by date descending
    allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter to current viewing month
    const monthEntries = allEntries.filter(e => {
        const d = new Date(e.date + "T12:00:00");
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const navigateMonth = (dir: -1 | 1) => {
        setViewMonth(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + dir);
            return next;
        });
    };

    // Stats
    const totalTrainingDays = allEntries.length;
    const attendedDays = allEntries.filter(e => e.attended).length;
    const weeklyPlanCount = allEntries.filter(e => e.type === 'weekly').length;
    const totalFeedback = allFeedbackItems.length;
    const coachReplies = allFeedbackItems.filter(item => {
        if (item.type === 'weekly') return item.data.coachReply;
        if (item.type === 'targeted') return item.data.coachReply;
        return false;
    }).length;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
                <div className="p-4 max-w-2xl mx-auto">
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Link href="/workout" className="hover:text-white transition-colors">训练</Link>
                        <ChevronRightIcon className="w-3 h-3" />
                        <span className="text-white font-medium">档案</span>
                    </nav>
                    <div className="flex items-center justify-between">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="text-center">
                            <h1 className="text-lg font-bold text-white">训练档案</h1>
                            <p className="text-xs text-muted-foreground">Training Archive</p>
                        </div>
                        <button onClick={() => router.push("/workout")} className="p-2 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                            <Waves className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-card/50 border border-border/50 rounded-xl p-2">
                    <button
                        onClick={() => setActiveTab('training')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]",
                            activeTab === 'training'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <FolderOpen className="w-4 h-4" />
                        {t.archive.trainingRecords}
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]",
                            activeTab === 'feedback'
                                ? "bg-purple-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {t.archive.feedbackHistory}
                    </button>
                </div>

                {/* Training Records Tab */}
                {activeTab === 'training' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.totalTrainingDays}</p>
                                <p className="text-lg font-bold text-white">{totalTrainingDays}</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.attended}</p>
                                <p className="text-lg font-bold text-green-400">{attendedDays}</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.weeklyPlans}</p>
                                <p className="text-lg font-bold text-blue-400">{weeklyPlanCount}</p>
                            </div>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between bg-card/50 border border-border/50 rounded-xl p-3">
                            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <h2 className="text-sm font-bold text-white">
                                {viewMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                disabled={viewMonth.getMonth() === new Date().getMonth() && viewMonth.getFullYear() === new Date().getFullYear()}
                                className={cn(
                                    "p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center",
                                    viewMonth.getMonth() === new Date().getMonth() && viewMonth.getFullYear() === new Date().getFullYear()
                                        ? "text-white/20 cursor-default"
                                        : "hover:bg-white/10 text-white"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Training Days */}
                        {monthEntries.length > 0 ? (
                            <div className="space-y-3">
                                {monthEntries.map((entry, idx) => {
                                    const d = new Date(entry.date + "T12:00:00");
                                    const isSelected = selectedEntry === entry;
                                    return (
                                        <div key={`${entry.date}-${idx}`} className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
                                            <div
                                                onClick={() => setSelectedEntry(isSelected ? null : entry)}
                                                className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs",
                                                        entry.attended ? "bg-green-500 text-black" : "bg-white/10 text-white"
                                                    )}>
                                                        {d.getDate()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">
                                                            {d.toLocaleDateString('zh-CN', { weekday: 'short' })} {t.archive.training}
                                                        </p>
                                                        {entry.type === 'weekly' && entry.weeklyPlanTitle && (
                                                            <p className="text-xs text-blue-400">{t.archive.weeklyPlan}: {entry.weeklyPlanTitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {entry.plan.focus && <span className="text-xs text-muted-foreground">{entry.plan.focus}</span>}
                                                    {isSelected ? <ChevronRight className="w-4 h-4 text-primary rotate-90" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="p-4 border-t border-border bg-black/20">
                                                    <SessionRenderer session={entry.plan} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl">
                                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground">{t.archive.noRecords} — {viewMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</p>
                            </div>
                        )}
                    </>
                )}

                {/* Feedback History Tab */}
                {activeTab === 'feedback' && (
                    <>
                        {/* Feedback Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.totalFeedback}</p>
                                <p className="text-lg font-bold text-white">{totalFeedback}</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.coachReplies}</p>
                                <p className="text-lg font-bold text-green-400">{coachReplies}</p>
                            </div>
                            <div className="bg-card/50 p-4 rounded-2xl border border-border/50 text-center col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase">{t.archive.pendingReplies}</p>
                                <p className="text-lg font-bold text-orange-400">{totalFeedback - coachReplies}</p>
                            </div>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between bg-card/50 border border-border/50 rounded-xl p-3">
                            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <h2 className="text-sm font-bold text-white">
                                {viewMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                disabled={viewMonth.getMonth() === new Date().getMonth() && viewMonth.getFullYear() === new Date().getFullYear()}
                                className={cn(
                                    "p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center",
                                    viewMonth.getMonth() === new Date().getMonth() && viewMonth.getFullYear() === new Date().getFullYear()
                                        ? "text-white/20 cursor-default"
                                        : "hover:bg-white/10 text-white"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Feedback Loading */}
                        {feedbackLoading && (
                            <div className="text-center py-12">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-xs text-muted-foreground">加载反馈历史...</p>
                            </div>
                        )}

                        {/* Feedback Items */}
                        {!feedbackLoading && monthFeedback.length > 0 && (
                            <div className="space-y-3">
                                {monthFeedback.map((item, idx) => (
                                    <FeedbackCard key={`${item.type}-${item.data.id}-${idx}`} item={item} />
                                ))}
                            </div>
                        )}

                        {!feedbackLoading && monthFeedback.length === 0 && (
                            <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl">
                                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground">{viewMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} 没有反馈记录</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Bottom Tab Bar */}
            <BottomTabBar />

            {/* Wave Animation */}
            <WaveAnimation />
        </div>
    );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
    const [expanded, setExpanded] = useState(false);

    if (item.type === 'block') {
        const bf = item.data;
        const d = new Date(bf.createdAt);
        return (
            <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
                <div onClick={() => setExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white">专项反馈</p>
                            <p className="text-xs text-muted-foreground">{d.toLocaleDateString('zh-CN')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {bf.reaction === 'like' && <ThumbsUp className="w-4 h-4 text-green-400 fill-green-400" />}
                            {bf.reaction === 'dislike' && <ThumbsDown className="w-4 h-4 text-red-400 fill-red-400" />}
                            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                        </div>
                    </div>
                </div>
                {expanded && (
                    <div className="p-4 border-t border-border bg-black/20 space-y-2">
                        {bf.comment && <p className="text-sm text-white whitespace-pre-wrap">{bf.comment}</p>}
                        {bf.tags && bf.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {bf.tags.map((tag: string) => (
                                    <span key={tag} className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (item.type === 'weekly') {
        const wf = item.data;
        const d = new Date(wf.submittedAt || wf.createdAt);
        return (
            <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
                <div onClick={() => setExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white">周总结</p>
                            <p className="text-xs text-muted-foreground">{wf.weekStart} 周</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {wf.isReplied && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">已批复</span>}
                            {!wf.isReplied && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">待批复</span>}
                            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                        </div>
                    </div>
                </div>
                {expanded && (
                    <div className="p-4 border-t border-border bg-black/20 space-y-3">
                        {wf.summary && (
                            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                                <p className="text-xs text-primary font-bold mb-1">我的总结</p>
                                <p className="text-sm text-white whitespace-pre-wrap">{wf.summary}</p>
                            </div>
                        )}
                        {wf.dailyFeedbacks?.filter((df: any) => df.reflection).map((df: any) => (
                            <div key={df.id} className="bg-white/5 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground font-bold mb-1">{df.date} 日记</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{df.reflection}</p>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-xs text-blue-400">RPE: {df.rpe}</span>
                                    <span className="text-xs text-orange-400">酸痛: {df.soreness}</span>
                                </div>
                            </div>
                        ))}
                        {wf.coachReply && (
                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                <p className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> 教练批复
                                    {wf.repliedAt && <span className="text-muted-foreground font-normal ml-1">({new Date(wf.repliedAt).toLocaleDateString()})</span>}
                                </p>
                                <p className="text-sm text-white whitespace-pre-wrap">{wf.coachReply}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (item.type === 'targeted') {
        const tf = item.data;
        const d = new Date(tf.createdAt);
        return (
            <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
                <div onClick={() => setExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white">专项回复</p>
                            <p className="text-xs text-muted-foreground">{tf.reminderMessage?.substring(0, 30)}{tf.reminderMessage?.length > 30 ? '...' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {tf.coachReply && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">已批复</span>}
                            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                        </div>
                    </div>
                </div>
                {expanded && (
                    <div className="p-4 border-t border-border bg-black/20 space-y-3">
                        {tf.reminderMessage && (
                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                                <p className="text-xs text-orange-400 font-bold mb-1">教练提问</p>
                                <p className="text-sm text-white">{tf.reminderMessage}</p>
                                {tf.periodStart && tf.periodEnd && (
                                    <p className="text-xs text-muted-foreground mt-1">周期: {tf.periodStart} 至 {tf.periodEnd}</p>
                                )}
                            </div>
                        )}
                        <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground font-bold mb-1">我的回复</p>
                            <p className="text-sm text-white whitespace-pre-wrap">{tf.content}</p>
                            <div className="flex gap-3 mt-1">
                                <span className="text-xs text-blue-400">RPE: {tf.rpe}</span>
                                <span className="text-xs text-orange-400">酸痛: {tf.soreness}</span>
                            </div>
                        </div>
                        {tf.coachReply && (
                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                <p className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> 教练批复
                                    {tf.repliedAt && <span className="text-muted-foreground font-normal ml-1">({new Date(tf.repliedAt).toLocaleDateString()})</span>}
                                </p>
                                <p className="text-sm text-white whitespace-pre-wrap">{tf.coachReply}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return null;
}
