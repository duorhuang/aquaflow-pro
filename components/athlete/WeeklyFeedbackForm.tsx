"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import {
    ChevronDown, ChevronUp, Activity, TrendingUp,
    Send, Save, Check, Loader2
} from "lucide-react";

interface WeeklyFeedbackFormProps {
    swimmerId: string;
    weekStart: string; // Monday YYYY-MM-DD
}

const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function WeeklyFeedbackForm({ swimmerId, weekStart }: WeeklyFeedbackFormProps) {
    const { markAttendance } = useStore();
    const [summary, setSummary] = useState("");
    const [dailyFeedbacks, setDailyFeedbacks] = useState<Array<{
        date: string;
        rpe: number;
        soreness: number;
        reflection: string;
    }>>([]);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        const initDays = () => {
            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                days.push({
                    date: d.toISOString().split('T')[0],
                    rpe: 5,
                    soreness: 3,
                    reflection: "",
                });
            }
            return days;
        };

        const loadData = async () => {
            setIsLoading(true);
            try {
                const res = await api.weeklyFeedbacks?.getBySwimmerAndWeek(swimmerId, weekStart);
                if (res) {
                    setSummary(res.summary || "");
                    setIsSubmitted(res.isSubmitted || false);
                    
                    const days = initDays();
                    if (res.dailyFeedbacks && res.dailyFeedbacks.length > 0) {
                        res.dailyFeedbacks.forEach((df: any) => {
                            const idx = days.findIndex(d => d.date === df.date);
                            if (idx >= 0) {
                                days[idx].rpe = df.rpe || 5;
                                days[idx].soreness = df.soreness || 3;
                                days[idx].reflection = df.reflection || "";
                            }
                        });
                    }
                    setDailyFeedbacks(days);
                } else {
                    setDailyFeedbacks(initDays());
                }
            } catch (e) {
                console.error("Failed to load weekly feedback", e);
                setDailyFeedbacks(initDays());
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [swimmerId, weekStart]);

    const handleSave = async (submitContent: boolean = false) => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            // ONLY ALLOW SUBMISSION IF THERE IS ACTUAL CONTENT
            let hasContent = false;
            if (summary && summary.trim().length > 0) hasContent = true;
            dailyFeedbacks.forEach(df => {
                if (df.reflection && df.reflection.trim().length > 0) hasContent = true;
            });

            if (submitContent && !hasContent) {
                setSaveStatus("错误：未填写任何内容，无法提交！请填写反馈。");
                setIsSaving(false);
                return;
            }

            const res = await api.weeklyFeedbacks?.save({
                swimmerId,
                weekStart,
                summary,
                dailyFeedbacks
            });
            
            if (res && res.skipped) {
                setSaveStatus(res.message);
            } else if (submitContent) {
                setIsSubmitted(true);
                setSaveStatus("提交成功！教练已收到您的本周总结。");
                
                // Smart auto-attendance: mark check-in for the day this was submitted
                const today = new Date().toISOString().split('T')[0];
                markAttendance(swimmerId);
                
            } else {
                setSaveStatus("草稿已局部保存。");
            }
        } catch (e) {
            console.error(e);
            setSaveStatus("保存失败，请检查网络。");
        } finally {
            setIsSaving(false);
            if (!submitContent) {
                setTimeout(() => setSaveStatus(null), 3000);
            }
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center animate-pulse"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" /></div>;
    }

    if (isSubmitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
                <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white mb-2">本周总结已提交</h3>
                <p className="text-muted-foreground text-sm">教练已收到您的反馈，祝周末愉快！</p>
                <div className="mt-6 p-4 bg-black/30 rounded-xl text-left border border-border">
                    <p className="text-sm font-medium text-white mb-2">您的周总评：</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">我的周总结</h2>
                <p className="text-sm text-muted-foreground">每天记一点感受，周末统一发送给教练。教练只能看到有内容的评价。</p>
            </div>

            {/* Daily ACCORDION */}
            <div className="space-y-3">
                {dailyFeedbacks.map((df, idx) => {
                    const isExpanded = expandedDay === idx;
                    const hasContent = df.reflection.trim().length > 0;
                    
                    return (
                        <div key={df.date} className={cn("rounded-xl border transition-all duration-300 overflow-hidden", isExpanded ? "border-primary/50 bg-primary/5" : hasContent ? "border-green-500/30 bg-green-500/5" : "border-border bg-card/30")}>
                            {/* Accordion Head */}
                            <button
                                onClick={() => setExpandedDay(isExpanded ? null : idx)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors", hasContent ? "bg-green-500 text-black" : "bg-white/10 text-white")}>
                                        {hasContent ? <Check className="w-4 h-4" /> : DAY_LABELS[idx].charAt(1)}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            {DAY_LABELS[idx]} 
                                            {idx === new Date().getDay() - 1 && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[10px]">今天</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{df.date}</div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </button>
                            
                            {/* Accordion Body */}
                            <div className={cn("transition-all duration-300", isExpanded ? "max-h-[500px] opacity-100 p-4 pt-0" : "max-h-0 opacity-0 overflow-hidden")}>
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-2 flex flex-col gap-1">
                                                <div className="flex justify-between items-center"><span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 疲劳度 (RPE)</span><span>{df.rpe}/10</span></div>
                                            </label>
                                            <input 
                                                type="range" min="1" max="10" 
                                                value={df.rpe}
                                                onChange={(e) => {
                                                    const newArr = [...dailyFeedbacks];
                                                    newArr[idx].rpe = parseInt(e.target.value);
                                                    setDailyFeedbacks(newArr);
                                                }}
                                                className="w-full accent-primary" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-2 flex flex-col gap-1">
                                                <div className="flex justify-between items-center"><span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 酸痛度</span><span>{df.soreness}/10</span></div>
                                            </label>
                                            <input 
                                                type="range" min="1" max="10" 
                                                value={df.soreness}
                                                onChange={(e) => {
                                                    const newArr = [...dailyFeedbacks];
                                                    newArr[idx].soreness = parseInt(e.target.value);
                                                    setDailyFeedbacks(newArr);
                                                }}
                                                className="w-full accent-red-500" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <textarea
                                            placeholder={`[提示] 今天的状态如何？\n1. 动作执行情况（划水、换气等）\n2. 哪里感觉不舒服？\n3. 离教练要求的目标差多少？`}
                                            value={df.reflection}
                                            onChange={(e) => {
                                                const newArr = [...dailyFeedbacks];
                                                newArr[idx].reflection = e.target.value;
                                                setDailyFeedbacks(newArr);
                                            }}
                                            className="w-full h-24 bg-black/40 border border-border rounded-xl p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Weekly Summary Box */}
            <div className="bg-card/30 border border-border rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-3">这周的整体感悟（教练必看）</h3>
                <textarea
                    placeholder="本周总体感觉如何？哪里有进步？下周想改善什么？这段文字教练会重点关注。"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full h-24 bg-black/50 border border-border rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
            </div>

            {/* Error / Status Bar */}
            {saveStatus && (
                <div className={cn("p-3 rounded-lg text-sm font-medium text-center", saveStatus.includes("错误") ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary")}>
                    {saveStatus}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <button 
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="flex-1 bg-card border border-border text-white px-4 py-3 rounded-xl font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" /> 保存草稿
                </button>
                <button 
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="flex-[2] bg-gradient-to-r from-primary to-blue-400 text-black px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                    上传并提交本周总结
                </button>
            </div>
        </div>
    );
}
