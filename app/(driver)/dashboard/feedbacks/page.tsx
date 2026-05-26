"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { CheckCircle, Clock, ChevronDown, ChevronUp, Send, Loader2, MessageSquare, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Breadcrumb() {
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">反馈收件箱</span>
        </nav>
    );
}

export default function FeedbacksPage() {
    const { swimmers } = useStore();
    const { t } = useLanguage();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [replyStatus, setReplyStatus] = useState<Record<string, 'success' | 'error'>>({});
    const [activeTab, setActiveTab] = useState<'pending' | 'replied' | 'drafts'>('pending');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.weeklyFeedbacks.getAll();
            setFeedbacks(res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                load();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [load]);

    const toggleExpand = (id: string, initialReply: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
            if (replyDrafts[id] === undefined) {
                setReplyDrafts(prev => ({ ...prev, [id]: initialReply || "" }));
            }
        }
        setExpandedIds(next);
    };

    const handlePublishReply = async (id: string) => {
        const replyText = replyDrafts[id] || "";
        if (!replyText.trim()) return;

        setSavingId(id);
        try {
            await api.weeklyFeedbacks.reply(id, replyText);
            setReplyStatus(prev => ({ ...prev, [id]: 'success' }));
            setTimeout(() => {
                setReplyStatus(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 3000);
            await load();
        } catch (e) {
            console.error(e);
            setReplyStatus(prev => ({ ...prev, [id]: 'error' }));
        } finally {
            setSavingId(null);
        }
    };

    const getWeekDates = (weekStartStr: string) => {
        if (!weekStartStr || typeof weekStartStr !== 'string') return [];
        const parts = weekStartStr.split('-');
        if (parts.length < 3) return [];
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(year, month, day + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${dt}`);
        }
        return dates;
    };

    const DAY_LABELS_SHORT = ["一", "二", "三", "四", "五", "六", "日"];

    const pendingFeedbacks = feedbacks.filter(f => f.isSubmitted === true && !f.isReplied);
    const repliedFeedbacks = feedbacks.filter(f => f.isSubmitted === true && f.isReplied);
    const draftFeedbacks = feedbacks.filter(f => f.isSubmitted === false);

    const currentFeedbacks = activeTab === 'pending'
        ? pendingFeedbacks
        : activeTab === 'replied'
            ? repliedFeedbacks
            : draftFeedbacks;

    if (loading && feedbacks.length === 0) return <div className="text-center p-10"><Clock className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <Breadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" /> 队员反馈收件箱
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">查看队员的每日训练日记与周总结，在此写评语</p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-border px-4 py-2 rounded-xl text-muted-foreground flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <>🔄 刷新</>}
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={cn(
                        "px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0",
                        activeTab === 'pending'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-white"
                    )}
                >
                        <Clock className="w-4 h-4" /> {t.dashboard.pending || "Pending"}
                    <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-bold transition-all",
                        activeTab === 'pending'
                            ? "bg-primary text-black"
                            : "bg-white/10 text-muted-foreground"
                    )}>
                        {pendingFeedbacks.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('replied')}
                    className={cn(
                        "px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0",
                        activeTab === 'replied'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-white"
                    )}
                >
                    ✅ 已批复
                    <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-bold transition-all",
                        activeTab === 'replied'
                            ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/10"
                            : "bg-white/10 text-muted-foreground"
                    )}>
                        {repliedFeedbacks.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={cn(
                        "px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 shrink-0",
                        activeTab === 'drafts'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-white"
                    )}
                >
                    📝 进行中 / 草稿
                    <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-bold transition-all",
                        activeTab === 'drafts'
                            ? "bg-blue-500/25 text-blue-400 border border-blue-500/10"
                            : "bg-white/10 text-muted-foreground"
                    )}>
                        {draftFeedbacks.length}
                    </span>
                </button>
            </div>

            <div className="space-y-4">
                {currentFeedbacks.length === 0 && !loading && (
                    <div className="text-center py-20 bg-card/10 border border-dashed border-border rounded-3xl animate-in fade-in duration-300">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-bold text-white mb-2">
                            {activeTab === 'pending' 
                                ? "暂无待批复的周总结" 
                                : activeTab === 'replied' 
                                    ? "暂无已批复的周总结" 
                                    : "暂无进行中的草稿"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            {activeTab === 'pending'
                                ? "队员提交周总结后，会在这里显示。批复后会自动移入“已批复”列表中。"
                                : activeTab === 'replied'
                                    ? "批复过的周总结会在这里归档，便于随时查阅。"
                                    : "队员开始填写打卡日记后，即使是草稿状态也会在此实时同步，以防信息丢失。"}
                        </p>
                    </div>
                )}
                {currentFeedbacks.map(f => {
                    const swimmer = swimmers.find(s => s.id === f.swimmerId) || f.swimmer;
                    const isExpanded = expandedIds.has(f.id);
                    const weekDates = getWeekDates(f.weekStart);
                    
                    return (
                        <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-xl">
                            <div 
                                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-white/5 transition-all gap-4"
                                onClick={() => toggleExpand(f.id, f.coachReply)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                        {swimmer?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white flex items-center gap-2 flex-wrap">
                                            {swimmer?.name || "未知队员"}
                                            {f.isSubmitted ? (
                                                f.isReplied ? (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">已批复</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">待批复</span>
                                                )
                                            ) : (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">进行中草稿</span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {f.weekStart} 周总结 
                                            {f.isSubmitted 
                                                ? ` • 提交于 ${f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : '未知时间'}` 
                                                : ' • 自动同步中'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                    {/* Weekly Tracking Bar */}
                                    <div className="flex gap-1.5 items-center">
                                        <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">周打卡进度:</span>
                                        {weekDates.map((date, idx) => {
                                            const df = f.dailyFeedbacks?.find((day: any) => day.date === date);
                                            const hasReflection = df && df.reflection && df.reflection.trim().length > 0;
                                            const hasAnyData = df && (df.reflection || df.rpe || df.soreness);
                                            
                                            return (
                                                <div 
                                                    key={date}
                                                    title={`${date} (${DAY_LABELS_SHORT[idx]}): ${hasReflection ? '已写日志' : '未写日志'}`}
                                                    className={cn(
                                                        "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all border",
                                                        hasReflection
                                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                                                            : hasAnyData
                                                                ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                                                                : "bg-white/5 text-muted-foreground border-white/5 opacity-40"
                                                    )}
                                                >
                                                    {DAY_LABELS_SHORT[idx]}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div className="p-6 border-t border-white/5 bg-black/25 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                    {/* Weekly Overall Summary */}
                                    <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl shadow-inner">
                                        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" /> 本周整体感悟
                                        </h4>
                                        <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{f.summary || "没有填写大总结"}</p>
                                    </div>
                                    
                                    {/* Chronological Daily Reflection Grid */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-muted-foreground">每日训练反馈明细</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {weekDates.map((date, idx) => {
                                                const day = f.dailyFeedbacks?.find((d: any) => d.date === date);
                                                const hasReflection = day && day.reflection && day.reflection.trim().length > 0;
                                                
                                                if (hasReflection) {
                                                    return (
                                                        <div key={date} className="p-3 bg-secondary/20 border border-emerald-500/10 rounded-xl relative overflow-hidden transition-all hover:bg-secondary/30 flex flex-col justify-between min-h-[90px]">
                                                            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-black px-1.5 py-0.5 bg-emerald-400 rounded">
                                                                        {DAY_LABELS_SHORT[idx]}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">{date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="text-xs text-blue-400 font-medium">疲劳: {day.rpe}/10</span>
                                                                    <span className="text-xs text-orange-400 font-medium">酸痛: {day.soreness}/10</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-white whitespace-pre-wrap leading-relaxed flex-1 mt-1">{day.reflection}</p>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div key={date} className="p-3 bg-white/2 border border-white/5 rounded-xl opacity-40 flex flex-col justify-between min-h-[90px]">
                                                            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-muted-foreground px-1.5 py-0.5 bg-white/10 rounded">
                                                                        {DAY_LABELS_SHORT[idx]}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground/60">{date}</span>
                                                                </div>
                                                                <span className="text-[9px] text-muted-foreground/50 bg-white/5 px-1.5 py-0.5 rounded">未填写</span>
                                                            </div>
                                                            {day && (day.rpe || day.soreness) ? (
                                                                <div className="flex gap-2.5 text-xs text-muted-foreground/70 mt-1">
                                                                    <span>疲劳: {day.rpe ?? '--'}</span>
                                                                    <span>酸痛: {day.soreness ?? '--'}</span>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground/40 italic mt-1">暂无打卡日志</p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>

                                    {/* Coach Reply Box */}
                                    <div className="pt-5 mt-6 border-t border-white/5 space-y-3">
                                        <h4 className="text-sm font-bold text-white flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                教练评语
                                                {f.isReplied && <span className="text-xs text-muted-foreground font-normal">(上次批复于: {new Date(f.repliedAt).toLocaleDateString()})</span>}
                                            </span>
                                        </h4>
                                        
                                        {!f.isSubmitted && (
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-300">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>该队员本周的打卡记录目前处于“草稿”阶段，您可以预先在此编辑并保存批复评语。</span>
                                            </div>
                                        )}

                                        <textarea
                                            value={replyDrafts[f.id] !== undefined ? replyDrafts[f.id] : (f.coachReply || "")}
                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [f.id]: e.target.value }))}
                                            placeholder="在此输入教练寄语与专业反馈，队员将在其打卡面板中实时查看到您的关怀与指导..."
                                            className="w-full h-24 bg-black/40 border border-border rounded-xl p-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        
                                        <div className="flex justify-end items-center gap-3">
                                            {replyStatus[f.id] === 'success' && (
                                                <span className="text-xs text-green-400 self-center animate-pulse">已保存发送 ✓</span>
                                            )}
                                            {replyStatus[f.id] === 'error' && (
                                                <span className="text-xs text-red-400 self-center">保存失败，请检查网络后重试</span>
                                            )}
                                            <button 
                                                onClick={() => handlePublishReply(f.id)}
                                                disabled={savingId === f.id}
                                                className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                                            >
                                                {savingId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {f.isSubmitted 
                                                    ? (f.isReplied ? "更新批复" : "发布反馈") 
                                                    : "保存预写评语"}
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
