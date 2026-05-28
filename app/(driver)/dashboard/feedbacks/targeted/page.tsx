"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { Send, Target, MessageSquare, Calendar, Loader2, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getLocalDateISOString } from "@/lib/date-utils";
import { GroupLevel } from "@/types";

const GROUP_LEVELS: GroupLevel[] = ["Junior", "Intermediate", "Advanced", "External"];

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link href="/dashboard" className="hover:text-white transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <Link href="/dashboard/feedbacks" className="hover:text-white transition-colors">{t.common.feedbackInbox}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white font-medium">{t.common.targetedFeedback}</span>
        </nav>
    );
}

export default function TargetedFeedbacksPage() {
    const { swimmers } = useStore();
    const [reminders, setReminders] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [targetIds, setTargetIds] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupLevel[]>([]);
    const [periodStart, setPeriodStart] = useState(getLocalDateISOString(new Date()));
    const [periodEnd, setPeriodEnd] = useState(getLocalDateISOString(new Date()));
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<"success" | "error" | null>(null);
    const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});
    const [savingReplyId, setSavingReplyId] = useState<string | null>(null);
    const [replySaved, setReplySaved] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        try {
            const res = await api.feedbackReminders.getAll(true);
            setReminders(res);
        } catch (e) {
            console.error(e);
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

    const toggleTarget = (id: string) => {
        if (targetIds.includes(id)) {
            setTargetIds(targetIds.filter(x => x !== id));
        } else {
            setTargetIds([...targetIds, id]);
        }
    };

    const getGroupSwimmerIds = (group: GroupLevel): string[] => {
        return (swimmers || []).filter(s => s.group === group).map(s => s.id);
    };

    const toggleGroup = (group: GroupLevel) => {
        const groupIds = getGroupSwimmerIds(group);
        if (groupIds.length === 0) return;
        if (selectedGroups.includes(group)) {
            setSelectedGroups(selectedGroups.filter(g => g !== group));
            setTargetIds(targetIds.filter(id => !groupIds.includes(id)));
        } else {
            setSelectedGroups([...selectedGroups, group]);
            setTargetIds([...new Set([...targetIds, ...groupIds])]);
        }
    };

    const isGroupPartiallySelected = (group: GroupLevel): boolean => {
        const groupIds = getGroupSwimmerIds(group);
        if (groupIds.length === 0) return false;
        const selected = groupIds.filter(id => targetIds.includes(id)).length;
        return selected > 0 && selected < groupIds.length;
    };

    const handleSend = async () => {
        if (!message || isSending) return;
        setIsSending(true);
        try {
            await api.feedbackReminders.create({
                message,
                targetSwimmerIds: targetIds.length > 0 ? targetIds : null,
                targetGroup: selectedGroups.length > 0 ? selectedGroups.join(', ') : null,
                periodStart,
                periodEnd
            });
            setMessage("");
            setTargetIds([]);
            setSelectedGroups([]);
            setSendStatus("success");
            setTimeout(() => setSendStatus(null), 3000);
            await load();
        } catch (e) {
            console.error(e);
            setSendStatus("error");
            setTimeout(() => setSendStatus(null), 3000);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white"> 训练反馈管理</h1>
                    <p className="text-sm text-muted-foreground">向队员发起专项训练问卷，指定时间范围，查看回复（可选特定队员或全队）</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-card/80 to-orange-900/10 border border-orange-500/20 p-6 rounded-2xl">
                <label className="text-sm font-bold text-white block mb-2">通知内容与问题</label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="例如：今天专项游大家的右臂入水姿势有改变吗？有没有感觉肩部不适？请在这里反馈..."
                    className="w-full h-24 bg-black/40 border border-border rounded-xl p-4 text-white resize-none mb-4 focus:ring-1 focus:ring-orange-500 outline-none"
                />

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-bold text-white block mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-400" /> 开始日期
                        </label>
                        <input
                            type="date"
                            value={periodStart}
                            onChange={(e) => setPeriodStart(e.target.value)}
                            className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-white block mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-400" /> 结束日期
                        </label>
                        <input
                            type="date"
                            value={periodEnd}
                            onChange={(e) => setPeriodEnd(e.target.value)}
                            className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </div>

                <label className="text-sm font-bold text-white block mb-2">提问对象（按组快速选择，或点击个人徽章微调）</label>

                {/* Group quick-select buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {GROUP_LEVELS.map(group => {
                        const count = getGroupSwimmerIds(group).length;
                        if (count === 0) return null;
                        const isSelected = selectedGroups.includes(group);
                        const isPartial = !isSelected && isGroupPartiallySelected(group);
                        return (
                            <button
                                key={group}
                                onClick={() => toggleGroup(group)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                    isSelected
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : isPartial
                                        ? "bg-orange-500/40 text-white border-orange-400/60"
                                        : "bg-transparent border-white/20 text-muted-foreground hover:bg-white/5"
                                }`}
                            >
                                <Users className="w-3 h-3" /> {group} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Individual swimmer badges grouped by level */}
                {GROUP_LEVELS.map(group => {
                    const groupSwimmers = (swimmers || []).filter(s => s.group === group);
                    if (groupSwimmers.length === 0) return null;
                    return (
                        <div key={group} className="mb-3">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1.5">{group}</p>
                            <div className="flex flex-wrap gap-2">
                                {groupSwimmers.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleTarget(s.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${targetIds.includes(s.id) ? "bg-orange-500 text-white border-orange-500" : "bg-transparent border-white/20 text-muted-foreground hover:bg-white/5"}`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end items-center gap-3">
                    {sendStatus === "success" && (
                        <span className="text-sm text-green-400">✅ 已发出</span>
                    )}
                    {sendStatus === "error" && (
                        <span className="text-sm text-red-400">发送失败，请重试</span>
                    )}
                    <button
                        onClick={handleSend}
                        disabled={!message || isSending}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isSending ? "正在发布..." : "发布通知"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">过往通知与回复</h2>
                {reminders.map(r => (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="mb-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground">目标: {r.targetSwimmerIds ? "指定队员" : "全队"}</span>
                                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {r.periodStart} 至 {r.periodEnd}
                                </span>
                            </div>
                            <p className="text-white font-medium">Q: {r.message}</p>
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-3">
                            <h4 className="text-xs text-muted-foreground font-bold">队员回复 ({r.responses?.length || 0})</h4>
                            {r.responses?.map((resp: any) => (
                                <div key={resp.id} className="bg-black/30 p-4 rounded-xl space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-4 h-4 text-orange-400 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-bold text-white">{resp.swimmer?.name || "未知"}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(resp.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-white/5 p-2 rounded-lg">{resp.content}</p>
                                        </div>
                                    </div>

                                    {/* Coach Reply Section */}
                                    <div className="ml-7 pt-2 border-t border-white/5 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">教练批复</p>
                                        </div>
                                        <textarea
                                            placeholder="点击输入批复内容，队员将立即收到通知..."
                                            defaultValue={resp.coachReply || ""}
                                            disabled={savingReplyId === resp.id}
                                            onBlur={async (e) => {
                                                const val = e.target.value.trim();
                                                if (val && val !== resp.coachReply) {
                                                    setSavingReplyId(resp.id);
                                                    try {
                                                        await api.feedbackReminders.replyToTargeted(resp.id, val);
                                                        setReplySaved(prev => ({ ...prev, [resp.id]: true }));
                                                        setReplyErrors(prev => { const next = { ...prev }; delete next[resp.id]; return next; });
                                                        setTimeout(() => setReplySaved(prev => { const next = { ...prev }; delete next[resp.id]; return next; }), 3000);
                                                    } catch (err) {
                                                        setReplyErrors(prev => ({ ...prev, [resp.id]: "回复失败" }));
                                                    } finally {
                                                        setSavingReplyId(null);
                                                    }
                                                }
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-muted-foreground/50 focus:ring-1 focus:ring-orange-500 outline-none resize-none h-16 disabled:opacity-60"
                                        />
                                        {savingReplyId === resp.id && (
                                            <p className="text-xs text-orange-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> 正在保存...</p>
                                        )}
                                        {replySaved[resp.id] && (
                                            <p className="text-xs text-green-400">✓ 已保存</p>
                                        )}
                                        {replyErrors[resp.id] && (
                                            <p className="text-xs text-red-400">{replyErrors[resp.id]}</p>
                                        )}
                                        {resp.repliedAt && (
                                            <p className="text-[9px] text-muted-foreground italic text-right">上次回复于: {new Date(resp.repliedAt).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {r.responses?.length === 0 && <p className="text-xs text-muted-foreground italic">暂无回复</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
