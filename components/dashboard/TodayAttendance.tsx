"use client";

import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { Users, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TodayAttendance() {
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
        <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <Link href="/dashboard/attendance" className="group flex items-center gap-2 hover:opacity-85 transition-opacity" aria-label="查看今日考勤详情">
                    <h3 className="text-md font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {t.dashboard.todayAttendance}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <div className="text-2xl font-bold text-primary">
                    {attendedSwimmers.length}/{expectedSwimmers.length}
                </div>
            </div>

            {/* Attendance Rate */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">{t.dashboard.attendanceRate}</span>
                    <span className={cn(
                        "text-sm font-semibold",
                        attendanceRate >= 80 ? "text-success" :
                            attendanceRate >= 60 ? "text-warning" : "text-error"
                    )}>
                        {attendanceRate}%
                    </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            attendanceRate >= 80 ? "bg-success" :
                                attendanceRate >= 60 ? "bg-warning" : "bg-error"
                        )}
                        style={{ width: `${attendanceRate}%` }}
                    />
                </div>
            </div>

            {/* Attended List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {attendedSwimmers.map(swimmer => {
                    const record = todayAttendance.find(a => a.swimmerId === swimmer.id);
                    const time = record ? new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '';

                    return (
                        <div
                            key={swimmer.id}
                            className="flex items-center justify-between p-2 bg-success/10 border border-success/20 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success" />
                                <span className="text-sm font-medium text-white">{swimmer.name}</span>
                                <span className="text-xs text-muted-foreground">({swimmer.group})</span>
                            </div>
                            <span className="text-xs text-success">{time}</span>
                        </div>
                    );
                })}

                {/* Absent List */}
                {absentSwimmers.map(swimmer => (
                    <div
                        key={swimmer.id}
                        className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg opacity-60"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">{swimmer.name}</span>
                            <span className="text-xs text-muted-foreground">({swimmer.group})</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.dashboard.notCheckedIn}</span>
                    </div>
                ))}

                {expectedSwimmers.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t.dashboard.noTrainingTodayAttendance}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
