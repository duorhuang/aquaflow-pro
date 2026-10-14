"use client";

import { MessageSquare, Send, CheckCircle2, Clock } from "lucide-react";
import { WeeklyFeedbackForm } from "@/components/athlete/WeeklyFeedbackForm";
import { TargetedFeedbackForm } from "@/components/athlete/TargetedFeedbackForm";
import { CoachReplyPanel } from "@/components/athlete/CoachReplyPanel";
import { Swimmer } from "@/types";
import { getLocalDateISOString } from "@/lib/date-utils";
import { useMemo } from "react";

interface AthleteFeedbackTabProps {
    currentUser: Swimmer;
}

export function AthleteFeedbackTab({ currentUser }: AthleteFeedbackTabProps) {
    // Current week Monday
    const currentWeekMondayStr = useMemo(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return getLocalDateISOString(d);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-1">
                <MessageSquare className="w-4 h-4 text-primary" />
                <div>
                    <h3 className="text-sm font-semibold text-foreground">训练心得与教练沟通</h3>
                    <p className="text-xs text-muted-foreground">记录每堂课的体感与疲劳度，教练会为你提供针对性指导</p>
                </div>
            </div>

            {/* Coach Replies from recent feedbacks */}
            <div className="space-y-3">
                <CoachReplyPanel swimmerId={currentUser.id} />
            </div>

            {/* Targeted Tasks from coach (if any) */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Send className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        教练问询与针对性任务
                    </h4>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                    <TargetedFeedbackForm swimmerId={currentUser.id} />
                </div>
            </div>

            {/* Weekly Feedback Form (including daily sub-feedbacks) */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        本周总结与每日反思
                    </h4>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                    <WeeklyFeedbackForm 
                        swimmerId={currentUser.id} 
                        weekStart={currentWeekMondayStr} 
                    />
                </div>
            </div>
        </div>
    );
}
