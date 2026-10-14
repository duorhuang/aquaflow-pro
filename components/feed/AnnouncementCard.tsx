"use client";

import { memo, useState } from "react";
import { Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer, ImageLightbox } from "@/components/common/BlockRenderer";
import { formatTimeAgo } from "@/lib/date-utils";

interface AnnouncementCardProps {
    announcement: any;
    isCoach?: boolean;
    onDelete?: (id: string) => void;
    onStar?: (id: string) => void;
}

export const AnnouncementCard = memo(function AnnouncementCard({ announcement, isCoach, onDelete, onStar }: AnnouncementCardProps) {
    const [expandedImages, setExpandedImages] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const timeAgo = formatTimeAgo(announcement.createdAt);

    const blocks = announcement.blocks || [];

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                        教
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-foreground">教练发布</p>
                            {announcement.isStarred && (
                                <Star className="w-3 h-3 text-warning fill-warning" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                </div>
                {isCoach && (
                    <div className="flex items-center gap-1">
                        {onStar && (
                            <button
                                onClick={() => onStar(announcement.id)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    announcement.isStarred
                                        ? "text-warning"
                                        : "text-muted-foreground hover:text-warning"
                                )}
                                title={announcement.isStarred ? "取消收藏" : "收藏"}
                            >
                                <Star className={cn("w-4 h-4", announcement.isStarred && "fill-warning")} />
                            </button>
                        )}
                        {onDelete && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {showDeleteConfirm && (
                                    <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl p-3 shadow-lg w-44">
                                        <p className="text-xs text-foreground mb-2.5">确认删除此动态？</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 text-xs py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setDeleting(true);
                                                    try { await onDelete?.(announcement.id); } catch {}
                                                    finally { setDeleting(false); setShowDeleteConfirm(false); }
                                                }}
                                                className="flex-1 text-xs py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center transition-opacity"
                                                disabled={deleting}
                                            >
                                                {deleting ? (
                                                    <div className="w-3 h-3 border border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                                                ) : "删除"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Blocks */}
            <div className="p-4 space-y-3">
                {blocks.map((block: any, i: number) => (
                    <BlockRenderer
                        key={i}
                        block={block}
                        onImageClick={(url) => setExpandedImages(expandedImages === url ? null : url)}
                    />
                ))}
            </div>

            {/* Image Lightbox */}
            {expandedImages && (
                <ImageLightbox src={expandedImages} onClose={() => setExpandedImages(null)} />
            )}
        </div>
    );
});