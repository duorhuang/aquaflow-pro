"use client";

import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
    const { plans } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Get training data for each date
    const getTrainingForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return plans.filter(p => p.date === dateStr);
    };

    const getDistanceColor = (distance: number): string => {
        if (distance >= 4000) return 'bg-green-700'; // Deep green
        if (distance >= 2000) return 'bg-green-500'; // Medium green
        if (distance > 0) return 'bg-green-300';     // Light green
        return 'transparent';
    };

    const getTotalDistance = (trainings: typeof plans) => {
        return trainings.reduce((sum, t) => sum + t.totalDistance, 0);
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

    // Generate calendar days
    const calendarDays = [];
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    // Actual days
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">训练日程表</h1>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors"
                >
                    今天
                </button>
            </div>

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
                                className={cn(
                                    "aspect-square border border-border rounded-lg p-2 relative group hover:border-primary/50 transition-all cursor-pointer",
                                    isToday(day) && "ring-2 ring-primary"
                                )}
                            >
                                <div className="flex flex-col h-full">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isToday(day) ? "text-primary font-bold" : "text-white"
                                    )}>
                                        {day}
                                    </span>

                                    {hasTraining && (
                                        <div className="flex-1 flex flex-col justify-end gap-1 mt-1">
                                            {trainings.map((training, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "h-1.5 rounded-full",
                                                        getDistanceColor(training.totalDistance)
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
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            {trainings.map((t, idx) => (
                                                <div key={idx} className="text-white">
                                                    {t.group}: <span className="text-green-400">{t.totalDistance}m</span>
                                                </div>
                                            ))}
                                            <div className="text-muted-foreground mt-1 pt-1 border-t border-white/10">
                                                Total: {totalDistance}m
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-card/30 border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">训练强度分布</h3>
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-300" />
                        <span className="text-xs text-muted-foreground">低强度 (0-2000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span className="text-xs text-muted-foreground">中强度 (2000-4000m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-700" />
                        <span className="text-xs text-muted-foreground">高强度 (4000m+)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
