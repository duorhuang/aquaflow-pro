"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, ThumbsUp, Activity, Mail, Sparkles, Edit2, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Feedback } from "@/types";

interface FeedbackFormProps {
    swimmerId: string;
    planId: string;
}

export function FeedbackForm({ swimmerId, planId }: FeedbackFormProps) {
    const { t } = useLanguage();
    const { submitFeedback } = useStore();
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [existingId, setExistingId] = useState<string | null>(null);
    const [rpe, setRpe] = useState(5);
    const [soreness, setSoreness] = useState(3);
    const [comments, setComments] = useState("");
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Load existing feedback for today
    useEffect(() => {
        const loadTodayFeedback = async () => {
            const today = new Date().toISOString().split('T')[0];
            try {
                const allFeedback = await api.feedbacks.getAll();
                const todayFb = (allFeedback || []).find(
                    (f: any) => f.swimmerId === swimmerId && f.date === today
                );
                if (todayFb) {
                    setRpe(todayFb.rpe || 5);
                    setSoreness(todayFb.soreness || 3);
                    setComments(todayFb.comments || "");
                    setExistingId(todayFb.id);
                    setSubmitted(true);
                }
            } catch (e) {
                console.error("Failed to load today's feedback", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (swimmerId) loadTodayFeedback();
    }, [swimmerId]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        const today = new Date().toISOString().split('T')[0];

        const feedback: Feedback = {
            id: existingId || Math.random().toString(36).substr(2, 9),
            swimmerId,
            planId,
            date: today,
            rpe,
            soreness,
            comments,
            timestamp: new Date().toISOString()
        };

        try {
            await api.feedbacks.create(feedback);
            submitFeedback(feedback);
            setSubmitted(true);
            setSaveStatus(existingId ? "✅ 已更新今日反馈！" : "✅ 反馈已提交！");
            setExistingId(feedback.id);
        } catch (e: any) {
            console.error("Failed to save feedback", e);
            setSaveStatus("❌ 保存失败，请重试。");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center animate-pulse"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" /></div>;
    }

    const getRpeColor = (value: number) => {
        if (value <= 3) return "text-green-400";
        if (value <= 5) return "text-blue-400";
        if (value <= 7) return "text-yellow-400";
        return "text-red-400";
    };

    const getSorenessColor = (value: number) => {
        if (value <= 3) return "text-green-400";
        if (value <= 5) return "text-blue-400";
        if (value <= 7) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <div className="relative">
            {/* "Mail" envelope effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-50" />

            <div className="relative bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 border-b border-primary/20 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    📝 训练日记
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal">
                                        {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                    </span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {submitted ? "今日反馈已提交，可继续修改" : "记录今日训练感受，帮助教练了解你的状态"}
                                </p>
                            </div>
                        </div>
                        {submitted && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                                <Edit2 className="w-3 h-3" />
                                可编辑
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Physical Status Section */}
                    <div className="bg-secondary/30 rounded-2xl p-4 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" />
                            身体状态
                        </h4>

                        {/* RPE Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-muted-foreground">疲劳程度 (RPE)</label>
                                <span className={cn("text-lg font-bold", getRpeColor(rpe))}>{rpe}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="10"
                                value={rpe}
                                onChange={(e) => setRpe(parseInt(e.target.value))}
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>很轻松</span>
                                <span>适中</span>
                                <span>非常累</span>
                            </div>
                        </div>

                        {/* Soreness Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-muted-foreground">肌肉酸痛</label>
                                <span className={cn("text-lg font-bold", getSorenessColor(soreness))}>{soreness}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="10"
                                value={soreness}
                                onChange={(e) => setSoreness(parseInt(e.target.value))}
                                className="w-full accent-orange-400 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>无酸痛</span>
                                <span>轻微</span>
                                <span>很酸痛</span>
                            </div>
                        </div>
                    </div>

                    {/* Reflection Section */}
                    <div className="space-y-4">
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                            <label className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                训练反思与状态
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">
                                请反思今日训练内容（动作、教练提示）以及你的身体状态（疲劳感、训练投入度等）...
                            </p>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="1. 动作反思：今天自由泳划水感觉...&#10;2. 状态反思：最后几组感觉很累，但坚持下来了..."
                                rows={6}
                                className="w-full bg-black/20 rounded-xl p-3 text-sm text-white border border-primary/20 focus:border-primary/50 outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Status / Save */}
                    {saveStatus && (
                        <div className={cn("p-3 rounded-lg text-sm font-medium text-center", saveStatus.includes("❌") ? "bg-red-500/20 text-red-400" : "bg-green-500/10 text-green-400")}>
                            {saveStatus}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-2xl hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : submitted ? (
                            <Edit2 className="w-5 h-5" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {submitted ? "更新今日反馈" : "提交训练日记"}
                    </button>
                </div>
            </div>
        </div>
    );
}
