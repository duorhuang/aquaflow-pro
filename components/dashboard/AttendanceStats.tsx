"use client";

import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";

export function AttendanceStats() {
    const { t } = useLanguage();
    const { attendance, swimmers } = useStore();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Group attendance by date
    const attendanceByDate: Record<string, number> = {};
    attendance.forEach(record => {
        // Filter by current month
        if (new Date(record.date).getMonth() === currentMonth) {
            attendanceByDate[record.date] = (attendanceByDate[record.date] || 0) + 1;
        }
    });

    // Get last 7 days or valid days for simple visualization
    // Let's look at the whole month stats simply
    const maxAttendance = swimmers.length;

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    Month Attendance
                </h3>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                    {today.toLocaleString('en-US', { month: 'short' })}
                </span>
            </div>

            <div className="space-y-3">
                {/* Show stats for recent Active days (reverse chron) */}
                {Object.entries(attendanceByDate)
                    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                    .slice(0, 5) // Show last 5 active days
                    .map(([date, count]) => (
                        <div key={date} className="flex items-center gap-4">
                            <div className="w-12 text-xs font-mono text-muted-foreground text-right">
                                {new Date(date).getDate()}th
                            </div>
                            <div className="flex-1 bg-secondary/50 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${(count / maxAttendance) * 100}%` }}
                                />
                            </div>
                            <div className="w-8 text-xs font-bold text-white text-right">
                                {count}/{maxAttendance}
                            </div>
                        </div>
                    ))}

                {Object.keys(attendanceByDate).length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                        No checked-in activity this month.
                    </p>
                )}
            </div>

            <div className="pt-2 border-t border-white/5 flex gap-4">
                <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-white">
                        {Object.keys(attendanceByDate).length}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Active Days</div>
                </div>
                <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-white">
                        {attendance.filter(a => new Date(a.date).getMonth() === currentMonth).length}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Total Check-ins</div>
                </div>
            </div>
        </div>
    );
}
