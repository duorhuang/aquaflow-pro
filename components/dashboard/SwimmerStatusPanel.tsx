"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Swimmer } from "@/types";
import { Activity, AlertTriangle, MessageSquare, Award, Sparkles, X, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_MESSAGES = [
    "今天训练非常专注，状态拉满！🌟",
    "动作细节有很大提升，继续保持！💪",
    "表现神勇，突破自我，太棒了！🏊",
    "克服困难完成高强度组，很有韧性！🔥"
];

export function SwimmerStatusPanel() {
    const { swimmers, feedbacks, updateSwimmer } = useStore();

    // Reward Modal States
    const [selectedSwimmerForReward, setSelectedSwimmerForReward] = useState<Swimmer | null>(null);
    const [rewardAmount, setRewardAmount] = useState<number>(100);
    const [rewardMessage, setRewardMessage] = useState<string>("今天训练非常专注，状态拉满！🌟");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Get latest feedback for each swimmer
    const getLatestFeedback = (swimmerId: string) => {
        const swimmerFeedbacks = (feedbacks || [])
            .filter(f => f.swimmerId === swimmerId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return swimmerFeedbacks[0];
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
                // Instantly update the swimmer in the store to reflect new XP and Level
                updateSwimmer(selectedSwimmerForReward.id, res.swimmer);
                
                setSuccessMessage(`打赏成功！${selectedSwimmerForReward.name} 已获得 ${rewardAmount} XP！`);
                setRewardMessage("");
                // Close after a brief delay to let them see success
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

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    队员状态监控
                </h3>
            </div>

            <div className="space-y-3">
                {swimmers.map(swimmer => {
                    const latestFeedback = getLatestFeedback(swimmer.id);
                    const readiness = swimmer.readiness || 95;
                    const isValidInjury = swimmer.injuryNote
                        && typeof swimmer.injuryNote === 'string'
                        && swimmer.injuryNote.trim().length > 0
                        && swimmer.injuryNote !== 'null';
                    const hasInjury = isValidInjury || swimmer.status === "Injured";

                    // Determine status color
                    const statusColor = hasInjury ? "red" :
                        readiness >= 85 ? "green" :
                            readiness >= 70 ? "yellow" : "orange";

                    return (
                        <div
                            key={swimmer.id}
                            className={cn(
                                "p-4 rounded-xl border transition-all",
                                hasInjury
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-white/5 border-white/10"
                            )}
                        >
                            {/* Swimmer Name & Group */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white max-w-[100px] truncate" title={swimmer.name}>
                                        {swimmer.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/10 rounded flex-shrink-0">
                                        {swimmer.group === "Advanced" ? "高级组" : swimmer.group === "Intermediate" ? "中级组" : swimmer.group === "External" ? "校外组" : "初级组"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            const isMobile = window.innerWidth < 640;
                                            if (isMobile) {
                                                setModalPos({ x: -1, y: -1 });
                                            } else {
                                                const modalWidth = 448;
                                                const modalHeight = 480;
                                                let x = e.clientX - modalWidth - 20;
                                                if (x < 20) {
                                                    x = e.clientX + 20;
                                                    if (x + modalWidth > window.innerWidth) {
                                                        x = window.innerWidth / 2 - modalWidth / 2;
                                                    }
                                                }
                                                let y = e.clientY - modalHeight / 2;
                                                if (y < 20) y = 20;
                                                if (y + modalHeight > window.innerHeight - 20) {
                                                    y = window.innerHeight - modalHeight - 20;
                                                }
                                                setModalPos({ x, y });
                                            }
                                            
                                            setSelectedSwimmerForReward(swimmer);
                                            setRewardAmount(100);
                                            setRewardMessage("今天训练非常专注，状态拉满！🌟");
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        className="px-2.5 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded flex items-center gap-1 transition-all"
                                        title="给该队员打赏 XP"
                                    >
                                        🏆 打赏
                                    </button>
                                    <div className={cn(
                                        "text-sm font-bold",
                                        statusColor === "green" ? "text-green-400" :
                                            statusColor === "yellow" ? "text-yellow-400" :
                                                statusColor === "orange" ? "text-orange-400" :
                                                    "text-red-400"
                                    )}>
                                        {hasInjury ? "⚠️" : readiness >= 85 ? "✅" : readiness >= 70 ? "😐" : "😴"}
                                    </div>
                                </div>
                            </div>

                            {/* Readiness Bar */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">竞技状态</span>
                                    <span className={cn(
                                        "text-xs font-bold",
                                        statusColor === "green" ? "text-green-400" :
                                            statusColor === "yellow" ? "text-yellow-400" :
                                                statusColor === "orange" ? "text-orange-400" :
                                                    "text-red-400"
                                    )}>
                                        {readiness}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            statusColor === "green" ? "bg-green-400" :
                                                statusColor === "yellow" ? "bg-yellow-400" :
                                                    statusColor === "orange" ? "bg-orange-400" :
                                                        "bg-red-400"
                                        )}
                                        style={{ width: `${readiness}%` }}
                                    />
                                </div>
                            </div>

                            {/* Injury Note */}
                            {hasInjury && (
                                <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-red-400 mb-0.5">伤病报告</p>
                                        <p className="text-xs text-red-300">{swimmer.injuryNote}</p>
                                    </div>
                                </div>
                            )}

                            {/* Latest Feedback */}
                            {latestFeedback && (
                                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-xs font-medium text-primary">最新反馈</p>
                                            <span className="text-[10px] text-muted-foreground">
                                                RPE: {latestFeedback.rpe}/10
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {latestFeedback.comments || "无评论"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(latestFeedback.timestamp).toLocaleDateString('zh-CN')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!latestFeedback && !hasInjury && (
                                <p className="text-xs text-muted-foreground italic">暂无反馈</p>
                            )}
                        </div>
                    );
                })}

                {swimmers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无队员数据</p>
                    </div>
                )}
            </div>

            {/* Premium Gold XP Reward Modal */}
            {mounted && selectedSwimmerForReward && createPortal(
                <div 
                    className={cn(
                        "fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] transition-all",
                        modalPos.x === -1 && "flex items-center justify-center p-4"
                    )}
                    onClick={() => !isSubmitting && setSelectedSwimmerForReward(null)}
                >
                    <div 
                        className={cn(
                            "bg-slate-900/95 border border-amber-500/30 w-full max-w-md rounded-2xl p-6 shadow-[0_0_35px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-200 text-white",
                            modalPos.x === -1 ? "relative" : "absolute"
                        )}
                        style={modalPos.x !== -1 ? { top: `${modalPos.y}px`, left: `${modalPos.x}px` } : undefined}
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                            <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                                荣誉打赏：{selectedSwimmerForReward.name}
                            </h3>
                            <button 
                                onClick={() => setSelectedSwimmerForReward(null)} 
                                disabled={isSubmitting}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error & Success Alerts */}
                        {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center justify-between">
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 ml-2">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                                    {successMessage}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* XP Preset Select */}
                            <div>
                                <label className="text-xs font-bold text-amber-400/80 mb-2 block uppercase tracking-wider">打赏金额 (XP)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[100, 200, 300, 500].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setRewardAmount(amt)}
                                            className={cn(
                                                "py-2.5 rounded-xl font-extrabold text-sm border flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm",
                                                rewardAmount === amt
                                                    ? "bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 border-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                                    : "bg-white/5 text-amber-300/80 border-amber-500/20 hover:bg-white/10 hover:border-amber-500/40"
                                            )}
                                        >
                                            <Coins className="w-4 h-4" />
                                            <span>+{amt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-bold text-amber-400/80 mb-2 block uppercase tracking-wider">打赏寄语 (将发送至队员通知流)</label>
                                <textarea
                                    disabled={isSubmitting}
                                    value={rewardMessage}
                                    onChange={(e) => setRewardMessage(e.target.value)}
                                    placeholder="输入激励队员的寄语..."
                                    className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-500/50 rounded-xl px-3 py-2 text-sm text-white outline-none h-20 resize-none transition-all placeholder:text-white/20"
                                />
                            </div>

                            {/* Presets */}
                            <div>
                                <span className="text-xs font-bold text-white/40 mb-1.5 block">快捷寄语选择：</span>
                                <div className="flex flex-wrap gap-1.5 animate-fade-in">
                                    {PRESET_MESSAGES.map((msg, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setRewardMessage(msg)}
                                            className="px-2.5 py-1 text-[11px] bg-white/5 border border-white/5 hover:border-amber-500/20 rounded-lg text-white/70 hover:text-white transition-all text-left"
                                        >
                                            {msg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notice Badge */}
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-xs text-amber-300/70">
                                💡 **说明**：打赏的 XP 将以“双轨制”形式同时增加队员的 **总经验值**（提升等级）与 **金币余额**（用于商城消费）。每日手动打赏全队限额为 3 人次，请合理激励！
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                disabled={isSubmitting || !!successMessage}
                                onClick={handleSendReward}
                                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
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
}
