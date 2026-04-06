"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";
import {
    CheckCircle2,
    XCircle,
    Calendar,
    Users,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    BarChart3,
} from "lucide-react";

export default function CoachAttendancePage() {
    const { swimmers, attendance, markAttendance, unmarkAttendance } = useStore();

    // Date navigation
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateISOString(new Date()));

    const goToDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(getLocalDateISOString(d));
    };

    const isToday = selectedDate === getLocalDateISOString(new Date());

    // Group filter
    const [groupFilter, setGroupFilter] = useState<"All" | "Junior" | "Intermediate" | "Advanced">("All");

    // Filtered swimmers
    const filteredSwimmers = useMemo(() => {
        return swimmers.filter(s => groupFilter === "All" || s.group === groupFilter);
    }, [swimmers, groupFilter]);

    // Check attendance for one swimmer on selected date
    const isPresent = (swimmerId: string) => {
        return attendance.some(a => a.swimmerId === swimmerId && a.date === selectedDate);
    };

    // Stats
    const presentCount = filteredSwimmers.filter(s => isPresent(s.id)).length;
    const absentCount = filteredSwimmers.length - presentCount;
    const attendanceRate = filteredSwimmers.length > 0 ? Math.round((presentCount / filteredSwimmers.length) * 100) : 0;

    // Toggle check-in
    const handleToggle = async (swimmerId: string) => {
        if (isPresent(swimmerId)) {
            await unmarkAttendance(swimmerId, selectedDate);
        } else {
            await markAttendance(swimmerId, selectedDate);
        }
    };

    // Select all / deselect all
    const handleSelectAll = async () => {
        for (const s of filteredSwimmers) {
            if (!isPresent(s.id)) {
                await markAttendance(s.id, selectedDate);
            }
        }
    };

    const handleDeselectAll = async () => {
        for (const s of filteredSwimmers) {
            if (isPresent(s.id)) {
                await unmarkAttendance(s.id, selectedDate);
            }
        }
    };

    // Format display date
    const displayDate = (() => {
        const d = new Date(selectedDate + "T12:00:00");
        return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    })();

    const GROUP_LABELS: Record<string, string> = {
        All: "全部",
        Junior: "初级组",
        Intermediate: "中级组",
        Advanced: "高级组",
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">出勤管理</h1>
                    <p className="text-sm text-muted-foreground">管理队员训练出勤打卡，查看统计数据</p>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => goToDate(-1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-bold text-white flex items-center gap-2 justify-center">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            {displayDate}
                        </p>
                        {isToday && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">今天</span>
                        )}
                    </div>
                    <button
                        onClick={() => goToDate(1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-muted-foreground font-bold">到场</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{presentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <UserX className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-muted-foreground font-bold">缺席</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{absentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-muted-foreground font-bold">到场率</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{attendanceRate}%</p>
                </div>
            </div>

            {/* Group Filter + Batch Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex p-1 bg-card/30 border border-border rounded-xl overflow-x-auto no-scrollbar">
                    {(["All", "Advanced", "Intermediate", "Junior"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setGroupFilter(tab)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all",
                                groupFilter === tab
                                    ? "bg-emerald-500 text-white shadow-lg"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {GROUP_LABELS[tab]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSelectAll}
                        className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-lg font-bold transition-colors"
                    >
                        全部到场
                    </button>
                    <button
                        onClick={handleDeselectAll}
                        className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded-lg font-bold transition-colors"
                    >
                        全部清除
                    </button>
                </div>
            </div>

            {/* Swimmer List */}
            <div className="space-y-2">
                {filteredSwimmers.length === 0 && (
                    <p className="text-center text-muted-foreground py-12">暂无队员，请先到"运动员"页面添加。</p>
                )}
                {filteredSwimmers.map((swimmer) => {
                    const present = isPresent(swimmer.id);
                    return (
                        <button
                            key={swimmer.id}
                            onClick={() => handleToggle(swimmer.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                present
                                    ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                                    : "bg-card border-border hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                                    present
                                        ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                        : "bg-secondary text-muted-foreground"
                                )}>
                                    {swimmer.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">{swimmer.name}</p>
                                    <p className="text-xs text-muted-foreground">{GROUP_LABELS[swimmer.group] || swimmer.group}</p>
                                </div>
                            </div>
                            {present ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <XCircle className="w-6 h-6 text-muted-foreground/30" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
