"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Check, Calendar as CalendarIcon } from "lucide-react";

export function AttendanceCalendar({ swimmerId }: { swimmerId: string }) {
    const { attendance, markAttendance } = useStore();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Get starting day of week (0-6)
    const startDay = new Date(currentYear, currentMonth, 1).getDay();

    const todayStr = today.toISOString().split('T')[0];
    const hasCheckedInToday = attendance.some(a => a.swimmerId === swimmerId && a.date === todayStr);

    const handleCheckIn = () => {
        markAttendance(swimmerId);
    };

    const getDayStatus = (day: number) => {
        const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0]; // Note: this might be off by timezone if not careful, but simpler:
        // Better: Construct string manually to match 'YYYY-MM-DD'
        const d = new Date(currentYear, currentMonth, day);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;

        return attendance.some(a => a.swimmerId === swimmerId && a.date === formatted);
    };

    return (
        <div className="bg-card border border-border p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Training Log
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {today.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {!hasCheckedInToday ? (
                    <button
                        onClick={handleCheckIn}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg animate-pulse"
                    >
                        Check In
                    </button>
                ) : (
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border border-green-500/50">
                        <Check className="w-4 h-4" />
                        Done
                    </div>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-xs font-bold text-muted-foreground py-2">{d}</div>
                ))}

                {/* Empty slots for start of month */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate();
                    const isChecked = getDayStatus(day);

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all relative",
                                isChecked
                                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(100,255,218,0.3)]"
                                    : "bg-secondary/30 text-muted-foreground",
                                isToday && !isChecked && "border-2 border-primary text-primary"
                            )}
                        >
                            {day}
                            {isChecked && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Total Sessions: {attendance.filter(a => a.swimmerId === swimmerId && new Date(a.date).getMonth() === currentMonth).length}</span>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" /> Attended
                </span>
            </div>
        </div>
    );
}
