import { useStore } from "@/lib/store";
import { getLocalDateISOString } from "@/lib/date-utils";
import { ChevronLeft, ChevronRight, Download, Calendar, Users, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AttendanceStatsPage() {
    const { swimmers, attendance } = useStore();
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('zh-CN', { month: 'long' });
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter attendance for the current month
    const monthlyAttendance = useMemo(() => {
        return attendance.filter(record => {
            const date = new Date(record.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    }, [attendance, year, month]);

    // Check if swimmer was present on a specific day
    const isPresent = (swimmerId: string, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return monthlyAttendance.some(r => r.swimmerId === swimmerId && r.date === dateStr);
    };

    // Calculate stats per swimmer
    const swimmerStats = useMemo(() => {
        // Unique active person-days for summary
        const activePairs = new Set();
        monthlyAttendance.forEach(r => activePairs.add(`${r.swimmerId}-${r.date}`));
        const uniqueActiveCount = activePairs.size;

        const stats = swimmers.map(s => {
            const attendedDays = daysArray.filter(d => isPresent(s.id, d)).length;
            return {
                ...s,
                attendedDays,
                percent: daysInMonth > 0 ? (attendedDays / daysInMonth * 100).toFixed(1) : "0"
            };
        }).sort((a, b) => b.attendedDays - a.attendedDays);

        return { stats, uniqueActiveCount };
    }, [swimmers, monthlyAttendance, daysArray]);

    const changeMonth = (offset: number) => {
        const next = new Date(year, month + offset, 1);
        setViewDate(next);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border p-6 rounded-2xl">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Link href="/dashboard/attendance" className="hover:text-primary flex items-center gap-1 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> 考勤管理
                        </Link>
                        <span>/</span>
                        <span className="text-white">出勤统计报表</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        {year}年 {monthName} 出勤统计
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-black/40 border border-border rounded-xl p-1">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-lg text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 text-sm font-bold text-white min-w-[100px] text-center">
                            {monthName}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-lg text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/80 transition-all text-sm font-bold">
                        <Download className="w-4 h-4" /> 导出报表
                    </button>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                    <p className="text-emerald-400 text-sm font-medium mb-1">平均出勤率</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                            {(swimmerStats.stats.reduce((acc: number, s) => acc + parseFloat(s.percent), 0) / (swimmers.length || 1)).toFixed(1)}%
                        </span>
                        <span className="text-emerald-400 text-xs font-bold">↑ 2.4%</span>
                    </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
                    <p className="text-blue-400 text-sm font-medium mb-1">本月活跃人次</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{swimmerStats.uniqueActiveCount}</span>
                        <span className="text-blue-400 text-xs font-bold">人 · 天</span>
                    </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                    <p className="text-purple-400 text-sm font-medium mb-1">全勤人数</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                            {swimmerStats.stats.filter(s => s.attendedDays === daysInMonth).length}
                        </span>
                        <span className="text-purple-400 text-xs font-bold">人</span>
                    </div>
                </div>
            </div>

            {/* Attendance Grid */}
            <div className="bg-card/40 border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="sticky left-0 z-10 bg-secondary/80 backdrop-blur-md p-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-32 min-w-[120px]">
                                    队员姓名
                                </th>
                                {daysArray.map(day => (
                                    <th key={day} className="p-2 text-center text-[10px] font-bold text-muted-foreground border-l border-border/10 min-w-[32px]">
                                        {day}
                                    </th>
                                ))}
                                <th className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider border-l border-border bg-black/20">
                                    总计
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {swimmerStats.stats.map(swimmer => (
                                <tr key={swimmer.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="sticky left-0 z-10 bg-card/90 backdrop-blur-md p-4 flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{swimmer.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{swimmer.group}</span>
                                    </td>
                                    {daysArray.map(day => {
                                        const present = isPresent(swimmer.id, day);
                                        return (
                                            <td key={day} className="p-1 border-l border-border/10">
                                                <div className={cn(
                                                    "w-6 h-6 mx-auto rounded flex items-center justify-center transition-all",
                                                    present 
                                                        ? "bg-emerald-500/20 text-emerald-400" 
                                                        : "bg-black/20 text-transparent"
                                                )}>
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="p-4 text-center text-sm font-mono font-bold text-white border-l border-border bg-black/10">
                                        {swimmer.attendedDays}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
