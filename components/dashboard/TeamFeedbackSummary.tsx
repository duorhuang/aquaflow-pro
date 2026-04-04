"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { CheckCircle, Clock } from "lucide-react";
import { getLocalDateISOString } from "@/lib/date-utils";

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
            <h3 className="text-sm font-bold text-white mb-4">本周大反馈提交情况</h3>
            {feedbacks.length > 0 ? (
                <div className="space-y-3">
                    {feedbacks.slice(0, 3).map(f => (
                        <div key={f.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                            <span className="text-sm font-bold text-white">{f.swimmer?.name || "未知"}</span>
                            <span className="text-xs text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> 已提交
                            </span>
                        </div>
                    ))}
                    {feedbacks.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">...还有 {feedbacks.length - 3} 人</p>
                    )}
                </div>
            ) : (
                <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">本周暂无人提交大反馈</p>
                </div>
            )}
        </div>
    );
}
