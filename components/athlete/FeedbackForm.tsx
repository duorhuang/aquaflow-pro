"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send, ThumbsUp, Activity } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Feedback } from "@/types";

interface FeedbackFormProps {
    swimmerId: string;
    planId: string;
}

export function FeedbackForm({ swimmerId, planId }: FeedbackFormProps) {
    const { t } = useLanguage();
    const { submitFeedback } = useStore();
    const [submitted, setSubmitted] = useState(false);
    const [rpe, setRpe] = useState(5);
    const [soreness, setSoreness] = useState(3);
    const [comments, setComments] = useState("");

    const handleSubmit = () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        const feedback: Feedback = {
            id: Math.random().toString(36).substr(2, 9),
            swimmerId,
            planId,
            date: dateStr,
            rpe,
            soreness,
            comments,
            timestamp: today.toISOString()
        };

        submitFeedback(feedback);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t.athlete.greatJob}</h3>
                <p className="text-green-400 font-medium">反馈已提交，教练将即时收到通知！</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t.athlete.checkIn}
            </h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">{t.athlete.rpe}</label>
                        <span className={cn("text-lg font-bold", rpe > 8 ? "text-red-500" : "text-primary")}>{rpe}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1" max="10"
                        value={rpe}
                        onChange={(e) => setRpe(parseInt(e.target.value))}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Easy</span>
                        <span>Max Effort</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">{t.athlete.soreness}</label>
                        <span className={cn("text-lg font-bold", soreness > 7 ? "text-orange-500" : "text-blue-400")}>{soreness}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1" max="10"
                        value={soreness}
                        onChange={(e) => setSoreness(parseInt(e.target.value))}
                        className="w-full accent-blue-400 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">备注 (可选)</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="今天的训练感觉如何？..."
                        rows={2}
                        className="w-full bg-black/20 rounded-xl p-3 text-sm text-white border border-white/5 focus:border-primary/50 outline-none resize-none"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
                {t.athlete.submit} <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
