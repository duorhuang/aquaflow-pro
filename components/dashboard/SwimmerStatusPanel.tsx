"use client";

import { useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Swimmer } from "@/types";
import { AlertTriangle, Award, X, Coins, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRESET_MESSAGES = [
    "今天训练非常专注，状态拉满！🌟",
    "动作细节有很大提升，继续保持！💪",
    "表现神勇，突破自我，太棒了！🏊",
    "克服困难完成高强度组，很有韧性！🔥"
];

const GROUP_LABELS: Record<string, string> = {
    Advanced: "高级",
    Intermediate: "中级",
    External: "校外",
    Junior: "初级",
};

export const SwimmerStatusPanel = memo(function SwimmerStatusPanel() {
    const { swimmers, feedbacks, updateSwimmer } = useStore();

    // Reward Modal States
    const [selectedSwimmerForReward, setSelectedSwimmerForReward] = useState<Swimmer | null>(null);
    const [rewardAmount, setRewardAmount] = useState<number>(100);
    const [rewardMessage, setRewardMessage] = useState<string>("今天训练非常专注，状态拉满！🌟");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getLatestFeedback = (swimmerId: string) => {
        return (feedbacks || [])
            .filter(f => f.swimmerId === swimmerId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    };

    const handleSendReward = async () => {
        if (!selectedSwimmerForReward) return;
        if (!rewardMessage.trim()) {
            setError("请输入打赏寄语以激励队员！");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await api.rewards.reward(
                selectedSwimmerForReward.id,
                rewardAmount,
                rewardMessage.trim()
            );

            if (res && res.success) {
                updateSwimmer(selectedSwimmerForReward.id, res.swimmer);
                setSuccessMessage(`打赏成功！${selectedSwimmerForReward.name} 已获得 ${rewardAmount} XP！`);
                setRewardMessage("");
                setTimeout(() => {
                    setSelectedSwimmerForReward(null);
                    setSuccessMessage(null);
                }, 1500);
            } else {
                setError("打赏失败，请重试");
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "打赏失败，请检查每日限额";
            setError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (swimmers.length === 0) {
        return (
            <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                <p className="text-sm">暂无队员数据</p>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">队员状态</h3>
                <Link
                    href="/dashboard/athletes"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    aria-label="查看队员花名册"
                >
                    全部 <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Swimmer List */}
            <div className="divide-y divide-border">
                {swimmers.map(swimmer => {
                    const latestFeedback = getLatestFeedback(swimmer.id);
                    const isValidInjury = swimmer.injuryNote
                        && typeof swimmer.injuryNote === 'string'
                        && swimmer.injuryNote.trim().length > 0
                        && swimmer.injuryNote !== 'null';
                    const hasInjury = isValidInjury || swimmer.status === "Injured";
                    const readiness = swimmer.readiness || 95;

                    const statusEmoji = hasInjury ? "⚠️" :
                        readiness >= 85 ? "✅" :
                        readiness >= 70 ? "😐" : "😴";

                    return (
                        <div
                            key={swimmer.id}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors",
                                hasInjury && "bg-destructive/5"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                                hasInjury ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                            )}>
                                {swimmer.name.slice(0, 1)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-medium truncate",
                                        hasInjury ? "text-destructive" : "text-foreground"
                                    )}>
                                        {swimmer.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex-shrink-0">
                                        {GROUP_LABELS[swimmer.group || "Junior"] || swimmer.group}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {hasInjury ? (
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3 text-destructive" />
                                            <span className="text-xs text-destructive truncate max-w-[140px]">{swimmer.injuryNote}</span>
                                        </div>
                                    ) : latestFeedback ? (
                                        <span className="text-xs text-muted-foreground">
                                            RPE {latestFeedback.rpe}/10 · {new Date(latestFeedback.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">暂无反馈</span>
                                    )}
                                </div>
                            </div>

                            {/* Status + Reward */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm">{statusEmoji}</span>
                                <button
                                    onClick={() => {
                                        setSelectedSwimmerForReward(swimmer);
                                        setRewardAmount(100);
                                        setRewardMessage("今天训练非常专注，状态拉满！🌟");
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                                    title="给该队员打赏 XP"
                                >
                                    <Trophy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* XP Reward Modal */}
            {mounted && selectedSwimmerForReward && createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
                    onClick={() => !isSubmitting && setSelectedSwimmerForReward(null)}
                >
                    <div
                        className="bg-card border border-border w-full max-w-sm rounded-xl p-5 shadow-lg animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                荣誉打赏：{selectedSwimmerForReward.name}
                            </h3>
                            <button
                                onClick={() => setSelectedSwimmerForReward(null)}
                                disabled={isSubmitting}
                                className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="mb-3 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive flex items-center justify-between">
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-3 bg-success/10 border border-success/20 rounded-lg px-3 py-2 text-sm text-success flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                {successMessage}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* XP Amount */}
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">打赏金额 (XP)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[100, 200, 300, 500].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setRewardAmount(amt)}
                                            className={cn(
                                                "py-2 rounded-lg font-semibold text-sm border transition-colors",
                                                rewardAmount === amt
                                                    ? "bg-amber-500 text-white border-amber-500"
                                                    : "bg-secondary text-foreground border-border hover:border-amber-300"
                                            )}
                                        >
                                            +{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">打赏寄语</label>
                                <textarea
                                    disabled={isSubmitting}
                                    value={rewardMessage}
                                    onChange={(e) => setRewardMessage(e.target.value)}
                                    placeholder="输入激励队员的寄语..."
                                    className="w-full bg-secondary border border-border focus:border-primary rounded-lg px-3 py-2 text-sm text-foreground outline-none h-20 resize-none transition-colors placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Presets */}
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_MESSAGES.map((msg, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => setRewardMessage(msg)}
                                        className="px-2 py-1 text-[11px] bg-secondary border border-border hover:border-amber-300 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-left"
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>

                            {/* Notice */}
                            <p className="text-xs text-muted-foreground bg-secondary border border-border rounded-lg p-2.5">
                                💡 打赏的 XP 将同时增加队员的总经验值与金币余额。每日手动打赏全队限额为 3 人次。
                            </p>

                            {/* Submit */}
                            <button
                                type="button"
                                disabled={isSubmitting || !!successMessage}
                                onClick={handleSendReward}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Coins className="w-4 h-4" />
                                        确认打赏
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});