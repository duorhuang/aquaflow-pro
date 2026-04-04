"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Send, Target, Check, Bell } from "lucide-react";

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
            // Fetch unresponded reminders for this swimmer
            const res = await api.feedbackReminders?.getAll() || [];
            const targeted = res.filter((r: any) => r.swimmerId === swimmerId && !r.isResponded);
            setReminders(targeted);
        } catch (e) {
            console.error("Failed to load reminders", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (reminderId: string) => {
        setSubmitting({ ...submitting, [reminderId]: true });
        try {
            // Mock API or actual
            await api.targetedFeedbacks?.create({
                reminderId,
                swimmerId,
                content: responses[reminderId] || "",
            });
            // remove from list locally
            setReminders(reminders.filter(r => r.id !== reminderId));
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting({ ...submitting, [reminderId]: false });
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">加载教练通知中...</div>;

    if (reminders.length === 0) return null;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-400 animate-bounce" />
                <h3 className="text-xl font-bold text-white">教练提问 ({reminders.length})</h3>
            </div>
            
            {reminders.map((r) => (
                <div key={r.id} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target className="w-24 h-24 text-orange-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full mb-3">
                            专项反馈诉求
                        </div>
                        <p className="text-white text-lg font-medium mb-4">"{r.message}"</p>
                        
                        <textarea
                            value={responses[r.id] || ""}
                            onChange={(e) => setResponses({ ...responses, [r.id]: e.target.value })}
                            placeholder="在此回复教练..."
                            className="w-full h-32 bg-black/40 border border-border rounded-xl p-4 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                        />
                        
                        <button
                            onClick={() => handleSubmit(r.id)}
                            disabled={!responses[r.id] || submitting[r.id]}
                            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting[r.id] ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                            发送回复
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
