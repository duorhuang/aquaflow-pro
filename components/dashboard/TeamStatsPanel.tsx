"use client";

import { useStoreSelector } from "@/lib/store";
import { BarChart3, TrendingUp, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";
import { memo } from "react";

export const TeamStatsPanel = memo(function TeamStatsPanel() {
    const { swimmers, plans, attendance, performances } = useStoreSelector(s => ({
        swimmers: s.swimmers, plans: s.plans, attendance: s.attendance, performances: s.performances
    }));

    // Calculate this month's stats
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const GROUP_MAP: Record<string, string> = { "Advanced": "高级组", "Intermediate": "中级组", "Junior": "初级组", "External": "校外组" };

    // Total distance this month (Advanced group only)
    const monthPlans = plans.filter(p => p.date.startsWith(thisMonth));
    const advancedMonthPlans = monthPlans.filter(p => p.group === "Advanced");
    const totalDistance = advancedMonthPlans.reduce((sum, p) => sum + (p.totalDistance || 0), 0);

    // Average attendance rate — count expected attendances per swimmer group
    const monthAttendance = attendance.filter(a => a.date.startsWith(thisMonth));
    const expectedAttendances = swimmers.reduce((total, swimmer) => {
        const swimmerPlans = monthPlans.filter(p => p.group === swimmer.group);
        return total + swimmerPlans.length;
    }, 0);
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
            const load = dayPlans.reduce((sum, p) => sum + (p.totalDistance || 0), 0);
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
        acc[plan.group].distance += (plan.totalDistance || 0);
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
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    团队统计
                </h3>
                <span className="text-xs text-muted-foreground">
                    {now.toLocaleDateString('zh-CN', { month: 'long' })}
                </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="bg-secondary/40 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">高级组距离</span>
                    </div>
                    <p className="text-lg font-semibold font-mono text-foreground">
                        {(totalDistance / 1000).toFixed(1)}k
                    </p>
                </div>

                <div className="bg-secondary/40 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">出勤率</span>
                    </div>
                    <p className="text-lg font-semibold font-mono text-foreground">
                        {attendanceRate}%
                    </p>
                </div>
            </div>

            {/* Weekly Load Chart */}
            <div className="mb-5 space-y-2.5">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    本周负荷 (高级组)
                </h4>
                <div className="bg-secondary/25 rounded-lg p-3 h-36 flex items-end justify-between gap-2 border border-border">
                    {weeklyStats.map((stat) => {
                        const height = (stat.load / maxWeekLoad) * 100;
                        return (
                            <div key={stat.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group">
                                {stat.load > 0 && (
                                    <div className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-4">
                                        {Math.round(stat.load / 100) / 10}k
                                    </div>
                                )}
                                <div className="w-full bg-secondary/80 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                    <div
                                        className={cn(
                                            "w-full transition-all duration-300 rounded-t-sm",
                                            stat.isToday ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                                        )}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[11px]",
                                    stat.isToday ? "text-primary font-semibold" : "text-muted-foreground"
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
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">组别里程对比</h4>
                {Object.entries(groupStats).map(([group, stats]) => {
                    const percentage = totalDistance > 0 ? (stats.distance / totalDistance) * 100 : 0;
                    const barWidth = (stats.distance / maxGroupDistance) * 100;

                    return (
                        <div key={group} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground">{GROUP_MAP[group] || group}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {(stats.distance / 1000).toFixed(1)}k ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});