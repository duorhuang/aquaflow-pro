"use client";

import { AttendanceCalendar } from "@/components/athlete/AttendanceCalendar";
import { PerformanceList } from "@/components/athlete/PerformanceTracker";
import { TrainingHistory } from "@/components/athlete/TrainingHistory";
import { BlockFeedbackPanel } from "@/components/athlete/BlockFeedbackPanel";
import { WeeklyFeedbackForm } from "@/components/athlete/WeeklyFeedbackForm";
import { TargetedFeedbackForm } from "@/components/athlete/TargetedFeedbackForm";
import { CoachReplyPanel } from "@/components/athlete/CoachReplyPanel";
import { api } from "@/lib/api-client";
import { LogOut, Calendar, FolderOpen, Activity, History, Quote, MessageSquare, ArrowRightLeft, Target, ClipboardList, ArrowRight } from "lucide-react";
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
    const { plans, swimmers, attendance, updateSwimmer, weeklyPlans, isLoaded: storeLoaded } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);

        // Load pending reminder count for badge
        loadPendingReminders(storedId);
    }, [swimmers, router]);

    const loadPendingReminders = async (swimmerId: string) => {
        try {
            const res = await api.feedbackReminders.getForSwimmer(swimmerId);
            const pending = res.filter((r: any) => !r.isResponded);
            setPendingReminders(pending.length);
        } catch (e) {
            console.error("Failed to load reminders count", e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("aquaflow_athlete_id");
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

    // Get plan for selected date
    const getSelectedDatePlan = (): (TrainingPlan & { isDerived?: boolean }) | null => {
        if (!currentUser) return null;
        const dateStr = getLocalDateISOString(selectedDate);
        
        // 1. Try to find a standalone daily plan
        const dayPlans = plans.filter(p =>
            p.date === dateStr &&
            p.group === currentUser.group
        );

        if (dayPlans.length > 0) return dayPlans[0];

        // 2. FALLBACK: Derive from Weekly Plans if no daily plan exists
        // [V12-SYNC-BRIDGE]
        for (const wp of weeklyPlans) {
            const session = wp.sessions?.find((s: any) => s.date === dateStr);
            if (session) {
                console.log('🔗 Mapping weekly session to daily view:', session.label);
                return {
                    id: `derived-${session.id}`,
                    date: dateStr,
                    group: currentUser.group,
                    totalDistance: 0, // Weekly sessions might not have distance field
                    focus: session.label,
                    imageUrl: session.imageUrl || session.imageData,
                    blocks: [],
                    isDerived: true, // Metadata for UI info
                    targetedNotes: {}
                };
            }
        }

        return null;
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

    if (isLoading || !storeLoaded) {
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

    const selectedPlan = getSelectedDatePlan();
    const myNote = (selectedPlan?.targetedNotes && currentUser) ? selectedPlan.targetedNotes[currentUser.id] : null;
    const monthlyStats = getMonthlyStats();
    const next7Days = getNext7Days();

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

                {/* EMERGENCY DATA ALERT */}
                {(!plans || plans.length === 0) && activeTab === 'training' && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <p className="text-[11px] text-orange-200">系统数据暂时离线，请刷新重试或联系教练检查网络。</p>
                    </div>
                )}

                {/* Tab Content: Training Section (Merged Plan + Weekly) */}
                {activeTab === 'training' && (
                    <div className="space-y-6">
                        {/* Date Selector */}
                        <div className="bg-card/30 border border-border rounded-xl p-4">
                            <label className="text-xs text-muted-foreground mb-2 block">选择日期 (查看今日或导出周大纲)</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="flex-1 bg-secondary border border-white/10 rounded-lg px-4 py-2 text-white font-medium"
                                >
                                    {next7Days.map(date => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                                        return (
                                            <option key={dateStr} value={dateStr}>
                                                {isToday ? '今天 - ' : ''}{date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button 
                                    onClick={() => {
                                        const container = document.getElementById('weekly-view');
                                        container?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-xs font-bold"
                                >
                                    本周大纲
                                </button>
                            </div>
                        </div>

                        {/* Plan Content */}
                        {selectedPlan ? (
                            <>
                                {/* Derived indicator */}
                                {selectedPlan.isDerived && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-2xl flex items-center gap-3">
                                        <FolderOpen className="w-4 h-4 text-purple-400" />
                                        <p className="text-[11px] text-purple-200">
                                            正在显示本周大纲中的训练截图
                                        </p>
                                    </div>
                                )}
                                {/* Coach Note */}
                                {myNote && (
                                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-5 rounded-3xl relative overflow-hidden shadow-lg">
                                        <p className="text-white text-lg font-medium italic">"{myNote}"</p>
                                    </div>
                                )}
                                {/* Image / Blocks */}
                                <div className="bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5">
                                    {selectedPlan.imageUrl && (
                                        <img src={selectedPlan.imageUrl} className="w-full rounded-2xl mb-4" onClick={() => window.open(selectedPlan.imageUrl, '_blank')} />
                                    )}
                                    <div className="text-4xl font-mono font-bold text-white mb-2">{selectedPlan.totalDistance}m</div>
                                    <div className="text-xs text-muted-foreground uppercase">{selectedPlan.focus}</div>
                                </div>
                                {/* Full Weekly Section at bottom */}
                                <div id="weekly-view" className="pt-10">
                                    <h2 className="text-lg font-bold text-white mb-4">📂 本周大纲全集</h2>
                                    {weeklyPlans.map(wp => (
                                        <div key={wp.id} className="bg-card/20 border border-border rounded-2xl p-4 space-y-4">
                                            {wp.sessions?.map((s: any) => (
                                                <div key={s.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                                    <p className="text-sm font-bold text-white mb-2">{s.label} ({s.date})</p>
                                                    {(s.imageUrl || s.imageData) && <img src={s.imageUrl || s.imageData} className="w-full rounded-lg" />}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 opacity-50">还没有发布该日期的计划</div>
                        )}
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

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4">
                                {new Date().toLocaleDateString('zh-CN', { month: 'long' })} 统计
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/20 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground mb-1">总游泳距离</p>
                                    <p className="text-2xl font-bold text-primary">{monthlyStats.totalDistance.toLocaleString()}m</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground mb-1">训练天数</p>
                                    <p className="text-2xl font-bold text-blue-400">{monthlyStats.trainingDays}天</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground mb-1">完成率</p>
                                    <p className="text-2xl font-bold text-green-400">{monthlyStats.completionRate}%</p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4">
                                    <p className="text-xs text-muted-foreground mb-1">连续打卡</p>
                                    <p className="text-2xl font-bold text-yellow-400">{currentUser.currentStreak || 0}天</p>
                                </div>
                            </div>

                            {/* Progress to Goal */}
                            <div className="bg-black/20 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-muted-foreground">本月目标: 50,000m</p>
                                    <p className="text-xs font-bold text-primary">
                                        {Math.round((monthlyStats.totalDistance / 50000) * 100)}%
                                    </p>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${Math.min((monthlyStats.totalDistance / 50000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attendance Calendar */}
                        <AttendanceCalendar swimmerId={currentUser.id} />
                    </div>
                )}
            </main>
        </div>
    );
}
