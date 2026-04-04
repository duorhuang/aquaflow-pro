"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function FeedbacksPage() {
    const { swimmers } = useStore();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.weeklyFeedbacks.getSubmitted();
                setFeedbacks(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    if (loading) return <div className="text-center p-10"><Clock className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white">队员训练大反馈收件箱</h1>
            
            <div className="space-y-4">
                {feedbacks.map(f => {
                    const swimmer = swimmers.find(s => s.id === f.swimmerId) || f.swimmer;
                    const isExpanded = expandedIds.has(f.id);
                    return (
                        <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden">
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => toggleExpand(f.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                        {swimmer?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{swimmer?.name || "未知队员"}</h3>
                                        <p className="text-xs text-muted-foreground">{f.weekStart} 周总结 • 提交于 {new Date(f.submittedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div className="p-4 border-t border-border bg-black/20 space-y-4">
                                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                                        <h4 className="text-sm font-bold text-primary mb-2">教练注意：本周大总结</h4>
                                        <p className="text-sm text-white whitespace-pre-wrap">{f.summary || "没有填写大总结"}</p>
                                    </div>
                                    
                                    {f.dailyFeedbacks?.filter((d: any) => d.reflection).map((day: any) => (
                                        <div key={day.id} className="p-3 bg-secondary/30 rounded-lg">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="text-xs font-bold text-white px-2 py-1 bg-white/10 rounded">{day.date}</span>
                                                <span className="text-xs text-blue-400">RPE: {day.rpe}</span>
                                                <span className="text-xs text-orange-400">酸痛: {day.soreness}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{day.reflection}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
