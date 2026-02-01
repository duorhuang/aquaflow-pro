"use client";

import { useStore } from "@/lib/store";
import { BarChart3, TrendingUp, Users, Trophy, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";

export function TeamStatsPanel() {
    const { swimmers, plans, attendance, performances } = useStore();

    // Calculate this month's stats
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const GROUP_MAP: Record<string, string> = { "Advanced": "高级组", "Intermediate": "中级组", "Junior": "初级组" };

    // Total distance this month (Advanced group only)
    const monthPlans = plans.filter(p => p.date.startsWith(thisMonth));
    const advancedMonthPlans = monthPlans.filter(p => p.group === "Advanced");
    const totalDistance = advancedMonthPlans.reduce((sum, p) => sum + p.totalDistance, 0);

    // Average attendance rate
    const monthAttendance = attendance.filter(a => a.date.startsWith(thisMonth));
    const expectedAttendances = monthPlans.length * swimmers.length;
    const attendanceRate = expectedAttendances > 0
        ? Math.round((monthAttendance.length / expectedAttendances) * 100)
        : 0;

    // Active swimmers (attended at least once this month)
    const activeSwimmerIds = new Set(monthAttendance.map(a => a.swimmerId));
    const activeCount = activeSwimmerIds.size;

    // PB count this month
    const monthPerformances = performances.filter(p => p.date.startsWith(thisMonth));
    const pbCount = monthPerformances.filter(p => p.isPB).length;

    // Weekly Load Analysis
    const getWeeklyStats = () => {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7; // 1-7
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return {
                dateStr: getLocalDateISOString(d),
                label: d.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', ''),
                isToday: getLocalDateISOString(d) === getLocalDateISOString(today)
            };
        });

        const stats = days.map(day => {
            // Only show Advanced group for weekly load
            const dayPlans = plans.filter(p => p.date === day.dateStr && p.group === "Advanced");
            const load = dayPlans.reduce((sum, p) => sum + p.totalDistance, 0);
            return { ...day, load };
        });

        return stats;
    };

    const weeklyStats = getWeeklyStats();
    const maxWeekLoad = Math.max(1, ...weeklyStats.map(s => s.load));

    // Group breakdown - calculate distance per group directly from plans
    const groupStats = monthPlans.reduce((acc, plan) => {
        if (!acc[plan.group]) {
            acc[plan.group] = { distance: 0, count: 0 };
        }
        acc[plan.group].distance += plan.totalDistance;
        acc[plan.group].count++;
        return acc;
    }, {} as Record<string, { distance: number; count: number }>);

    // Count swimmers per group
    swimmers.forEach(swimmer => {
        if (!groupStats[swimmer.group]) {
            groupStats[swimmer.group] = { distance: 0, count: 0 };
        }
    });

    const maxGroupDistance = Math.max(...Object.values(groupStats).map(g => g.distance), 1);

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    团队统计
                </h3>
                <span className="text-xs text-muted-foreground">
                    {now.toLocaleDateString('zh-CN', { month: 'long' })}
                </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">高级组距离</span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                        {(totalDistance / 1000).toFixed(1)}k
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-muted-foreground">出勤率</span>
                    </div>
                    <p className="text-xl font-bold text-blue-400">
                        {attendanceRate}%
                    </p>
                </div>
            </div>

            {/* Weekly Load Chart */}
            <div className="mb-6 space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    本周负荷 (高级组)
                </h4>
                <div className="bg-black/20 rounded-xl p-4 h-40 flex items-end justify-between gap-2 border border-white/5">
                    {weeklyStats.map((stat) => {
                        const height = (stat.load / maxWeekLoad) * 100;
                        return (
                            <div key={stat.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                                {stat.load > 0 && (
                                    <div className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-4">
                                        {Math.round(stat.load / 100) / 10}k
                                    </div>
                                )}
                                <div className="w-full bg-white/5 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                    <div
                                        className={cn(
                                            "w-full transition-all duration-500 rounded-t-sm",
                                            stat.isToday ? "bg-primary" : "bg-white/20 group-hover:bg-white/30"
                                        )}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px]",
                                    stat.isToday ? "text-primary font-bold" : "text-muted-foreground"
                                )}>
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Group Breakdown */}
            <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">组别里程对比</h4>
                {Object.entries(groupStats).map(([group, stats]) => {
                    const percentage = (stats.distance / totalDistance) * 100;
                    const barWidth = (stats.distance / maxGroupDistance) * 100;

                    return (
                        <div key={group} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-white">{GROUP_MAP[group] || group}</span>
                                <span className="text-xs text-muted-foreground">
                                    {(stats.distance / 1000).toFixed(1)}k ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
