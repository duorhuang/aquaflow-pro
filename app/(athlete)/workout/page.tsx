"use client";

import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
import { PerformanceList } from "@/components/athlete/PerformanceTracker";
import { TrainingHistory } from "@/components/athlete/TrainingHistory";
import { BlockFeedbackPanel } from "@/components/athlete/BlockFeedbackPanel";
import { WeeklyFeedbackForm } from "@/components/athlete/WeeklyFeedbackForm";
import { TargetedFeedbackForm } from "@/components/athlete/TargetedFeedbackForm";
import { CoachReplyPanel } from "@/components/athlete/CoachReplyPanel";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";
import { api } from "@/lib/api-client";
import { LogOut, Calendar, FolderOpen, Activity, History, Quote, MessageSquare, ArrowRightLeft, Target, ClipboardList, ArrowRight, TrendingUp, UserCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { TrainingPlan, Swimmer } from "@/types";
import { useRouter } from "next/navigation";
import { getLocalDateISOString } from "@/lib/date-utils";

export default function AthleteWorkoutPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { plans, swimmers, attendance, updateSwimmer, weeklyPlans, announcements, isLoaded: storeLoaded } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [authResolved, setAuthResolved] = useState(false);
    const [activeTab, setActiveTab] = useState<'training' | 'feedback' | 'achievements' | 'health'>('training');
    const [pendingReminders, setPendingReminders] = useState(0);

    // Get current week Monday
    const getCurrentWeekMonday = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };
    const [currentWeekStart] = useState(getCurrentWeekMonday());

    // Status form
    const [readiness, setReadiness] = useState(95);
    const [injuryNote, setInjuryNote] = useState("");
    const [status, setStatus] = useState<"Active" | "Resting" | "Injured">("Active");

    useEffect(() => {
        // Check Login Session
        const storedId = localStorage.getItem("aquaflow_athlete_id");
        if (!storedId) {
            router.push("/login");
            return;
        }

        const user = swimmers.find(s => s.id === storedId);
        if (user) {
            setCurrentUser(user);
            setReadiness(user.readiness || 95);
            setInjuryNote(user.injuryNote || "");
            if (user.status === "Active" || user.status === "Resting" || user.status === "Injured") {
                setStatus(user.status);
            }
        }
        // Only resolve authentication AFTER the store is fully populated!
        if (storeLoaded) {
            setAuthResolved(true);
        }

        // Load pending reminder count for badge
        loadPendingReminders(storedId);
    }, [swimmers, storeLoaded, router]);

    const loadPendingReminders = async (swimmerId: string) => {
        try {
            const res = await api.feedbackReminders.getForSwimmer(swimmerId);
            const pending = res.filter((r: any) => !r.isResponded);
            setPendingReminders(pending.length);
        } catch (e: any) {
            // Suppress expected 401 (auth not yet established)
            if (!e.message?.includes('API Error: 4')) {
                console.error("Failed to load reminders count", e);
            }
        }
    };

    const handleLogout = async () => {
        try { await api.auth.logout(); } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        localStorage.removeItem("aquaflow_coach_session");
        router.push('/login');
    };

    const handleSaveStatus = () => {
        if (!currentUser) return;
        updateSwimmer(currentUser.id, {
            readiness,
            injuryNote,
            status: status as "Active" | "Resting" | "Injured",
            lastProfileUpdate: new Date().toISOString()
        });
        alert('✅ 状态已更新！数据已实时同步至教练仪表板。');
    };

    // Get next 7 days for date selector
    const getNext7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    };

    // Check if a weekly plan is visible to this swimmer
    const isWeeklyPlanVisible = (wp: any): boolean => {
        if (!currentUser) return false;
        const hasGroupTarget = wp.targetGroup && wp.targetGroup.length > 0;
        const hasIndividualTarget = wp.targetSwimmerIds && wp.targetSwimmerIds.length > 0;

        // No targeting set → legacy plan visible to everyone
        if (!hasGroupTarget && !hasIndividualTarget) return true;

        // OR logic: matches group OR matches individual
        if (hasGroupTarget && wp.targetGroup.includes(currentUser.group)) return true;
        if (hasIndividualTarget && wp.targetSwimmerIds.includes(currentUser.id)) return true;

        return false;
    };

    // Get all plans/sessions for selected date
    const getSelectedDatePlans = (): (TrainingPlan & { isDerived?: boolean })[] => {
        if (!currentUser) return [];
        const dateStr = getLocalDateISOString(selectedDate);
        const dayPlansObj: (TrainingPlan & { isDerived?: boolean })[] = [];

        // 1. Standalone daily plans
        const dayPlans = plans.filter(p => p.date === dateStr && p.group === currentUser.group);
        if (dayPlans.length > 0) dayPlansObj.push(...dayPlans);

        // 2. FALLBACK: Derive from Weekly Plans if no daily plan exists
        for (const wp of weeklyPlans) {
            if (!isWeeklyPlanVisible(wp)) continue;
            const sessions = wp.sessions?.filter((s: any) => s.date === dateStr);
            if (sessions && sessions.length > 0) {
                sessions.forEach((session: any) => {
                    dayPlansObj.push({
                        id: `derived-${session.id}`,
                        date: dateStr,
                        group: currentUser.group,
                        totalDistance: 0,
                        focus: session.label,
                        imageUrl: session.imageUrl || session.imageData,
                        blocks: [],
                        isDerived: true,
                        targetedNotes: {},
                        status: "Published",
                        // Pass through session content fields for SessionRenderer
                        editorMode: session.editorMode,
                        contentBlocks: session.contentBlocks,
                        contentHtml: session.contentHtml,
                        imageData: session.imageData,
                        imageType: session.imageType,
                        notes: session.notes,
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

            // Calculate completion rate from attendance
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
                        Syncing AquaFlow Core...
                    </p>
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
    // Use the first plan's targetedNotes since targetedNotes are per day not per session
    const myNote = (selectedPlansObj.length > 0 && selectedPlansObj[0].targetedNotes && currentUser) ? selectedPlansObj[0].targetedNotes[currentUser.id] : null;
    const monthlyStats = getMonthlyStats();
    
    // Weekly Framework Logic
    const currentWeeklyPlan = weeklyPlans.find(wp =>
        wp.weekStart === currentWeekStart && isWeeklyPlanVisible(wp)
    );

    // Filter announcements visible to this swimmer
    const myAnnouncements = (announcements || []).filter((a: any) => {
        if (a.targetGroup && a.targetGroup !== currentUser?.group) return false;
        if (a.targetSwimmerIds && !a.targetSwimmerIds.includes(currentUser?.id)) return false;
        return true;
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

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header with Logout */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                            {level}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">{currentUser.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-[10px] text-muted-foreground">{xp} XP</p>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" title="Ready & Synced" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/profile" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-white" title="Profile">
                            <UserCircle className="w-5 h-5" />
                        </Link>
                        <LanguageToggle />
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                            title="登出"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {/* Tab Navigation */}
                <div className="grid grid-cols-4 gap-2 bg-card/30 border border-border rounded-xl p-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('training')}
                        className={cn(
                            "py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1",
                            activeTab === 'training'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        ⚡️ 训练
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={cn(
                            "py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 relative",
                            activeTab === 'feedback'
                                ? "bg-purple-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        📝 反馈
                        {pendingReminders > 0 && (
                            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={cn(
                            "py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1",
                            activeTab === 'achievements'
                                ? "bg-orange-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <TrendingUp className="w-4 h-4" />
                        📊 成绩
                    </button>
                    <button
                        onClick={() => setActiveTab('health')}
                        className={cn(
                            "py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1",
                            activeTab === 'health'
                                ? "bg-red-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Activity className="w-4 h-4" />
                        ❤️ 状态
                    </button>
                </div>

                {/* EMERGENCY DATA ALERT: Only show if we have NO swimmer data at all — real outage */}
                {(!swimmers || swimmers.length === 0) && activeTab === 'training' && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <p className="text-[11px] text-orange-200">系统数据暂时离线，请刷新重试或联系教练检查网络。</p>
                    </div>
                )}

                {/* Tab Content: Training Section (Merged Plan + Weekly) */}
                {activeTab === 'training' && (
                    <div className="space-y-6">
                        {/* --- COACH ANNOUNCEMENTS FEED --- */}
                        {myAnnouncements.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                    教练动态
                                </h2>
                                {myAnnouncements.map((a: any) => (
                                    <AnnouncementCard key={a.id} announcement={a} />
                                ))}
                            </div>
                        )}

                        {/* --- WEEKLY FRAMEWORK (TOP) --- */}
                        <div className="bg-card/30 border border-border rounded-xl p-4 md:p-5">
                            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-400" />
                                {currentWeeklyPlan?.title || "本周训练大纲"}
                            </h2>
                            {currentWeeklyPlan?.coachNotes && (
                                <p className="text-xs text-muted-foreground mb-4 italic">教练说：{currentWeeklyPlan.coachNotes}</p>
                            )}

                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {weekDays.map(date => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
                                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                                    
                                    // Check if this date has a session
                                    const hasSession = currentWeeklyPlan?.sessions?.some((s: any) => s.date === dateStr) || 
                                                       plans.some(p => p.date === dateStr && p.group === currentUser.group);
                                    
                                    const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', '');

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "flex flex-col items-center py-2 rounded-lg transition-all relative border",
                                                isSelected
                                                    ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(100,255,218,0.3)]"
                                                    : hasSession
                                                    ? "bg-primary/10 border-primary/20 text-white hover:bg-primary/20"
                                                    : "bg-secondary/50 border-white/5 text-muted-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <span className="text-[10px] font-bold">{dayName}</span>
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

                        {/* --- DAILY CONTEXT (BOTTOM) --- */}
                        <div className="pt-2">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-purple-400" />
                                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} 详情
                            </h3>
                            
                            {selectedPlansObj.length > 0 ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Coach Note (Only show once if present on the first session) */}
                                    {myNote && (
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-5 rounded-3xl relative overflow-hidden shadow-lg">
                                            <p className="text-white text-lg font-medium italic">"{myNote}"</p>
                                        </div>
                                    )}
                                    {/* Render each plan/session */}
                                    {selectedPlansObj.map((plan, index) => (
                                        <div key={plan.id || index} className="bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5">
                                            {plan.isDerived && (
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="inline-block bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full border border-purple-500/30">
                                                        从周大纲提取
                                                    </div>
                                                    {selectedPlansObj.length > 1 && (
                                                        <div className="text-[10px] text-muted-foreground">Session {index + 1} of {selectedPlansObj.length}</div>
                                                    )}
                                                </div>
                                            )}
                                            <SessionRenderer session={plan} className="mb-4" />
                                            {plan.totalDistance > 0 && (
                                                <div className="text-4xl font-mono font-bold text-white mb-2">{plan.totalDistance}m</div>
                                            )}
                                            <div className="text-xs text-muted-foreground uppercase">{plan.focus}</div>
                                            {/* Block Feedback Panels */}
                                            {plan.blocks && plan.blocks.length > 0 && currentUser && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">动作反馈</div>
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
                                <div className="text-center py-12 bg-card/30 border border-border rounded-3xl border-dashed">
                                    <p className="text-muted-foreground">教练没有发布当天的训练内容 🏖</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-2">提示：去『反馈』页提交日常日记吧</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content: Feedback Section (Merged Weekly + Targeted) */}
                {activeTab === 'feedback' && currentUser && (
                    <div className="space-y-6">
                        {/* Summary Header */}
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4">
                            <MessageSquare className="w-6 h-6 text-purple-400" />
                            <div>
                                <h3 className="text-sm font-bold text-white">反馈收件箱</h3>
                                <p className="text-xs text-muted-foreground">查看教练评语、完成专项任务或提交周总结</p>
                            </div>
                        </div>

                        {/* targeted feedback section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">🎯 专项任务 ({pendingReminders} 待办)</h4>
                            <TargetedFeedbackForm swimmerId={currentUser.id} />
                        </div>

                        {/* weekly feedback section */}
                        <div className="space-y-4 pt-6 border-t border-border/50">
                            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">📝 每周总结与打卡</h4>
                            <WeeklyFeedbackForm swimmerId={currentUser.id} weekStart={currentWeekStart} />
                        </div>

                        {/* coach replies */}
                        <CoachReplyPanel swimmerId={currentUser.id} />
                    </div>
                )}

                {/* Tab Content: Health & Stats (Merged) */}
                {activeTab === 'health' && (
                    <div className="space-y-6">
                        <div className="bg-card/30 border border-border rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">当前状态</h2>
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">Readiness: {readiness}%</label>
                                <input type="range" min="0" max="100" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button onClick={() => setStatus("Active")} className={cn("py-3 rounded-lg font-bold text-sm", status === "Active" ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-secondary")}>训练中</button>
                                <button onClick={() => setStatus("Resting")} className={cn("py-3 rounded-lg font-bold text-sm", status === "Resting" ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : "bg-secondary")}>休息中</button>
                            </div>
                            <button onClick={handleSaveStatus} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">保存状态</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-card/30 p-4 rounded-2xl border border-border text-center">
                                <p className="text-[10px] text-muted-foreground uppercase">本月里程</p>
                                <p className="text-lg font-bold text-white">{monthlyStats.totalDistance}m</p>
                            </div>
                            <div className="bg-card/30 p-4 rounded-2xl border border-border text-center">
                                <p className="text-[10px] text-muted-foreground uppercase">出勤天数</p>
                                <p className="text-lg font-bold text-white">{monthlyStats.trainingDays}天</p>
                            </div>
                            <div className="bg-card/30 p-4 rounded-2xl border border-border text-center">
                                <p className="text-[10px] text-muted-foreground uppercase">XP 经验值</p>
                                <p className="text-lg font-bold text-white">{xp}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Achievements (Merged) */}
                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between">
                            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                成绩与历史记录
                            </h3>
                        </div>
                        <TrainingHistory swimmerId={currentUser.id} />
                        <PerformanceList swimmerId={currentUser.id} />
                    </div>
                )}
            </main>
        </div>
    );
}
