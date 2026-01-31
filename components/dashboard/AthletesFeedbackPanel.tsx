"use client";

import { useStore } from "@/lib/store";
import { Activity, MessageSquare, TrendingUp } from "lucide-react";

export function AthletesFeedbackPanel() {
    const { swimmers, feedbacks } = useStore();

    // Get latest feedback for each swimmer
    const swimmerFeedbacks = swimmers.map(swimmer => {
        const swimmerFeedbackList = feedbacks
            .filter(f => f.swimmerId === swimmer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            swimmer,
            latestFeedback: swimmerFeedbackList[0] || null
        };
    }).filter(item => item.latestFeedback !== null);

    if (swimmerFeedbacks.length === 0) {
        return (
            <div className="bg-card/30 border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-white">队员训练反馈</h2>
                </div>
                <p className="text-sm text-muted-foreground text-center py-4">
                    暂无队员反馈
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card/30 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">队员训练反馈</h2>
            </div>

            <div className="space-y-3">
                {swimmerFeedbacks.map(({ swimmer, latestFeedback }) => (
                    <div
                        key={swimmer.id}
                        className="bg-secondary/20 border border-white/5 rounded-xl p-4 hover:bg-secondary/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{swimmer.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(latestFeedback.date).toLocaleDateString('zh-CN', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-2">
                            {/* RPE */}
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground">RPE</p>
                                    <p className="text-sm font-bold text-white">
                                        {latestFeedback.rpe}/10
                                    </p>
                                </div>
                            </div>

                            {/* Soreness */}
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-400" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground">酸痛度</p>
                                    <p className="text-sm font-bold text-white">
                                        {latestFeedback.soreness}/10
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        {latestFeedback.comments && (
                            <div className="mt-2 pt-2 border-t border-white/5">
                                <p className="text-xs text-muted-foreground italic">
                                    "{latestFeedback.comments}"
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
