"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { CheckCircle, Clock, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";

export default function FeedbacksPage() {
    const { swimmers } = useStore();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

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

    const toggleExpand = (id: string, initialReply: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
            if (!replyDrafts[id]) {
                setReplyDrafts(prev => ({ ...prev, [id]: initialReply || "" }));
            }
        }
        setExpandedIds(next);
    };

    const handlePublishReply = async (id: string) => {
        const replyText = replyDrafts[id] || "";
        if (!replyText.trim()) {
            alert("评语不能为空");
            return;
        }

        setSavingId(id);
        try {
            await api.weeklyFeedbacks.reply(id, replyText);
            alert("已发送反馈回复给队员！");
            await load();
        } catch (e) {
            console.error(e);
            alert("发送失败");
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return <div className="text-center p-10"><Clock className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">📥 队员反馈收件箱</h1>
                <p className="text-sm text-muted-foreground mt-1">查看队员的每日训练日记与周总结，在此写评语</p>
            </div>
            
            <div className="space-y-4">
                {feedbacks.map(f => {
                    const swimmer = swimmers.find(s => s.id === f.swimmerId) || f.swimmer;
                    const isExpanded = expandedIds.has(f.id);
                    return (
                        <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden">
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => toggleExpand(f.id, f.coachReply)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                        {swimmer?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {swimmer?.name || "未知队员"}
                                            {f.isReplied && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/30">已批复</span>}
                                        </h3>
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

                                    {/* Coach Reply Box */}
                                    <div className="pt-4 mt-6 border-t border-white/5 space-y-3">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            教练评语
                                            {f.isReplied && <span className="text-xs text-muted-foreground font-normal">(上次批复于: {new Date(f.repliedAt).toLocaleDateString()})</span>}
                                        </h4>
                                        <textarea
                                            value={replyDrafts[f.id] !== undefined ? replyDrafts[f.id] : (f.coachReply || "")}
                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [f.id]: e.target.value }))}
                                            placeholder="在此输入教练寄语与反馈，队员将在其面板中看到..."
                                            className="w-full h-24 bg-black/40 border border-border rounded-xl p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => handlePublishReply(f.id)}
                                                disabled={savingId === f.id}
                                                className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
                                            >
                                                {savingId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {f.isReplied ? "更新批复" : "发布反馈"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
