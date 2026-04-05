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
    const { plans, swimmers, attendance, updateSwimmer } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'plan' | 'weekly' | 'memberFeedback' | 'trainingFeedback' | 'history' | 'performance' | 'status' | 'stats'>('plan');
    const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
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

        // Load weekly plans
        loadWeeklyPlans();

        // Load pending reminder count for badge
        loadPendingReminders(storedId);
    }, [swimmers, router]);

    const loadWeeklyPlans = async () => {
        try {
            const plans = await api.weeklyPlans.getAll();
            setWeeklyPlans(plans.filter((p: any) => p.isPublished));
        } catch (e) {
            console.error("Failed to load weekly plans", e);
        }
    };

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
    const getSelectedDatePlan = (): TrainingPlan | null => {
        if (!currentUser) return null;
        const dateStr = getLocalDateISOString(selectedDate);
        const dayPlans = plans.filter(p =>
            p.date === dateStr &&
            p.group === currentUser.group
        );

        // Debug logging
        if (dayPlans.length > 0) {
            console.log('📅 Found plan for date:', dateStr);
            console.log('👤 Current user ID:', currentUser.id);
            console.log('📝 Targeted notes:', dayPlans[0].targetedNotes);
        }

        return dayPlans.length > 0 ? dayPlans[0] : null;
    };

    // Calculate monthly stats
    const getMonthlyStats = () => {
        if (!currentUser) return { totalDistance: 0, trainingDays: 0, completionRate: 0 };

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthPlans = plans.filter(p => {
            const planDate = new Date(p.date);
            return planDate >= firstDay &&
                planDate <= now &&
                p.group === currentUser.group;
        });

        const totalDistance = monthPlans.reduce((sum, p) => sum + p.totalDistance, 0);
        const trainingDays = monthPlans.length;

        // Calculate completion rate from attendance
        const monthAttendance = attendance.filter(a => {
            const attDate = new Date(a.date);
            return attDate >= firstDay &&
                attDate <= now &&
                a.swimmerId === currentUser.id;
        });

        const completionRate = trainingDays > 0
            ? Math.round((monthAttendance.length / trainingDays) * 100)
            : 0;

        return { totalDistance, trainingDays, completionRate };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading...</p>
            </div>
        );
    }

    if (!currentUser) return null;

    const selectedPlan = getSelectedDatePlan();
    const myNote = selectedPlan?.targetedNotes?.[currentUser.id];
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
                                <p className="text-[10px] text-muted-foreground">{xp} XP</p>
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
                <div className="flex overflow-x-auto hide-scrollbar gap-2 bg-card/30 border border-border rounded-xl p-2">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'plan'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        ⚡️ 今日任务
                    </button>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all relative",
                            activeTab === 'weekly'
                                ? "bg-purple-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        📂 本周大纲
                        {weeklyPlans.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse border border-white" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('memberFeedback')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'memberFeedback'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        📝 队员反馈
                    </button>
                    <button
                        onClick={() => setActiveTab('trainingFeedback')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all relative",
                            activeTab === 'trainingFeedback'
                                ? "bg-orange-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        🎯 训练反馈
                        {pendingReminders > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                                {pendingReminders}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'history'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        历史记录
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'performance'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        成绩考核
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'status'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        更新状态
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={cn(
                            "flex-none py-2 px-4 rounded-lg text-[12px] font-bold transition-all",
                            activeTab === 'stats'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        我的统计
                    </button>
                </div>

                {/* Tab Content: Training Plan */}
                {activeTab === 'plan' && (
                    <div className="space-y-6">
                        {/* Date Selector */}
                        <div className="bg-card/30 border border-border rounded-xl p-4">
                            <label className="text-xs text-muted-foreground mb-2 block">选择日期</label>
                            <select
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-white font-medium"
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
                        </div>

                        {/* Coach Note Section - Distinct and Separate */}
                        {myNote && (
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-5 rounded-3xl relative overflow-hidden shadow-lg animate-in slide-in-from-top-4 duration-500">
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <MessageSquare className="w-12 h-12 text-yellow-400" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                                        <Quote className="w-4 h-4" />
                                        Coach's Special Note (教练寄语)
                                    </h3>
                                    <p className="text-white text-lg font-medium italic leading-relaxed">
                                        "{myNote}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Plan Display */}
                        {selectedPlan ? (
                            <>
                                {/* Plan Summary */}
                                <div className="bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5">
                                    {selectedPlan.imageUrl ? (
                                        <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 relative group">
                                            <img
                                                src={selectedPlan.imageUrl}
                                                alt="Training Plan"
                                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                                onClick={() => window.open(selectedPlan.imageUrl, '_blank')}
                                            />
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white/80 pointer-events-none">
                                                点击查看大图
                                            </div>
                                        </div>
                                    ) : null}

                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">总距离</p>
                                    <div className="text-4xl font-mono font-bold text-white mb-2">{selectedPlan.totalDistance}m</div>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white">
                                            {selectedPlan.focus}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">
                                            {selectedPlan.blocks?.reduce((acc, b) => acc + b.items.length, 0) || 0} Sets
                                        </span>
                                    </div>
                                </div>

                                {/* Blocks */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white">训练详情</h2>
                                    {selectedPlan.blocks?.map((block) => (
                                        <div key={block.id} className="space-y-3">
                                            <div className="flex items-center gap-3 px-2">
                                                <div className="h-px flex-1 bg-white/10" />
                                                <span className="text-xs uppercase font-bold text-primary tracking-widest">{block.type}</span>
                                                {block.rounds > 1 && <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded">{block.rounds} Rounds</span>}
                                                <div className="h-px flex-1 bg-white/10" />
                                            </div>

                                            <div className={cn("space-y-3", block.rounds > 1 && "border-l-2 border-primary/30 pl-3 ml-2")}>
                                                {block.items.map((item, idx) => (
                                                    <div key={item.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4">
                                                        <div className="flex-none w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-mono font-bold text-muted-foreground">
                                                            <span>{idx + 1}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-lg text-white">
                                                                    {item.repeats > 1 ? `${item.repeats} x ` : ""}
                                                                    {item.distance}m
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs font-bold px-2 py-0.5 rounded",
                                                                    item.intensity === "High" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                                                )}>{item.intensity}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                <span className="text-sm text-primary font-medium">{item.stroke}</span>
                                                                {item.alternateStroke && (
                                                                    <span className="text-sm text-purple-400 font-medium flex items-center gap-1">
                                                                        <ArrowRightLeft className="w-3 h-3" />
                                                                        {item.alternateStroke}
                                                                    </span>
                                                                )}
                                                                {item.equipment?.map(e => (
                                                                    <span key={e} className="text-xs border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">{e}</span>
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Block Feedback */}
                                            <BlockFeedbackPanel
                                                planId={selectedPlan.id}
                                                blockId={block.id}
                                                swimmerId={currentUser.id}
                                                blockName={`${block.type} (${block.items.length} items)`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Guide to Member Feedback */}
                                <button
                                    onClick={() => setActiveTab('memberFeedback')}
                                    className="w-full bg-gradient-to-r from-primary/15 to-blue-500/15 border border-primary/25 rounded-2xl p-5 flex items-center justify-between group hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">训练结束了？去打卡 →</p>
                                            <p className="text-xs text-muted-foreground">记录今日 RPE、酸痛和训练反思</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-card/30 border border-dashed border-border rounded-xl">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-white mb-2">今天没有训练计划</h3>
                                <p className="text-sm text-muted-foreground">请联系教练或查看其他日期</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Weekly Training */}
                {activeTab === 'weekly' && currentUser && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-purple-400" />
                            本周训练计划
                        </h2>

                        {weeklyPlans.length > 0 ? (
                            weeklyPlans.map((plan: any) => (
                                <div key={plan.id} className="bg-card/30 border border-border rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-border">
                                        <h3 className="font-bold text-white">{plan.title || `${plan.weekStart} 周训练`}</h3>
                                        <p className="text-xs text-muted-foreground">{plan.weekStart} ~ {plan.weekEnd}</p>
                                        {plan.coachNotes && (
                                            <p className="text-xs text-primary mt-2 bg-primary/10 rounded-lg p-2">教练备注: {plan.coachNotes}</p>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {plan.sessions?.map((session: any) => (
                                            <div key={session.id} className="bg-black/20 rounded-xl p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="w-4 h-4 text-purple-400" />
                                                    <span className="font-bold text-white text-sm">{session.label}</span>
                                                    <span className="text-xs text-muted-foreground">{session.date}</span>
                                                </div>
                                                {(session.imageData || session.imageUrl) && (
                                                    <img
                                                        src={session.imageData || session.imageUrl}
                                                        alt={session.label}
                                                        className="w-full max-h-[400px] object-contain rounded-lg mb-2 cursor-zoom-in"
                                                        onClick={() => window.open(session.imageData || session.imageUrl, '_blank')}
                                                    />
                                                )}
                                                {session.notes && (
                                                    <p className="text-xs text-muted-foreground">{session.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-card/30 border border-dashed border-border rounded-xl">
                                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-white mb-2">本周没有新训练计划</h3>
                                <p className="text-sm text-muted-foreground">教练发布后将显示在这里</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: 队员反馈 (Member Feedback — daily diary + coach replies) */}
                {activeTab === 'memberFeedback' && currentUser && (
                    <div className="space-y-6">
                        {/* Guide Card */}
                        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-none mt-0.5">
                                    <ClipboardList className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">📝 队员反馈 — 每日训练打卡</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        每天训练后，展开当天的行，记录你的 RPE（疲劳度）、酸痛感和训练反思。
                                        <span className="text-primary font-medium"> 周末提交周总结，教练会收到并给予批语。</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <WeeklyFeedbackForm swimmerId={currentUser.id} weekStart={currentWeekStart} />

                        {/* Coach Replies Section */}
                        <CoachReplyPanel swimmerId={currentUser.id} />
                    </div>
                )}

                {/* Tab Content: 训练反馈 (Coach-Initiated Training Feedback) */}
                {activeTab === 'trainingFeedback' && currentUser && (
                    <div className="space-y-6">
                        {/* Guide Card */}
                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-none mt-0.5">
                                    <Target className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">🎯 训练反馈 — 教练发起的问卷</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        教练会不定期发起专项提问（例如：技术改进、身体感受等）。
                                        <span className="text-orange-400 font-medium"> 请尽快回答，教练将即时查看。</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <TargetedFeedbackForm swimmerId={currentUser.id} />
                    </div>
                )}

                {/* Tab Content: Status Update */}
                {activeTab === 'status' && (
                    <div className="space-y-6">
                        <div className="bg-card/30 border border-border rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                身体状态
                            </h2>

                            {/* Readiness Slider */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">
                                    Readiness: <span className={cn(
                                        "font-bold",
                                        readiness >= 80 ? "text-green-400" : readiness >= 60 ? "text-yellow-400" : "text-red-400"
                                    )}>{readiness}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={readiness}
                                    onChange={(e) => setReadiness(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>疲劳</span>
                                    <span>良好</span>
                                    <span>最佳</span>
                                </div>
                            </div>

                            {/* Status Mode Toggle */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">
                                    当前状态 (Status)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setStatus("Active")}
                                        className={cn(
                                            "py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            status === "Active"
                                                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                : "bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80"
                                        )}
                                    >
                                        <Activity className="w-4 h-4" />
                                        Active (训练中)
                                    </button>
                                    <button
                                        onClick={() => setStatus("Resting")}
                                        className={cn(
                                            "py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            status === "Resting"
                                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                                                : "bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80"
                                        )}
                                    >
                                        <History className="w-4 h-4" />
                                        Resting (休息/伤病)
                                    </button>
                                </div>
                            </div>

                            {/* Injury Note */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">
                                    🤕 伤病报告
                                </label>
                                <textarea
                                    value={injuryNote}
                                    onChange={(e) => setInjuryNote(e.target.value)}
                                    placeholder="例如：右肩轻微疼痛，需要注意..."
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-3 text-white text-sm min-h-[100px] resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSaveStatus}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:brightness-110 transition-all"
                            >
                                保存状态
                            </button>
                        </div>

                        {/* Current Status Display */}
                        <div className="bg-card/30 border border-border rounded-xl p-6">
                            <h3 className="text-sm font-bold text-white mb-3">当前状态</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Readiness:</span>
                                    <span className={cn(
                                        "font-bold",
                                        currentUser.readiness >= 80 ? "text-green-400" :
                                            currentUser.readiness >= 60 ? "text-yellow-400" : "text-red-400"
                                    )}>{currentUser.readiness}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">状态:</span>
                                    <span className={cn(
                                        "font-bold",
                                        currentUser.status === "Active" ? "text-green-400" : "text-orange-400"
                                    )}>{currentUser.status}</span>
                                </div>
                                {currentUser.currentStreak && currentUser.currentStreak > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">连续打卡:</span>
                                        <span className="font-bold text-yellow-400">🔥 {currentUser.currentStreak} 天</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Monthly Stats */}
                {/* Tab Content: Training History */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <TrainingHistory swimmerId={currentUser.id} />
                    </div>
                )}

                {/* Tab Content: Performance */}
                {activeTab === 'performance' && (
                    <div className="space-y-6">
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
