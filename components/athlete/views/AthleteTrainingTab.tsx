"use client";

import { useState, useMemo } from "react";
import { Waves, ChevronLeft, ChevronRight, MessageSquare, Calendar, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
import { BlockFeedbackPanel } from "@/components/athlete/BlockFeedbackPanel";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";
import { MeetCountdown } from "@/components/athlete/MeetCountdown";
import { Swimmer, TrainingPlan, WeeklyPlan } from "@/types";
import { getLocalDateISOString } from "@/lib/date-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

interface AthleteTrainingTabProps {
    currentUser: Swimmer;
    plans: TrainingPlan[];
    weeklyPlans: WeeklyPlan[];
    announcements: any[];
    archivedAnnouncements: any[];
}

export function AthleteTrainingTab({
    currentUser,
    plans,
    weeklyPlans,
    announcements,
    archivedAnnouncements,
}: AthleteTrainingTabProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showArchive, setShowArchive] = useState(false);
    const [archiveLimit, setArchiveLimit] = useState(5);

    // Calculate start of week (Monday)
    const weekStartMonday = useMemo(() => {
        const d = new Date(selectedDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [selectedDate]);

    // Format week start date
    const weekStartStr = useMemo(() => getLocalDateISOString(weekStartMonday), [weekStartMonday]);

    // Visibility filter for weekly plan
    const currentWeeklyPlan = useMemo(() => {
        return weeklyPlans.find(wp => {
            if (wp.weekStart !== weekStartStr) return false;
            const targetGroup: string[] = Array.isArray(wp.targetGroup)
                ? wp.targetGroup
                : typeof wp.targetGroup === 'string' ? (() => { try { return JSON.parse(wp.targetGroup || '[]'); } catch { return []; } })() : [];
            const targetSwimmerIds: string[] = Array.isArray(wp.targetSwimmerIds)
                ? wp.targetSwimmerIds
                : typeof wp.targetSwimmerIds === 'string' ? (() => { try { return JSON.parse(wp.targetSwimmerIds || '[]'); } catch { return []; } })() : [];

            if (targetGroup.length === 0 && targetSwimmerIds.length === 0) return true;
            if (targetGroup.length > 0 && targetGroup.includes(currentUser.group)) return true;
            if (targetSwimmerIds.length > 0 && targetSwimmerIds.includes(currentUser.id)) return true;
            return false;
        });
    }, [weeklyPlans, weekStartStr, currentUser]);

    // Days of current selected week
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(weekStartMonday);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [weekStartMonday]);

    const selectedDateStr = useMemo(() => getLocalDateISOString(selectedDate), [selectedDate]);

    // Sessions for selected date
    const daySessions = useMemo(() => {
        if (!currentWeeklyPlan?.sessions) return [];
        return currentWeeklyPlan.sessions
            .filter(s => s.date === selectedDateStr)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }, [currentWeeklyPlan, selectedDateStr]);

    // Direct plans for selected date
    const directPlans = useMemo(() => {
        return plans.filter(p => p.date === selectedDateStr && p.group === currentUser.group);
    }, [plans, selectedDateStr, currentUser]);

    // Filter announcements visible to this swimmer
    const myAnnouncements = useMemo(() => {
        return announcements.filter(a => {
            if (a.targetGroup && a.targetGroup !== currentUser.group) return false;
            if (a.targetSwimmerIds && !a.targetSwimmerIds.includes(currentUser.id)) return false;
            return true;
        });
    }, [announcements, currentUser]);

    const navigateDay = (offset: number) => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + offset);
        setSelectedDate(next);
    };

    const navigateWeek = (offset: number) => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + offset * 7);
        setSelectedDate(next);
    };

    const isToday = (d: Date) => {
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const isSelected = (d: Date) => {
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    };

    const dayNames = ["一", "二", "三", "四", "五", "六", "日"];

    return (
        <div className="space-y-6">
            {/* Meet Countdown Widget */}
            <MeetCountdown />

            {/* Coach Announcements / News */}
            {myAnnouncements.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            <span>教练动态与通知</span>
                        </h2>
                        {archivedAnnouncements.length > 0 && (
                            <button
                                onClick={() => setShowArchive(!showArchive)}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                {showArchive ? (
                                    <>收起往期 <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>查看往期 ({archivedAnnouncements.length}) <ChevronDown className="w-3 h-3" /></>
                                )}
                            </button>
                        )}
                    </div>
                    {myAnnouncements.map((a: any) => (
                        <AnnouncementCard key={a.id} announcement={a} />
                    ))}
                    {showArchive && (
                        <div className="pt-2 space-y-2.5">
                            {archivedAnnouncements.slice(0, archiveLimit).map((a: any) => (
                                <div key={a.id} className="opacity-75">
                                    <AnnouncementCard announcement={a} />
                                </div>
                            ))}
                            {archivedAnnouncements.length > archiveLimit && (
                                <button
                                    onClick={() => setArchiveLimit(prev => prev + 5)}
                                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2"
                                >
                                    展开更多往期公告...
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly Navigation Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                {/* Week Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="上一周"
                        aria-label="上一周"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="text-center">
                        <h3 className="font-bold text-sm text-foreground flex items-center justify-center gap-2">
                            <Waves className="w-4 h-4 text-primary" />
                            <span>{currentWeeklyPlan?.title || "本周训练周历"}</span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {weekStartStr} 至 {getLocalDateISOString(weekDays[6])}
                        </p>
                    </div>

                    <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="下一周"
                        aria-label="下一周"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Day selector tabs */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekDays.map((dateObj, idx) => {
                        const selected = isSelected(dateObj);
                        const today = isToday(dateObj);
                        const dateNum = dateObj.getDate();
                        const dsStr = getLocalDateISOString(dateObj);
                        const hasSession = currentWeeklyPlan?.sessions?.some(s => s.date === dsStr);

                        return (
                            <button
                                key={dsStr}
                                onClick={() => setSelectedDate(dateObj)}
                                className={cn(
                                    "flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all relative min-h-[58px]",
                                    selected
                                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                        : today
                                            ? "bg-primary/15 text-primary border border-primary/30 font-medium"
                                            : "bg-secondary/40 text-foreground hover:bg-secondary/80"
                                )}
                            >
                                <span className="text-[10px] opacity-80">周{dayNames[idx]}</span>
                                <span className="text-base font-bold font-mono mt-0.5">{dateNum}</span>
                                {hasSession && (
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full mt-1",
                                        selected ? "bg-primary-foreground" : "bg-primary"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Training Content */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{selectedDateStr} 训练安排</span>
                        {isToday(selectedDate) && (
                            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                                今日
                            </span>
                        )}
                    </h3>

                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="text-xs text-primary hover:underline font-medium"
                    >
                        回到今日
                    </button>
                </div>

                {/* Render Sessions from Weekly Plan */}
                {daySessions.length > 0 && (
                    <div className="space-y-4">
                        {daySessions.map((session) => (
                            <div key={session.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div>
                                        <h4 className="font-bold text-base text-foreground">{session.label || "训练课"}</h4>
                                        {session.primaryStroke && (
                                            <span className="text-xs text-primary font-medium">主项：{session.primaryStroke}</span>
                                        )}
                                    </div>
                                    {session.totalDistance && session.totalDistance > 0 ? (
                                        <span className="text-xs font-mono font-bold bg-secondary px-3 py-1 rounded-full text-foreground">
                                            {session.totalDistance} 米
                                        </span>
                                    ) : null}
                                </div>

                                <SessionRenderer session={session} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Render direct plans if any */}
                {directPlans.length > 0 && (
                    <div className="space-y-4">
                        {directPlans.map((plan) => (
                            <div key={plan.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div>
                                        <h4 className="font-bold text-base text-foreground">{plan.group} 计划</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">{plan.focus}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-secondary px-3 py-1 rounded-full text-foreground">
                                        {plan.totalDistance} 米
                                    </span>
                                </div>

                                {plan.coachNotes && (
                                    <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/50 text-xs text-foreground leading-relaxed">
                                        <span className="font-bold text-primary block mb-1">教练寄语：</span>
                                        {plan.coachNotes}
                                    </div>
                                )}

                                {/* Training Blocks */}
                                {Array.isArray(plan.blocks) && (
                                    <div className="space-y-3">
                                        {plan.blocks.map((block: any) => (
                                            <div key={block.id} className="p-3.5 bg-secondary/30 rounded-2xl border border-border/50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-foreground">{block.name || block.type}</span>
                                                    <span className="text-[11px] text-muted-foreground">{block.distance || 0}m</span>
                                                </div>
                                                <BlockFeedbackPanel
                                                    planId={plan.id}
                                                    blockId={block.id}
                                                    swimmerId={currentUser.id}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State when no training scheduled for this date */}
                {daySessions.length === 0 && directPlans.length === 0 && (
                    <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
                        <Waves className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                        <p className="font-medium text-sm text-foreground">今日暂无特定训练计划安排</p>
                        <p className="text-xs text-muted-foreground">
                            请劳逸结合，做好肌肉拉伸放松与水分补充
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
