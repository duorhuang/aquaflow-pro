"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";
import { GROUP_LEVEL_ORDER, GROUP_LABELS } from "@/lib/group-constants";
import {
    AlertTriangle,
    CheckCircle2,
    Calendar,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    TrendingUp,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link href="/dashboard" className="hover:text-white transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white font-medium">{t.common.attendance}</span>
        </nav>
    );
}

export default function CoachAttendancePage() {
    const { swimmers, attendance, markAttendance, unmarkAttendance, batchMarkAttendance, batchUnmarkAttendance } = useStore();

    // Date navigation
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateISOString(new Date()));

    const goToDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(getLocalDateISOString(d));
    };

    const isToday = selectedDate === getLocalDateISOString(new Date());

    // Group filter
    const [groupFilter, setGroupFilter] = useState<typeof GROUP_LEVEL_ORDER[number]>("All");

    // Filtered swimmers
    const filteredSwimmers = useMemo(() => {
        return (swimmers || []).filter(s => groupFilter === "All" || s.group === groupFilter);
    }, [swimmers, groupFilter]);

    // Check attendance for one swimmer on selected date
    const getAttendanceStatus = (swimmerId: string) => {
        const record = (attendance || []).find(a => a.swimmerId === swimmerId && a.date === selectedDate);
        return record ? record.status : "Pending";
    };

    // Stats
    const presentCount = filteredSwimmers.filter(s => getAttendanceStatus(s.id) === "Present").length;
    const athletePresentCount = filteredSwimmers.filter(s => getAttendanceStatus(s.id) === "AthletePresent").length;
    const pendingCount = filteredSwimmers.length - presentCount - athletePresentCount;
    const attendanceRate = filteredSwimmers.length > 0 ? Math.round(((presentCount + athletePresentCount) / filteredSwimmers.length) * 100) : 0;

    // Toggle check-in: Pending → Present → Absent → Pending
    const handleToggle = async (swimmerId: string) => {
        const status = getAttendanceStatus(swimmerId);
        if (status === "Pending" || status === "AthletePresent") {
            await markAttendance(swimmerId, selectedDate, "Present");
        } else if (status === "Present") {
            await markAttendance(swimmerId, selectedDate, "AthletePresent");
        } else {
            await unmarkAttendance(swimmerId, selectedDate);
        }
    };

    // Select all / deselect all
    const handleSelectAll = async () => {
        const toMark = filteredSwimmers.filter(s => getAttendanceStatus(s.id) !== "Present").map(s => s.id);
        if (toMark.length > 0) {
            await batchMarkAttendance(toMark, selectedDate);
        }
    };

    const handleDeselectAll = async () => {
        const toUnmark = filteredSwimmers.filter(s => getAttendanceStatus(s.id) === "Present" || getAttendanceStatus(s.id) === "AthletePresent").map(s => s.id);
        if (toUnmark.length > 0) {
            await batchUnmarkAttendance(toUnmark, selectedDate);
        }
    };

    // Format display date
    const displayDate = (() => {
        const d = new Date(selectedDate + "T12:00:00");
        return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    })();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">出勤管理</h1>
                    <p className="text-sm text-muted-foreground">管理队员训练出勤打卡，查看统计数据</p>
                </div>
                <div className="ml-auto">
                    <Link href="/dashboard/attendance/stats">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
                            <TrendingUp className="w-4 h-4" />
                            查看统计报表
                        </button>
                    </Link>
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
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-muted-foreground font-bold">已确认</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{presentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-muted-foreground font-bold">待确认</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{athletePresentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-muted-foreground font-bold">未标记</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-400">{pendingCount}</p>
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
                    {GROUP_LEVEL_ORDER.map((tab) => (
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
                    <p className="text-center text-muted-foreground py-12">暂无队员，请先到&ldquo;运动员&rdquo;页面添加。</p>
                )}
                {filteredSwimmers.map((swimmer) => {
                    const status = getAttendanceStatus(swimmer.id);
                    const isPresent = status === "Present";
                    const isAthletePresent = status === "AthletePresent";
                    const isPending = status === "Pending";

                    return (
                        <button
                            key={swimmer.id}
                            onClick={() => handleToggle(swimmer.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 active:scale-[0.98]",
                                isPresent
                                    ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                                    : isAthletePresent
                                        ? "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
                                    : isPending
                                        ? "bg-card/30 border-dashed border-border/50 hover:bg-white/5"
                                        : "bg-card border-border hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                                    isPresent
                                        ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                        : isAthletePresent
                                            ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(251,146,60,0.4)]"
                                            : isPending
                                                ? "bg-secondary/50 text-slate-400"
                                                : "bg-secondary text-muted-foreground"
                                )}>
                                    {swimmer.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white">{swimmer.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPending ? "未标记 · 点击打卡" : isAthletePresent ? "已自查 · 待确认" : ""}{GROUP_LABELS[swimmer.group] || swimmer.group}
                                    </p>
                                    {swimmer.status === "Injured" && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <AlertTriangle className="w-3 h-3 text-red-400" />
                                            <span className="text-xs text-red-400 font-medium">
                                                {swimmer.injuryNote || "受伤中"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isPresent ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : isAthletePresent ? (
                                <UserCheck className="w-6 h-6 text-orange-400" />
                            ) : (
                                <Clock className="w-6 h-6 text-slate-400/30" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
