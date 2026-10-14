"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send, ThumbsUp, Activity, Sparkles, Loader2, Mic, Flame } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Feedback } from "@/types";
import { useToast } from "@/components/common/Toast";

interface FeedbackFormProps {
    swimmerId: string;
    planId: string;
}

export function FeedbackForm({ swimmerId, planId }: FeedbackFormProps) {
    const { t } = useLanguage();
    const { submitFeedback } = useStore();
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [rpe, setRpe] = useState(5);
    const [soreness, setSoreness] = useState(3);
    const [comments, setComments] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [parsing, setParsing] = useState(false);

    const handleSpeech = () => {
        if (typeof window === "undefined") return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast("error", "抱歉，您的浏览器不支持语音识别。请使用 Chrome 浏览器。");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "zh-CN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e);
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setComments(prev => prev ? prev + " " + transcript : transcript);

            setParsing(true);
            try {
                const response = await fetch("/api/ai/feedback-parse", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: transcript }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setRpe(data.rpe);
                        setSoreness(data.soreness);
                    }
                }
            } catch (e) {
                console.error("Failed to parse feedback semantically:", e);
            } finally {
                setParsing(false);
            }
        };

        recognition.start();
    };

    const handleSubmit = async () => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        const feedback: Feedback = {
            id: crypto.randomUUID().slice(0, 9),
            swimmerId,
            planId,
            date: dateStr,
            rpe,
            soreness,
            comments,
            timestamp: today.toISOString()
        };

        try {
            await submitFeedback(feedback);
            setSubmitted(true);
        } catch (e) {
            console.error("Failed to submit feedback:", e);
        }
    };

    if (submitted) {
        return (
            <div className="bg-success/10 border border-success/20 rounded-xl p-8 text-center animate-in fade-in zoom-in">
                <div className="w-14 h-14 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{t.athlete.greatJob}</h3>
                <p className="text-sm text-success font-medium">反馈已提交，教练将即时收到通知！</p>
            </div>
        );
    }

    const getRpeColor = (value: number) => {
        if (value <= 3) return "text-info";
        if (value <= 5) return "text-success";
        if (value <= 7) return "text-warning";
        return "text-destructive";
    };

    const getRpeTrackBg = (val: number) => {
        const color = val <= 3 ? 'var(--info)' : val <= 5 ? 'var(--success)' : val <= 7 ? 'var(--warning)' : 'var(--error)';
        const percent = ((val - 1) / 9) * 100;
        return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, var(--border) ${percent}%, var(--border) 100%)`;
    };

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            训练日记
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            </span>
                        </h3>
                        <p className="text-xs text-muted-foreground">记录今日训练感受，帮助教练了解你的状态</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* RPE Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">疲劳程度 (RPE)</label>
                        <span className={cn("text-base font-bold flex items-center gap-1", getRpeColor(rpe))}>
                            {rpe}/10
                            {rpe >= 8 && <Flame className="w-3.5 h-3.5 text-destructive" />}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1" max="10"
                        value={rpe}
                        onChange={(e) => setRpe(parseInt(e.target.value))}
                        style={{ background: getRpeTrackBg(rpe) }}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer transition-all"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>很轻松</span>
                        <span>适中</span>
                        <span>非常累</span>
                    </div>
                </div>

                {/* Soreness Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">肌肉酸痛</label>
                        <span className={cn("text-base font-bold flex items-center gap-1", getRpeColor(soreness))}>
                            {soreness}/10
                            {soreness >= 8 && <Flame className="w-3.5 h-3.5 text-warning" />}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1" max="10"
                        value={soreness}
                        onChange={(e) => setSoreness(parseInt(e.target.value))}
                        style={{ background: getRpeTrackBg(soreness) }}
                        className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer transition-all"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>无酸痛</span>
                        <span>轻微</span>
                        <span>很酸痛</span>
                    </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            训练反思
                        </label>
                        <button
                            onClick={handleSpeech}
                            disabled={parsing}
                            className={cn(
                                "px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border text-xs font-medium",
                                isListening
                                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                            )}
                            title="语音转文字输入"
                        >
                            {isListening ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-destructive animate-ping inline-block" />
                                    录音中
                                </>
                            ) : parsing ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    分析中
                                </>
                            ) : (
                                <>
                                    <Mic className="w-3.5 h-3.5" />
                                    语音输入
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="1. 动作反思：今天自由泳划水感觉...&#10;2. 状态反思：最后几组感觉很累，但坚持下来了..."
                        rows={5}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground leading-relaxed"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    提交训练日记
                </button>
            </div>
        </div>
    );
}
