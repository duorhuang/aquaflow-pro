"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Send, Target, Check, Bell, MessageSquare } from "lucide-react";

export function TargetedFeedbackForm({ swimmerId }: { swimmerId: string }) {
    const [reminders, setReminders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
    const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

    const loadReminders = useCallback(async () => {
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
    }, [swimmerId]);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                loadReminders();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [loadReminders]);

    const handleSubmit = async (reminderId: string) => {
        if (!responses[reminderId]?.trim()) return;

        setSubmitting(prev => ({ ...prev, [reminderId]: true }));
        try {
            await api.feedbackReminders.respond({
                reminderId,
                swimmerId,
                content: responses[reminderId],
            });
            // remove from list locally
            setReminders(prev => prev.filter(r => r.id !== reminderId));
        } catch (e) {
            console.error(e);
            setSubmitErrors(prev => ({ ...prev, [reminderId]: "提交失败，请重试" }));
        } finally {
            setSubmitting(prev => ({ ...prev, [reminderId]: false }));
        }
    };

    if (isLoading) return (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">加载教练通知中...</span>
        </div>
    );

    if (reminders.length === 0) return (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-foreground mb-1">暂无待处理的专项反馈</h3>
            <p className="text-sm text-muted-foreground">教练发起专项提问后，这里会出现通知</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">教练提问通知 ({reminders.length})</h3>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-medium border border-amber-500/20">待答复</span>
            </div>
            
            {reminders.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-5 shadow-xs relative overflow-hidden">
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-semibold leading-tight">专项反馈诉求</p>
                                <p className="text-xs text-muted-foreground">来自教练的提问</p>
                            </div>
                        </div>

                        <div className="bg-secondary/60 border border-border/60 p-3.5 rounded-lg mb-4 text-sm text-foreground/90 leading-relaxed">
                            &ldquo;{r.message}&rdquo;
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">你的回复</label>
                            <textarea
                                value={responses[r.id] || ""}
                                onChange={(e) => setResponses({ ...responses, [r.id]: e.target.value })}
                                placeholder="输入回复内容..."
                                className="w-full h-28 bg-secondary/40 border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
                            />
                        </div>
                        
                        <button
                            onClick={() => handleSubmit(r.id)}
                            disabled={!responses[r.id]?.trim() || submitting[r.id]}
                            className="mt-4 w-full bg-primary text-primary-foreground font-medium text-sm py-2.5 rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting[r.id] ? (
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>确认发送给教练</span>
                                </>
                            )}
                        </button>
                        {submitErrors[r.id] && (
                            <p className="text-xs text-destructive text-center mt-2">{submitErrors[r.id]}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
