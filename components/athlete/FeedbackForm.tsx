"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send, ThumbsUp, Activity, Mail, Sparkles, Loader2, Mic, Flame } from "lucide-react";
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

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e);
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setComments(prev => prev ? prev + " " + transcript : transcript);
            
            // Post transcript to AI Edge route to parse RPE and Soreness
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

        try {
            await submitFeedback(feedback);
            setSubmitted(true);
        } catch (e) {
            console.error("Failed to submit feedback:", e);
        }
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

    const getRpeColor = (value: number) => {
        if (value <= 3) return "text-cyan-400";
        if (value <= 5) return "text-emerald-400";
        if (value <= 7) return "text-amber-400";
        return "text-red-400";
    };

    const getSorenessColor = (value: number) => {
        if (value <= 3) return "text-cyan-400";
        if (value <= 5) return "text-emerald-400";
        if (value <= 7) return "text-orange-400";
        return "text-red-400";
    };

    const getSliderGlow = (val: number) => {
        if (val <= 3) return "shadow-[0_0_15px_rgba(0,242,255,0.15)] border-cyan-500/20 bg-cyan-950/5";
        if (val <= 5) return "shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20 bg-emerald-950/5";
        if (val <= 7) return "shadow-[0_0_15px_rgba(245,159,0,0.15)] border-amber-500/20 bg-amber-950/5";
        return "shadow-[0_0_20px_rgba(239,68,68,0.3)] border-red-500/30 bg-red-950/10 animate-pulse";
    };

    const getRpeTrackBg = (val: number) => {
        const color = val <= 3 ? '#00f2ff' : val <= 5 ? '#10b981' : val <= 7 ? '#f59f00' : '#ef4444';
        const percent = ((val - 1) / 9) * 100;
        return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`;
    };

    return (
        <div className="relative">
            {/* "Mail" envelope effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-50" />

            <div className="relative bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header - Like a mail subject line */}
                <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 border-b border-primary/20 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                 训练日记
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal">
                                    {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                </span>
                            </h3>
                            <p className="text-xs text-muted-foreground">记录今日训练感受，帮助教练了解你的状态</p>
                        </div>
                    </div>
                </div>

                {/* Content - Mail body */}
                <div className="p-6 space-y-6">
                    {/* Physical Status Section */}
                    <div className="bg-secondary/30 rounded-2xl p-4 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" />
                            身体状态
                        </h4>

                        {/* RPE Slider */}
                        <div className={cn("p-4 border rounded-2xl transition-all duration-300 relative overflow-hidden", getSliderGlow(rpe))}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-muted-foreground">疲劳程度 (RPE)</label>
                                <span className={cn("text-lg font-bold flex items-center gap-1", getRpeColor(rpe))}>
                                    {rpe}/10
                                    {rpe >= 8 && <Flame className="w-4 h-4 text-red-500 animate-pulse" />}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1" max="10"
                                value={rpe}
                                onChange={(e) => setRpe(parseInt(e.target.value))}
                                style={{ background: getRpeTrackBg(rpe) }}
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer hover:scale-[1.01] active:scale-[1.01] transition-transform"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>很轻松</span>
                                <span>适中</span>
                                <span>非常累</span>
                            </div>
                        </div>

                        {/* Soreness Slider */}
                        <div className={cn("p-4 border rounded-2xl transition-all duration-300 relative overflow-hidden", getSliderGlow(soreness))}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-muted-foreground">肌肉酸痛</label>
                                <span className={cn("text-lg font-bold flex items-center gap-1", getSorenessColor(soreness))}>
                                    {soreness}/10
                                    {soreness >= 8 && <Flame className="w-4 h-4 text-orange-500 animate-pulse" />}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1" max="10"
                                value={soreness}
                                onChange={(e) => setSoreness(parseInt(e.target.value))}
                                style={{ background: getRpeTrackBg(soreness) }}
                                className="w-full accent-orange-400 h-2 bg-secondary rounded-lg appearance-none cursor-pointer hover:scale-[1.01] active:scale-[1.01] transition-transform"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>无酸痛</span>
                                <span>轻微</span>
                                <span>很酸痛</span>
                            </div>
                        </div>
                    </div>

                    {/* Reflection Section */}
                    <div className="space-y-4">
                        {/* Good Points */}
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-primary flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    训练反思与状态
                                </label>
                                <button
                                    onClick={handleSpeech}
                                    disabled={parsing}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 border text-xs font-bold shadow-md cursor-pointer",
                                        isListening
                                            ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                                            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                                    )}
                                    title="语音转文字输入"
                                >
                                    {isListening ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                                            <span>录音中...</span>
                                        </>
                                    ) : parsing ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>AI 分析中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-3.5 h-3.5" />
                                            <span>语音输入</span>
                                        </>
                                    )}
                                </button>
                            </div>
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

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 text-white font-bold rounded-2xl hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                    >
                        <Send className="w-5 h-5" />
                        提交训练日记
                    </button>
                </div>
            </div>
        </div>
    );
}
