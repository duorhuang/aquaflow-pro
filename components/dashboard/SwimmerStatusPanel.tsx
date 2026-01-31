"use client";

import { useStore } from "@/lib/store";
import { Activity, AlertTriangle, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SwimmerStatusPanel() {
    const { swimmers, feedbacks } = useStore();

    // Get latest feedback for each swimmer
    const getLatestFeedback = (swimmerId: string) => {
        const swimmerFeedbacks = feedbacks
            .filter(f => f.swimmerId === swimmerId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return swimmerFeedbacks[0];
    };

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    队员状态监控
                </h3>
            </div>

            <div className="space-y-3">
                {swimmers.map(swimmer => {
                    const latestFeedback = getLatestFeedback(swimmer.id);
                    const readiness = swimmer.readiness || 95;
                    const hasInjury = swimmer.injuryNote && swimmer.injuryNote.trim().length > 0;

                    // Determine status color
                    const statusColor = hasInjury ? "red" :
                        readiness >= 85 ? "green" :
                            readiness >= 70 ? "yellow" : "orange";

                    return (
                        <div
                            key={swimmer.id}
                            className={cn(
                                "p-4 rounded-xl border transition-all",
                                hasInjury
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-white/5 border-white/10"
                            )}
                        >
                            {/* Swimmer Name & Group */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white max-w-[100px] truncate" title={swimmer.name}>
                                        {swimmer.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/10 rounded flex-shrink-0">
                                        {swimmer.group === "Advanced" ? "高级组" : swimmer.group === "Intermediate" ? "中级组" : "初级组"}
                                    </span>
                                </div>
                                <div className={cn(
                                    "text-sm font-bold",
                                    statusColor === "green" ? "text-green-400" :
                                        statusColor === "yellow" ? "text-yellow-400" :
                                            statusColor === "orange" ? "text-orange-400" :
                                                "text-red-400"
                                )}>
                                    {hasInjury ? "⚠️" : readiness >= 85 ? "✅" : readiness >= 70 ? "😐" : "😴"}
                                </div>
                            </div>

                            {/* Readiness Bar */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">竞技状态</span>
                                    <span className={cn(
                                        "text-xs font-bold",
                                        statusColor === "green" ? "text-green-400" :
                                            statusColor === "yellow" ? "text-yellow-400" :
                                                statusColor === "orange" ? "text-orange-400" :
                                                    "text-red-400"
                                    )}>
                                        {readiness}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            statusColor === "green" ? "bg-green-400" :
                                                statusColor === "yellow" ? "bg-yellow-400" :
                                                    statusColor === "orange" ? "bg-orange-400" :
                                                        "bg-red-400"
                                        )}
                                        style={{ width: `${readiness}%` }}
                                    />
                                </div>
                            </div>

                            {/* Injury Note */}
                            {hasInjury && (
                                <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-red-400 mb-0.5">伤病报告</p>
                                        <p className="text-xs text-red-300">{swimmer.injuryNote}</p>
                                    </div>
                                </div>
                            )}

                            {/* Latest Feedback */}
                            {latestFeedback && (
                                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-xs font-medium text-primary">最新反馈</p>
                                            <span className="text-[10px] text-muted-foreground">
                                                RPE: {latestFeedback.rpe}/10
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {latestFeedback.comments || "无评论"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(latestFeedback.timestamp).toLocaleDateString('zh-CN')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!latestFeedback && !hasInjury && (
                                <p className="text-xs text-muted-foreground italic">暂无反馈</p>
                            )}
                        </div>
                    );
                })}

                {swimmers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无队员数据</p>
                    </div>
                )}
            </div>
        </div>
    );
}
