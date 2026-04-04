"use client";

import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, Plus, Copy, FileText, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
    const router = useRouter();
    const { plans, swimmers, addPlan } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get training data for each date
    const getTrainingForDate = (date: Date) => {
        const dateStr = getLocalDateISOString(date);
        return plans.filter(p => p.date === dateStr);
    };

    // Intensity color coding (green->yellow->red based on total distance)
    const getIntensityColor = (distance: number): string => {
        if (distance >= 5000) return 'bg-red-500';      // High intensity
        if (distance >= 4000) return 'bg-orange-500';   // Medium-high
        if (distance >= 3000) return 'bg-yellow-500';   // Medium
        if (distance >= 2000) return 'bg-green-500';    // Normal
        if (distance > 0) return 'bg-green-300';        // Low
        return 'transparent';
    };

    const getIntensityBg = (distance: number): string => {
        if (distance >= 5000) return 'bg-red-500/20';
        if (distance >= 4000) return 'bg-orange-500/20';
        if (distance >= 3000) return 'bg-yellow-500/20';
        if (distance >= 2000) return 'bg-green-500/20';
        if (distance > 0) return 'bg-green-300/20';
        return '';
    };

    const getTotalDistance = (trainings: typeof plans) => {
        return trainings.reduce((sum, t) => sum + t.totalDistance, 0);
    };

    // Get last week's plan for same day
    const getLastWeekPlan = (date: Date) => {
        const lastWeek = new Date(date);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const dateStr = getLocalDateISOString(lastWeek);
        return plans.find(p => p.date === dateStr);
    };

    // Navigation
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Handle date click
    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        setSelectedDate(date);
        setShowModal(true);
    };

    // Copy last week's plan
    const copyLastWeekPlan = () => {
        if (!selectedDate) return;
        const lastWeekPlan = getLastWeekPlan(selectedDate);
        if (lastWeekPlan) {
            const newPlan = {
                ...lastWeekPlan,
                id: crypto.randomUUID(),
                date: getLocalDateISOString(selectedDate),
                status: 'Draft' as const,
            };
            addPlan(newPlan);
            setShowModal(false);
            router.push(`/dashboard/plan/${newPlan.id}`);
        }
    };

    // Generate calendar days
    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月",
        "七月", "八月", "九月", "十月", "十一月", "十二月"];

    const today = new Date();
    const isToday = (day: number) => {
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    // Get swimmers with issues
    const swimmersWithIssues = swimmers.filter(s =>
        (s.readiness && s.readiness < 70) || (s.injuryNote && s.injuryNote.trim())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">训练日程表</h1>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/new-plan"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        新建计划
                    </Link>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors"
                    >
                        今天
                    </button>
                </div>
            </div>

            {/* Injury Warning Panel */}
            {swimmersWithIssues.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-sm font-bold text-red-400">⚠️ 队员状态预警</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {swimmersWithIssues.map(s => (
                            <div key={s.id} className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-lg text-xs">
                                <span className="font-bold text-white">{s.name}</span>
                                {s.readiness && s.readiness < 70 && (
                                    <span className="text-red-300">Readiness: {s.readiness}%</span>
                                )}
                                {s.injuryNote && (
                                    <span className="text-orange-300 max-w-[150px] truncate">({s.injuryNote})</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-card/30 border border-border rounded-xl p-4">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-bold text-white">
                    {monthNames[month]} {year}
                </h2>
                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card/30 border border-border rounded-xl p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const date = new Date(year, month, day);
                        const trainings = getTrainingForDate(date);
                        const totalDistance = getTotalDistance(trainings);
                        const hasTraining = trainings.length > 0;

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    "aspect-square border border-border rounded-lg p-2 relative group hover:border-primary/50 transition-all cursor-pointer",
                                    isToday(day) && "ring-2 ring-primary",
                                    hasTraining && getIntensityBg(totalDistance)
                                )}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isToday(day) ? "text-primary font-bold" : "text-white"
                                        )}>
                                            {day}
                                        </span>
                                        {!hasTraining && (
                                            <Plus className="w-3 h-3 text-white/0 group-hover:text-white/50 transition-colors" />
                                        )}
                                    </div>

                                    {hasTraining && (
                                        <div className="flex-1 flex flex-col justify-end gap-1 mt-1">
                                            <div className="text-[10px] font-mono font-bold text-white/80">
                                                {totalDistance}m
                                            </div>
                                            {trainings.map((training, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "h-1.5 rounded-full",
                                                        getIntensityColor(training.totalDistance)
                                                    )}
                                                    title={`${training.group}: ${training.totalDistance}m`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Hover Tooltip */}
                                {hasTraining && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                        <div className="bg-black/90 border border-primary/30 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                                            <div className="font-bold text-primary mb-1">
                                                {date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                            </div>
                                            {trainings.map((t, idx) => (
                                                <div key={idx} className="text-white">
                                                    {t.group}: <span className="text-green-400">{t.totalDistance}m</span>
                                                    {t.focus && <span className="text-muted-foreground ml-1">({t.focus})</span>}
                                                </div>
                                            ))}
                                            <div className="text-muted-foreground mt-1 pt-1 border-t border-white/10">
                                                点击编辑或添加
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Intensity Legend */}
            <div className="bg-card/30 border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">训练强度分布</h3>
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-300" />
                        <span className="text-xs text-muted-foreground">轻量 (&lt;2000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span className="text-xs text-muted-foreground">正常 (2000-3000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500" />
                        <span className="text-xs text-muted-foreground">中强度 (3000-4000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span className="text-xs text-muted-foreground">较高 (4000-5000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500" />
                        <span className="text-xs text-muted-foreground">高强度 (5000m+)</span>
                    </div>
                </div>
            </div>

            {/* Add Plan Modal */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Check if there's a plan for this date */}
                            {getTrainingForDate(selectedDate).length > 0 ? (
                                <>
                                    <p className="text-sm text-muted-foreground mb-4">该日期已有计划：</p>
                                    {getTrainingForDate(selectedDate).map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/dashboard/plan/${p.id}`}
                                            className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="font-bold text-white">{p.group}</div>
                                                <div className="text-xs text-muted-foreground">{p.totalDistance}m - {p.focus}</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <div className="border-t border-white/10 pt-3 mt-3">
                                        <Link
                                            href={`/dashboard/new-plan?date=${getLocalDateISOString(selectedDate)}`}
                                            className="flex items-center gap-3 p-4 bg-primary/20 rounded-xl hover:bg-primary/30 transition-colors text-primary"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="font-bold">添加另一个组别的计划</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* New Plan Options */}
                                    <Link
                                        href={`/dashboard/new-plan?date=${getLocalDateISOString(selectedDate)}`}
                                        className="flex items-center gap-3 p-4 bg-primary/20 rounded-xl hover:bg-primary/30 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 text-primary" />
                                        <div>
                                            <div className="font-bold text-white">新建空白计划</div>
                                            <div className="text-xs text-muted-foreground">从头开始创建</div>
                                        </div>
                                    </Link>

                                    {getLastWeekPlan(selectedDate) && (
                                        <button
                                            onClick={copyLastWeekPlan}
                                            className="w-full flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-colors text-left"
                                        >
                                            <Copy className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <div className="font-bold text-white">复制上周同天计划</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {getLastWeekPlan(selectedDate)?.group} - {getLastWeekPlan(selectedDate)?.totalDistance}m
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    <Link
                                        href={`/dashboard/new-plan?date=${getLocalDateISOString(selectedDate)}&mode=photo`}
                                        className="flex items-center gap-3 p-4 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-purple-400" />
                                        <div>
                                            <div className="font-bold text-white">上传照片计划</div>
                                            <div className="text-xs text-muted-foreground">拍照上传手写板书</div>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
