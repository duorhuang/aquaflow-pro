"use client";

import { useStore } from "@/lib/store";
import { Activity, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";

export function AthletesFeedbackPanel() {
    const { swimmers, feedbacks } = useStore();
    const [expandedSwimmer, setExpandedSwimmer] = useState<string | null>(null);

    const today = getLocalDateISOString();

    // Get feedbacks from today
    const todayFeedbacks = feedbacks.filter(f => f.date === today);
    const todayFeedbackCount = new Set(todayFeedbacks.map(f => f.swimmerId)).size;

    // Get latest feedback for each swimmer with trend analysis
    const swimmerFeedbacks = swimmers.map(swimmer => {
        const swimmerFeedbackList = feedbacks
            .filter(f => f.swimmerId === swimmer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const latestFeedback = swimmerFeedbackList[0] || null;

        // Calculate 7-day average RPE for trend
        const last7Days = swimmerFeedbackList.slice(0, 7);
        const avgRpe = last7Days.length > 0
            ? last7Days.reduce((sum, f) => sum + f.rpe, 0) / last7Days.length
            : 0;

        // Determine if needs attention (high RPE or high soreness)
        const needsAttention = latestFeedback && (latestFeedback.rpe >= 8 || latestFeedback.soreness >= 7);

        return {
            swimmer,
            latestFeedback,
            recentFeedbacks: swimmerFeedbackList.slice(0, 5),
            avgRpe,
            needsAttention
        };
    });

    // Count swimmers needing attention
    const attentionCount = swimmerFeedbacks.filter(s => s.needsAttention).length;
    const feedbackWithData = swimmerFeedbacks.filter(s => s.latestFeedback !== null);

    // Calculate overall team status
    const allLatestRpe = feedbackWithData.map(s => s.latestFeedback!.rpe);
    const teamAvgRpe = allLatestRpe.length > 0
        ? (allLatestRpe.reduce((a, b) => a + b, 0) / allLatestRpe.length).toFixed(1)
        : "--";

    const getStatusLabel = (avgRpe: number): { label: string; color: string } => {
        if (avgRpe <= 4) return { label: "优秀", color: "text-green-400" };
        if (avgRpe <= 6) return { label: "良好", color: "text-blue-400" };
        if (avgRpe <= 8) return { label: "偏累", color: "text-yellow-400" };
        return { label: "疲劳", color: "text-red-400" };
    };

    const teamStatus = typeof teamAvgRpe === "string" && teamAvgRpe !== "--"
        ? getStatusLabel(parseFloat(teamAvgRpe))
        : { label: "--", color: "text-muted-foreground" };

    return (
        <div className="bg-card/30 border border-border rounded-2xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">队员状态总览</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                {/* Today's Feedback Count */}
                <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{todayFeedbackCount}/{swimmers.length}</p>
                    <p className="text-[10px] text-muted-foreground">今日反馈</p>
                </div>

                {/* Attention Needed */}
                <div className={cn(
                    "border rounded-xl p-3 text-center",
                    attentionCount > 0 ? "bg-red-500/10 border-red-500/30" : "bg-secondary/20 border-white/5"
                )}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertTriangle className={cn("w-4 h-4", attentionCount > 0 ? "text-red-400" : "text-muted-foreground")} />
                    </div>
                    <p className={cn("text-lg font-bold", attentionCount > 0 ? "text-red-400" : "text-white")}>{attentionCount}</p>
                    <p className="text-[10px] text-muted-foreground">需关注</p>
                </div>

                {/* Team Status */}
                <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className={cn("text-lg font-bold", teamStatus.color)}>{teamStatus.label}</p>
                    <p className="text-[10px] text-muted-foreground">平均 RPE {teamAvgRpe}</p>
                </div>
            </div>

            {/* Attention Needed Section */}
            {attentionCount > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        需要关注的队员
                    </h3>
                    {swimmerFeedbacks
                        .filter(s => s.needsAttention)
                        .map(({ swimmer, latestFeedback }) => (
                            <div
                                key={swimmer.id}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-white">{swimmer.name}</span>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-red-400">RPE {latestFeedback?.rpe}/10</span>
                                        <span className="text-orange-400">酸痛 {latestFeedback?.soreness}/10</span>
                                    </div>
                                </div>
                                {latestFeedback?.comments && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                        "{latestFeedback.comments}"
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            )}

            {/* Recent Feedbacks */}
            {feedbackWithData.length > 0 ? (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-muted-foreground">最近反馈</h3>
                    {feedbackWithData
                        .filter(s => !s.needsAttention)
                        .slice(0, 5)
                        .map(({ swimmer, latestFeedback, recentFeedbacks, avgRpe }) => (
                            <div
                                key={swimmer.id}
                                className="bg-secondary/20 border border-white/5 rounded-xl p-3 hover:bg-secondary/30 transition-all cursor-pointer"
                                onClick={() => setExpandedSwimmer(expandedSwimmer === swimmer.id ? null : swimmer.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{swimmer.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(latestFeedback!.date).toLocaleDateString('zh-CN', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs">
                                            <Activity className="w-3 h-3 text-blue-400" />
                                            <span className="text-white">{latestFeedback?.rpe}/10</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            <TrendingUp className="w-3 h-3 text-orange-400" />
                                            <span className="text-white">{latestFeedback?.soreness}/10</span>
                                        </div>
                                        {expandedSwimmer === swimmer.id ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedSwimmer === swimmer.id && recentFeedbacks.length > 1 && (
                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            近7天平均 RPE: <span className="text-white font-bold">{avgRpe.toFixed(1)}</span>
                                        </p>
                                        <div className="space-y-1">
                                            {recentFeedbacks.slice(1).map((fb, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">
                                                        {new Date(fb.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-white">RPE {fb.rpe} / 酸痛 {fb.soreness}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comment */}
                                {latestFeedback?.comments && expandedSwimmer !== swimmer.id && (
                                    <p className="text-xs text-muted-foreground mt-1 italic truncate">
                                        "{latestFeedback.comments}"
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    暂无队员反馈
                </p>
            )}
        </div>
    );
}
