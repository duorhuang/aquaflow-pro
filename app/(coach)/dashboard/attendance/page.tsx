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
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-foreground font-medium">{t.common.attendance}</span>
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight">出勤管理</h1>
                    <p className="text-xs text-muted-foreground">管理队员训练出勤打卡，查看统计数据</p>
                </div>
                <div className="ml-auto">
                    <Link href="/dashboard/attendance/stats">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border text-foreground rounded-lg font-medium text-xs hover:bg-secondary/80 transition-colors">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            统计报表
                        </button>
                    </Link>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => goToDate(-1)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2 justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                            {displayDate}
                        </p>
                        {isToday && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium inline-block mt-0.5">今天</span>
                        )}
                    </div>
                    <button
                        onClick={() => goToDate(1)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-muted-foreground font-medium">已确认</span>
                    </div>
                    <p className="text-xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs text-muted-foreground font-medium">待确认</span>
                    </div>
                    <p className="text-xl font-semibold font-mono text-amber-600 dark:text-amber-400">{athletePresentCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">未标记</span>
                    </div>
                    <p className="text-xl font-semibold font-mono text-muted-foreground">{pendingCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">到场率</span>
                    </div>
                    <p className="text-xl font-semibold font-mono text-primary">{attendanceRate}%</p>
                </div>
            </div>

            {/* Group Filter + Batch Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex p-1 bg-secondary border border-border rounded-lg overflow-x-auto no-scrollbar">
                    {GROUP_LEVEL_ORDER.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setGroupFilter(tab)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                                groupFilter === tab
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            )}
                        >
                            {GROUP_LABELS[tab]}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSelectAll}
                        className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors border border-emerald-500/20"
                    >
                        全部到场
                    </button>
                    <button
                        onClick={handleDeselectAll}
                        className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-1.5 rounded-lg font-medium transition-colors border border-destructive/20"
                    >
                        全部清除
                    </button>
                </div>
            </div>

            {/* Swimmer List */}
            <div className="space-y-2">
                {filteredSwimmers.length === 0 && (
                    <p className="text-center text-muted-foreground py-12 text-sm">暂无队员，请先到&ldquo;运动员&rdquo;页面添加。</p>
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
                                "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors duration-150 active:scale-[0.99]",
                                isPresent
                                    ? "bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10"
                                    : isAthletePresent
                                        ? "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                                    : isPending
                                        ? "bg-card/40 border-dashed border-border hover:bg-secondary/40"
                                        : "bg-card border-border hover:bg-secondary/40"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center font-medium text-xs transition-colors",
                                    isPresent
                                        ? "bg-emerald-600 text-white"
                                        : isAthletePresent
                                            ? "bg-amber-500 text-white"
                                            : isPending
                                                ? "bg-secondary text-muted-foreground"
                                                : "bg-secondary text-muted-foreground"
                                )}>
                                    {swimmer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">{swimmer.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPending ? "未标记 · 点击打卡 · " : isAthletePresent ? "已自查 · 待确认 · " : ""}{GROUP_LABELS[swimmer.group] || swimmer.group}
                                    </p>
                                    {swimmer.status === "Injured" && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <AlertTriangle className="w-3 h-3 text-destructive" />
                                            <span className="text-xs text-destructive font-medium">
                                                {swimmer.injuryNote || "受伤中"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isPresent ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isAthletePresent ? (
                                <UserCheck className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Clock className="w-5 h-5 text-muted-foreground/30" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
