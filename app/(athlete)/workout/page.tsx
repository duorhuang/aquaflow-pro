"use client";

import { FeedbackForm } from "@/components/athlete/FeedbackForm";
import { AttendanceCalendar } from "@/components/athlete/AttendanceCalendar";
import { LogOut, MessageSquareQuote, Calendar, Activity, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { TrainingPlan, Swimmer } from "@/types";
import { useRouter } from "next/navigation";

export default function AthleteWorkoutPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { plans, swimmers, attendance, updateSwimmer } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'plan' | 'status' | 'stats'>('plan');

    // Status form
    const [readiness, setReadiness] = useState(95);
    const [injuryNote, setInjuryNote] = useState("");

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
        }
        setIsLoading(false);
    }, [swimmers, router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleSaveStatus = () => {
        if (!currentUser) return;
        updateSwimmer(currentUser.id, {
            readiness,
            injuryNote,
            lastProfileUpdate: new Date().toISOString()
        });
        alert('状态已更新！');
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
        const dateStr = selectedDate.toISOString().split('T')[0];
        const dayPlans = plans.filter(p =>
            p.date === dateStr &&
            p.group === currentUser.group
        );
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
                <div className="flex gap-2 bg-card/30 border border-border rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'plan'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        今日训练
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'status'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        我的状态
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'stats'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        月度统计
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

                        {/* Coach Note */}
                        {myNote && (
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3">
                                <MessageSquareQuote className="w-5 h-5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">教练备注</p>
                                    <p className="text-sm text-white italic">"{myNote}"</p>
                                </div>
                            </div>
                        )}

                        {/* Plan Display */}
                        {selectedPlan ? (
                            <>
                                {/* Plan Summary */}
                                <div className="bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5">
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
                                                                {item.equipment?.map(e => (
                                                                    <span key={e} className="text-xs border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">{e}</span>
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Check-in */}
                                <FeedbackForm />
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
