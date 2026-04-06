"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { CheckCircle, Clock } from "lucide-react";
import { getLocalDateISOString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export function TeamFeedbackSummary() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentWeekMonday = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.weeklyFeedbacks.getSubmitted();
                // filter by this week
                const thisWeek = getCurrentWeekMonday();
                const filtered = res.filter((f: any) => f.weekStart === thisWeek);
                setFeedbacks(filtered);
            } catch (e) {
                console.error("Failed to load feedbacks", e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    if (isLoading) return null;

    return (
        <div className="bg-card/30 border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                本周总结提交情况
                {feedbacks.some(f => !f.readAt) && (
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </h3>
            {feedbacks.length > 0 ? (
                <div className="space-y-3">
                    {feedbacks.slice(0, 5).map(f => (
                        <div key={f.id} className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold", !f.readAt ? "text-white" : "text-muted-foreground")}>
                                    {f.swimmer?.name || "未知"}
                                </span>
                                {!f.readAt && (
                                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-bold rounded uppercase">New</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] flex items-center gap-1 font-medium",
                                f.readAt ? "text-muted-foreground" : "text-green-400"
                            )}>
                                {f.readAt ? <CheckCircle className="w-3 h-3 text-muted-foreground/50" /> : <Clock className="w-3 h-3" />}
                                {f.readAt ? "已查閱" : "待查閱"}
                            </span>
                        </div>
                    ))}
                    {feedbacks.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">...查看更多</p>
                    )}
                </div>
            ) : (
                <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">本周暂无人提交汇总</p>
                </div>
            )}
        </div>
    );
}
