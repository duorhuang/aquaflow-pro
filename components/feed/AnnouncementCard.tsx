"use client";

import { useState } from "react";
import { ExternalLink, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer, ImageLightbox } from "@/components/common/BlockRenderer";
import { formatTimeAgo } from "@/lib/date-utils";

interface AnnouncementCardProps {
    announcement: any;
    isCoach?: boolean;
    onDelete?: (id: string) => void;
    onStar?: (id: string) => void;
}

export function AnnouncementCard({ announcement, isCoach, onDelete, onStar }: AnnouncementCardProps) {
    const [expandedImages, setExpandedImages] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const timeAgo = formatTimeAgo(announcement.createdAt);

    const blocks = announcement.blocks || [];

    return (
        <div className="bg-card/40 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        教
                    </div>
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-sm font-bold text-white">教练发布</p>
                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                        {announcement.isStarred && (
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        )}
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
                                        ? "text-yellow-400 hover:text-yellow-300"
                                        : "text-muted-foreground hover:text-yellow-400"
                                )}
                                title={announcement.isStarred ? "取消收藏" : "收藏"}
                            >
                                <Star className={cn("w-4 h-4", announcement.isStarred && "fill-yellow-400")} />
                            </button>
                        )}
                        {onDelete && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {showDeleteConfirm && (
                                    <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl p-3 shadow-xl w-48">
                                        <p className="text-xs text-white mb-2">确认删除此动态？</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 text-xs py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/80"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setDeleting(true);
                                                    try { await onDelete?.(announcement.id); } catch {}
                                                    finally { setDeleting(false); setShowDeleteConfirm(false); }
                                                }}
                                                className="flex-1 text-xs py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                disabled={deleting}
                                            >
                                                {deleting ? (
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="p-5 space-y-4">
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
}
