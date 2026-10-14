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
            .catch((e) => console.warn("Failed to load existing feedback:", e));
    }, [planId, blockId, swimmerId]);

    const handleSubmit = async () => {
        if (!reaction) return; // Must select like or dislike before submitting
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
        <div className="bg-secondary/40 border border-border rounded-xl p-3.5 mt-2">
            <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                针对这组动作感觉如何？
            </p>
            <div className="flex items-center gap-3 mb-3">
                <button
                    onClick={() => setReaction('like')}
                    className={cn(
                        "flex-1 py-2 rounded-lg border text-xs transition-colors flex items-center justify-center gap-2",
                        reaction === 'like' 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium" 
                            : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <ThumbsUp className="w-3.5 h-3.5" /> 游得顺
                </button>
                <button
                    onClick={() => setReaction('dislike')}
                    className={cn(
                        "flex-1 py-2 rounded-lg border text-xs transition-colors flex items-center justify-center gap-2",
                        reaction === 'dislike' 
                            ? "bg-destructive/10 border-destructive/30 text-destructive font-medium" 
                            : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <ThumbsDown className="w-3.5 h-3.5" /> 不适应
                </button>
            </div>
            {reaction && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="简单说两句..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                        {loading ? "发送中..." : "发送"}
                    </button>
                </div>
            )}
        </div>
    );
}
