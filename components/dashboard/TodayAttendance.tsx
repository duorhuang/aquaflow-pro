"use client";

import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { Users, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { memo } from "react";

export const TodayAttendance = memo(function TodayAttendance() {
    const { swimmers, attendance, plans } = useStore();
    const { t } = useLanguage();
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const todayAttendance = attendance.filter(a => a.date === today);

    // Get today's plans to know who should attend
    const todayPlans = plans.filter(p => p.date === today);
    const expectedSwimmers = swimmers.filter(s =>
        todayPlans.some(p => p.group === s.group)
    );

    // Calculate attendance
    const attendedIds = new Set(todayAttendance.map(a => a.swimmerId));
    const attendedSwimmers = expectedSwimmers.filter(s => attendedIds.has(s.id));
    const absentSwimmers = expectedSwimmers.filter(s => !attendedIds.has(s.id));

    const attendanceRate = expectedSwimmers.length > 0
        ? Math.round((attendedSwimmers.length / expectedSwimmers.length) * 100)
        : 0;

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <Link href="/dashboard/attendance" className="group flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="查看今日考勤详情">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {t.dashboard.todayAttendance}
                    </h3>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-foreground">
                        {attendedSwimmers.length}<span className="text-muted-foreground font-normal">/{expectedSwimmers.length}</span>
                    </span>
                </div>
            </div>

            {/* Attendance Rate */}
            {expectedSwimmers.length > 0 && (
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">{t.dashboard.attendanceRate}</span>
                        <span className={cn(
                            "text-xs font-semibold",
                            attendanceRate >= 80 ? "text-success" :
                                attendanceRate >= 60 ? "text-warning" : "text-destructive"
                        )}>
                            {attendanceRate}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                attendanceRate >= 80 ? "bg-success" :
                                    attendanceRate >= 60 ? "bg-warning" : "bg-destructive"
                            )}
                            style={{ width: `${attendanceRate}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Swimmer List */}
            <div className="max-h-[200px] overflow-y-auto divide-y divide-border no-scrollbar">
                {attendedSwimmers.map(swimmer => {
                    const record = todayAttendance.find(a => a.swimmerId === swimmer.id);
                    const time = record ? new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '';

                    return (
                        <div key={swimmer.id} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                                <span className="text-sm text-foreground">{swimmer.name}</span>
                                <span className="text-xs text-muted-foreground">({swimmer.group})</span>
                            </div>
                            <span className="text-xs text-success font-medium">{time}</span>
                        </div>
                    );
                })}

                {absentSwimmers.map(swimmer => (
                    <div key={swimmer.id} className="flex items-center justify-between px-4 py-2.5 opacity-50">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{swimmer.name}</span>
                            <span className="text-xs text-muted-foreground">({swimmer.group})</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.dashboard.notCheckedIn}</span>
                    </div>
                ))}

                {expectedSwimmers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground px-4">
                        <AlertCircle className="w-6 h-6 mb-2 opacity-40" />
                        <p className="text-xs">{t.dashboard.noTrainingTodayAttendance}</p>
                    </div>
                )}
            </div>
        </div>
    );
});