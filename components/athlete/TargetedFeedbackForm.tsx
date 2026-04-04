"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Send, Target, Check, Bell, MessageSquare } from "lucide-react";

export function TargetedFeedbackForm({ swimmerId }: { swimmerId: string }) {
    const [reminders, setReminders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadReminders();
    }, [swimmerId]);

    const loadReminders = async () => {
        setIsLoading(true);
        try {
            // Fetch reminders for this swimmer
            const res = await api.feedbackReminders.getForSwimmer(swimmerId);
            // Only show those that haven't been responded to
            setReminders(res.filter((r: any) => !r.isResponded));
        } catch (e) {
            console.error("Failed to load reminders", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (reminderId: string) => {
        if (!responses[reminderId]?.trim()) return;
        
        setSubmitting({ ...submitting, [reminderId]: true });
        try {
            await api.feedbackReminders.respond({
                reminderId,
                swimmerId,
                content: responses[reminderId],
            });
            // remove from list locally
            setReminders(reminders.filter(r => r.id !== reminderId));
        } catch (e) {
            console.error(e);
            alert("提交失败，请重试");
        } finally {
            setSubmitting({ ...submitting, [reminderId]: false });
        }
    };

    if (isLoading) return <div className="p-12 text-center animate-pulse text-muted-foreground flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        加载教练通知中...
    </div>;

    if (reminders.length === 0) return (
        <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-3xl">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">暂无待处理的专项反馈</h3>
            <p className="text-sm text-muted-foreground">教练发起提问后，这里会出现通知</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-400 animate-bounce" />
                    <h3 className="text-xl font-bold text-white">教练提问通知 ({reminders.length})</h3>
                </div>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-bold">URGENT</span>
            </div>
            
            {reminders.map((r) => (
                <div key={r.id} className="bg-gradient-to-br from-card to-orange-950/10 border border-orange-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-32 h-32 text-orange-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-white text-lg font-bold leading-tight">专项反馈诉求</p>
                                <p className="text-xs text-muted-foreground">来自教练的实时提问</p>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-6 italic text-orange-100/90 leading-relaxed">
                            "{r.message}"
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">你的回复</label>
                            <textarea
                                value={responses[r.id] || ""}
                                onChange={(e) => setResponses({ ...responses, [r.id]: e.target.value })}
                                placeholder="详细回答教练的问题..."
                                className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-4 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none shadow-inner"
                            />
                        </div>
                        
                        <button
                            onClick={() => handleSubmit(r.id)}
                            disabled={!responses[r.id]?.trim() || submitting[r.id]}
                            className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale shadow-lg shadow-orange-500/20"
                        >
                            {submitting[r.id] ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>确认发送给教练</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
