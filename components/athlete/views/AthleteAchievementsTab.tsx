"use client";

import { useMemo } from "react";
import { TrendingUp, Trophy, Flame, Calendar, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Swimmer, AttendanceRecord, TrainingPlan } from "@/types";
import { LEVEL_THRESHOLDS } from "@/lib/date-utils";

const TrainingHistory = dynamic(() => import("@/components/athlete/TrainingHistory").then(m => ({ default: m.TrainingHistory })), { ssr: false });
const PerformanceList = dynamic(() => import("@/components/athlete/PerformanceTracker").then(m => ({ default: m.PerformanceList })), { ssr: false });

interface AthleteAchievementsTabProps {
    currentUser: Swimmer;
    attendance: AttendanceRecord[];
    plans: TrainingPlan[];
}

export function AthleteAchievementsTab({
    currentUser,
    attendance,
    plans,
}: AthleteAchievementsTabProps) {
    const swimmerXp = currentUser.totalXp !== undefined ? currentUser.totalXp : (currentUser.xp || 0);
    const level = currentUser.level || 1;
    const currentMin = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextMin = LEVEL_THRESHOLDS[level] || (currentMin + 10000);
    const denom = nextMin - currentMin;
    const progress = denom > 0 ? Math.min(100, Math.max(0, ((swimmerXp - currentMin) / denom) * 100)) : 0;
    const streak = currentUser.currentStreak || 0;

    // Monthly stats calculation
    const monthlyStats = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${year}-${month}`;

        const monthAttendance = attendance.filter(a =>
            a.swimmerId === currentUser.id &&
            a.date.startsWith(monthPrefix) &&
            (a.status === 'Present' || a.status === 'AthletePresent')
        );

        let totalDistance = 0;
        const attendedDates = new Set(monthAttendance.map(a => a.date));
        for (const plan of plans) {
            if (plan.group === currentUser.group && attendedDates.has(plan.date)) {
                totalDistance += plan.totalDistance || 0;
            }
        }

        return {
            trainingDays: monthAttendance.length,
            totalDistance,
        };
    }, [attendance, plans, currentUser]);

    return (
        <div className="space-y-6">
            {/* Level & XP Progression Card */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider block mb-1">
                            成长等级 · LEVEL PROGRESSION
                        </span>
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-3xl font-extrabold text-foreground font-mono">
                                Lv.{level}
                            </span>
                            <span className="text-sm font-semibold text-muted-foreground">
                                浪里飞鱼
                            </span>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-xs">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>连击打卡 {streak} 天</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">当前总经验</span>
                        <span className="font-mono font-bold text-foreground">
                            {swimmerXp} / {nextMin} XP
                        </span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right">
                        距离升级还差 {Math.max(0, nextMin - swimmerXp)} XP
                    </p>
                </div>
            </div>

            {/* Monthly Training Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xs">
                    <p className="text-[11px] text-muted-foreground font-medium">本月已训练</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                        {monthlyStats.trainingDays} <span className="text-xs font-normal text-muted-foreground">天</span>
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xs">
                    <p className="text-[11px] text-muted-foreground font-medium">本月泳量</p>
                    <p className="text-2xl font-bold font-mono text-primary mt-1">
                        {monthlyStats.totalDistance.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">m</span>
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xs col-span-2 sm:col-span-1">
                    <p className="text-[11px] text-muted-foreground font-medium">累计获得 XP</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                        {swimmerXp.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Personal Bests & Performance Tracker */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                            比赛成绩与个人最佳 (PB)
                        </h4>
                    </div>
                    <Link 
                        href="/archive" 
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                        <span>历史档案</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-xs">
                    <PerformanceList swimmerId={currentUser.id} />
                </div>
            </div>

            {/* Training History & Calendar */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        出勤打卡历史
                    </h4>
                </div>
                <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 shadow-xs">
                    <TrainingHistory swimmerId={currentUser.id} />
                </div>
            </div>
        </div>
    );
}
