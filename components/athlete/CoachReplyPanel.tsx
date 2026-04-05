"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";

export function CoachReplyPanel({ swimmerId }: { swimmerId: string }) {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.weeklyFeedbacks.getSubmitted();
                // Filter to only those belonging to this swimmer and having a coach reply
                const myFeedbacks = res.filter((f: any) => f.swimmerId === swimmerId && f.isReplied);
                setFeedbacks(myFeedbacks);
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

    if (feedbacks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                教练的批复
            </h3>
            {feedbacks.map(f => (
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
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                            {f.coachReply}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
