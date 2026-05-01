"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export function BlockFeedbackPanel({
    planId,
    blockId,
    swimmerId,
    blockName,
    onFeedbackSubmitted
}: {
    planId: string;
    blockId: string;
    swimmerId: string;
    blockName?: string;
    onFeedbackSubmitted?: () => void;
}) {
    const [reaction, setReaction] = useState<'like'|'dislike'|null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.blockFeedbacks.getAll({ planId, blockId, swimmerId })
            .then((feedbacks: any[]) => {
                if (feedbacks.length > 0) {
                    setIsSubmitted(true);
                }
            })
            .catch(() => {});
    }, [planId, blockId, swimmerId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.blockFeedbacks.create({
                planId,
                blockId,
                swimmerId,
                reaction,
                comment: comment || null,
                tags: []
            });
            setIsSubmitted(true);
            if (onFeedbackSubmitted) onFeedbackSubmitted();
        } catch (e) {
            console.error("Failed to submit block feedback:", e);
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-center gap-2 text-primary text-sm font-bold">
                <Check className="w-4 h-4" /> 已记录该动作评价
            </div>
        );
    }

    return (
        <div className="bg-black/20 border border-border rounded-xl p-4 mt-2">
            <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                针对这组动作感觉如何？
            </p>
            <div className="flex items-center gap-3 mb-3">
                <button
                    onClick={() => setReaction('like')}
                    className={cn("flex-1 py-2 rounded-lg border transition-all flex items-center justify-center gap-2", reaction === 'like' ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-card/50 border-border text-muted-foreground hover:bg-white/5")}
                >
                    <ThumbsUp className="w-4 h-4" /> 游得顺
                </button>
                <button
                    onClick={() => setReaction('dislike')}
                    className={cn("flex-1 py-2 rounded-lg border transition-all flex items-center justify-center gap-2", reaction === 'dislike' ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-card/50 border-border text-muted-foreground hover:bg-white/5")}
                >
                    <ThumbsDown className="w-4 h-4" /> 不适应
                </button>
            </div>
            {reaction && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="简单说两句..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {loading ? "发送中..." : "发送"}
                    </button>
                </div>
            )}
        </div>
    );
}
