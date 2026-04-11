"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";

export function CoachReplyPanel({ swimmerId }: { swimmerId: string }) {
    const [weeklyFeedbacks, setWeeklyFeedbacks] = useState<any[]>([]);
    const [targetedFeedbacks, setTargetedFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [weeklyRes, targetedRes] = await Promise.all([
                    api.weeklyFeedbacks.getSubmitted(),
                    api.feedbackReminders.getForSwimmer(swimmerId)
                ]);
                
                // Filter weekly replies
                setWeeklyFeedbacks(weeklyRes.filter((f: any) => f.swimmerId === swimmerId && f.isReplied));
                
                // Extract replies from targeted reminders
                const targetedWithReplies: any[] = [];
                targetedRes.forEach((r: any) => {
                    r.responses?.forEach((resp: any) => {
                        if (resp.swimmerId === swimmerId && resp.coachReply) {
                            targetedWithReplies.push({
                                id: resp.id,
                                title: `专项反馈: ${r.message.substring(0, 15)}...`,
                                content: resp.coachReply,
                                date: resp.repliedAt || resp.createdAt
                            });
                        }
                    });
                });
                setTargetedFeedbacks(targetedWithReplies);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [swimmerId]);

    if (loading) {
        return <div className="animate-pulse flex items-center justify-center p-4"><Clock className="w-5 h-5 text-primary animate-spin" /></div>;
    }

    if (weeklyFeedbacks.length === 0 && targetedFeedbacks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                教练的批复
            </h3>
            
            {/* Weekly Feedbacks */}
            {weeklyFeedbacks.map(f => (
                <div key={f.id} className="bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <CheckCircle className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                                {f.weekStart} 周总结批复
                            </span>
                            <span className="text-xs text-muted-foreground">{new Date(f.repliedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {f.coachReply}
                        </p>
                    </div>
                </div>
            ))}

            {/* Targeted Feedbacks */}
            {targetedFeedbacks.map(f => (
                <div key={f.id} className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <MessageSquare className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                {f.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
                            教练回执: "{f.content}"
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
