"use client";

import { useStore } from "@/lib/store";
import { AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { getLocalDateISOString } from "@/lib/date-utils";
import Link from "next/link";

export const AthletesFeedbackPanel = memo(function AthletesFeedbackPanel() {
    const { swimmers, feedbacks } = useStore();

    const today = getLocalDateISOString();
    const todayFeedbacks = (feedbacks || []).filter(f => f.date === today);
    const todayFeedbackCount = new Set(todayFeedbacks.map(f => f.swimmerId)).size;

    // Get latest feedback for each swimmer
    const swimmerFeedbacks = (swimmers || []).map(swimmer => {
        const list = (feedbacks || [])
            .filter(f => f.swimmerId === swimmer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = list[0] || null;
        const needsAttention = latest && (latest.rpe >= 8 || latest.soreness >= 7);
        return { swimmer, latest, needsAttention };
    });

    const withData = swimmerFeedbacks.filter(s => s.latest !== null);
    const attentionItems = withData.filter(s => s.needsAttention);
    const recentItems = withData.filter(s => !s.needsAttention).slice(0, 3);

    const allLatestRpe = withData.map(s => s.latest!.rpe);
    const teamAvgRpe = allLatestRpe.length > 0
        ? (allLatestRpe.reduce((a, b) => a + b, 0) / allLatestRpe.length).toFixed(1)
        : null;

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">反馈摘要</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        今日 {todayFeedbackCount}/{swimmers.length} 人已提交
                        {teamAvgRpe && <span className="ml-2">· 均 RPE {teamAvgRpe}</span>}
                    </p>
                </div>
                <Link
                    href="/dashboard/feedbacks"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    aria-label="查看全部反馈"
                >
                    全部 <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Needs attention */}
            {attentionItems.length > 0 && (
                <div className="px-4 py-3 space-y-2 border-b border-border">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> 需关注
                    </p>
                    {attentionItems.map(({ swimmer, latest }) => (
                        <div key={swimmer.id} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center text-[10px] font-semibold text-destructive">
                                    {swimmer.name.slice(0, 1)}
                                </div>
                                <span className="text-sm font-medium text-foreground">{swimmer.name}</span>
                                {latest?.comments && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[120px] italic">"{latest.comments}"</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-shrink-0">
                                <span className="text-destructive font-medium">RPE {latest?.rpe}</span>
                                <span className="text-warning-foreground font-medium">酸痛 {latest?.soreness}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent feedbacks */}
            {recentItems.length > 0 ? (
                <div className="divide-y divide-border">
                    {recentItems.map(({ swimmer, latest }) => (
                        <div key={swimmer.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                    {swimmer.name.slice(0, 1)}
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-foreground">{swimmer.name}</span>
                                    {latest?.comments && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[150px] italic">"{latest.comments}"</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                                <span>RPE {latest?.rpe}/10</span>
                                <CheckCircle className="w-3.5 h-3.5 text-success" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : withData.length === 0 && (
                <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">暂无队员反馈</p>
                </div>
            )}

            {withData.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border">
                    <Link
                        href="/dashboard/feedbacks"
                        className="text-xs text-primary hover:underline"
                    >
                        查看全部 {withData.length} 条反馈 →
                    </Link>
                </div>
            )}
        </div>
    );
});