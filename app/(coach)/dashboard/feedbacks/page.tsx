"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useStoreSelector } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { CheckCircle, Clock, ChevronDown, ChevronUp, Send, Loader2, MessageSquare, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-foreground font-medium">{t.common.feedbackInbox}</span>
        </nav>
    );
}

export default function FeedbacksPage() {
    const swimmers = useStoreSelector(s => s.swimmers);
    const { t } = useLanguage();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [replyStatus, setReplyStatus] = useState<Record<string, 'success' | 'error'>>({});
    const [activeTab, setActiveTab] = useState<'pending' | 'replied' | 'drafts'>('pending');

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        const timeout = setTimeout(() => {
            setLoadError('加载超时，请检查网络连接后重试');
            setLoading(false);
        }, 15000);
        try {
            const res = await api.weeklyFeedbacks.getAll();
            clearTimeout(timeout);
            setFeedbacks(res || []);
        } catch (e) {
            clearTimeout(timeout);
            const msg = e instanceof Error ? e.message : '加载失败，请稍后重试';
            setLoadError(msg.includes('quota') || msg.includes('402')
                ? '云端数据库配额已满，请联系管理员'
                : `加载失败: ${msg.slice(0, 100)}`);
            setFeedbacks([]);
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

    if (loading && feedbacks.length === 0) {
        return (
            <div className="text-center p-12">
                <Clock className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">加载反馈中...</p>
            </div>
        );
    }

    if (loadError && feedbacks.length === 0) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <Breadcrumb />
                <div className="text-center p-10 bg-card border border-destructive/20 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <h3 className="text-base font-semibold text-foreground mb-1">无法加载反馈</h3>
                    <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">{loadError}</p>
                    <button
                        onClick={load}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-xs transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
            <Breadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" /> 队员反馈收件箱
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">查看队员的每日训练日记与周总结，在此写评语</p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="text-xs bg-secondary hover:bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <>刷新</>}
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-border gap-4 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={cn(
                        "pb-2.5 font-medium text-xs border-b-2 transition-colors flex items-center gap-1.5 shrink-0",
                        activeTab === 'pending'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Clock className="w-3.5 h-3.5" /> {t.dashboard.pending || "待批复"}
                    <span className={cn(
                        "px-1.5 py-0.2 text-[10px] rounded-full font-mono transition-colors",
                        activeTab === 'pending'
                            ? "bg-primary/20 text-primary font-semibold"
                            : "bg-secondary text-muted-foreground"
                    )}>
                        {pendingFeedbacks.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('replied')}
                    className={cn(
                        "pb-2.5 font-medium text-xs border-b-2 transition-colors flex items-center gap-1.5 shrink-0",
                        activeTab === 'replied'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    已批复
                    <span className={cn(
                        "px-1.5 py-0.2 text-[10px] rounded-full font-mono transition-colors",
                        activeTab === 'replied'
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "bg-secondary text-muted-foreground"
                    )}>
                        {repliedFeedbacks.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={cn(
                        "pb-2.5 font-medium text-xs border-b-2 transition-colors flex items-center gap-1.5 shrink-0",
                        activeTab === 'drafts'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    进行中 / 草稿
                    <span className={cn(
                        "px-1.5 py-0.2 text-[10px] rounded-full font-mono transition-colors",
                        activeTab === 'drafts'
                            ? "bg-primary/15 text-primary font-semibold"
                            : "bg-secondary text-muted-foreground"
                    )}>
                        {draftFeedbacks.length}
                    </span>
                </button>
            </div>

            <div className="space-y-4">
                {currentFeedbacks.length === 0 && !loading && (
                    <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
                        <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <h3 className="text-base font-semibold text-foreground mb-1">
                            {activeTab === 'pending' 
                                ? "暂无待批复的周总结" 
                                : activeTab === 'replied' 
                                    ? "暂无已批复的周总结" 
                                    : "暂无进行中的草稿"}
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            {activeTab === 'pending'
                                ? "队员提交周总结后，会在这里显示。批复后会自动移入「已批复」列表中。"
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
                        <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden transition-colors shadow-xs">
                            <div 
                                className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors gap-3"
                                onClick={() => toggleExpand(f.id, f.coachReply)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                                        {swimmer?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 flex-wrap">
                                            {swimmer?.name || "未知队员"}
                                            {f.isSubmitted ? (
                                                f.isReplied ? (
                                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full border border-emerald-500/20 font-medium">已批复</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-full border border-amber-500/20 font-medium">待批复</span>
                                                )
                                            ) : (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 font-medium">草稿</span>
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
                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                    {/* Weekly Tracking Bar */}
                                    <div className="flex gap-1.5 items-center">
                                        <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">打卡进度:</span>
                                        {weekDates.map((date, idx) => {
                                            const df = f.dailyFeedbacks?.find((day: any) => day.date === date);
                                            const hasReflection = df && df.reflection && df.reflection.trim().length > 0;
                                            const hasAnyData = df && (df.reflection || df.rpe || df.soreness);
                                            
                                            return (
                                                <div 
                                                    key={date}
                                                    title={`${date} (${DAY_LABELS_SHORT[idx]}): ${hasReflection ? '已写日志' : '未写日志'}`}
                                                    className={cn(
                                                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium transition-colors border",
                                                        hasReflection
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                                            : hasAnyData
                                                                ? "bg-primary/10 text-primary border-primary/20"
                                                                : "bg-secondary text-muted-foreground border-border opacity-50"
                                                    )}
                                                >
                                                    {DAY_LABELS_SHORT[idx]}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>
                            </div>
                            
                            {isExpanded && (
                                <div className="p-5 border-t border-border bg-secondary/15 space-y-5 animate-in slide-in-from-top-2 duration-200">
                                    {/* Weekly Overall Summary */}
                                    <div className="bg-card border border-border p-4 rounded-xl">
                                        <h4 className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" /> 本周整体感悟
                                        </h4>
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{f.summary || "没有填写大总结"}</p>
                                    </div>
                                    
                                    {/* Chronological Daily Reflection Grid */}
                                    <div className="space-y-2.5">
                                        <h4 className="text-xs font-semibold text-muted-foreground">每日训练反馈明细</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                            {weekDates.map((date, idx) => {
                                                const day = f.dailyFeedbacks?.find((d: any) => d.date === date);
                                                const hasReflection = day && day.reflection && day.reflection.trim().length > 0;
                                                
                                                if (hasReflection) {
                                                    return (
                                                        <div key={date} className="p-3 bg-card border border-border rounded-lg flex flex-col justify-between min-h-[85px]">
                                                            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 bg-emerald-500/15 rounded">
                                                                        {DAY_LABELS_SHORT[idx]}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">{date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-primary font-medium">疲劳: {day.rpe}/10</span>
                                                                    <span className="text-amber-500 font-medium">酸痛: {day.soreness}/10</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed flex-1 mt-1">{day.reflection}</p>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div key={date} className="p-3 bg-secondary/30 border border-border rounded-lg opacity-60 flex flex-col justify-between min-h-[85px]">
                                                            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-muted-foreground px-1.5 py-0.2 bg-secondary rounded">
                                                                        {DAY_LABELS_SHORT[idx]}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground/80">{date}</span>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">未填写</span>
                                                            </div>
                                                            {day && (day.rpe || day.soreness) ? (
                                                                <div className="flex gap-2.5 text-xs text-muted-foreground mt-1">
                                                                    <span>疲劳: {day.rpe ?? '--'}</span>
                                                                    <span>酸痛: {day.soreness ?? '--'}</span>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground/60 italic mt-1">暂无打卡日志</p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>

                                    {/* Coach Reply Box */}
                                    <div className="pt-4 border-t border-border space-y-3">
                                        <h4 className="text-xs font-semibold text-foreground flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                教练评语
                                                {f.isReplied && <span className="text-xs text-muted-foreground font-normal">(上次批复: {new Date(f.repliedAt).toLocaleDateString()})</span>}
                                            </span>
                                        </h4>
                                        
                                        {!f.isSubmitted && (
                                            <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>该队员本周打卡目前处于草稿阶段，您可以预先在此编辑并保存评语。</span>
                                            </div>
                                        )}

                                        <textarea
                                            value={replyDrafts[f.id] !== undefined ? replyDrafts[f.id] : (f.coachReply || "")}
                                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [f.id]: e.target.value }))}
                                            placeholder="在此输入教练寄语与专业指导..."
                                            className="w-full h-24 bg-card border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        
                                        <div className="flex justify-end items-center gap-3">
                                            {replyStatus[f.id] === 'success' && (
                                                <span className="text-xs text-emerald-500 font-medium">已保存发送 ✓</span>
                                            )}
                                            {replyStatus[f.id] === 'error' && (
                                                <span className="text-xs text-destructive">保存失败，请重试</span>
                                            )}
                                            <button 
                                                onClick={() => handlePublishReply(f.id)}
                                                disabled={savingId === f.id}
                                                className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                            >
                                                {savingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
