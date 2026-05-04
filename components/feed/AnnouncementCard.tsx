"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer, ImageLightbox } from "@/components/common/BlockRenderer";

interface AnnouncementCardProps {
    announcement: any;
    isCoach?: boolean;
    onDelete?: (id: string) => void;
}

export function AnnouncementCard({ announcement, isCoach, onDelete }: AnnouncementCardProps) {
    const [expandedImages, setExpandedImages] = useState<string | null>(null);
    const timeAgo = getTimeAgo(new Date(announcement.createdAt));

    const blocks = announcement.blocks || [];

    return (
        <div className="bg-card/40 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        教
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">教练发布</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
                    </div>
                </div>
                {isCoach && onDelete && (
                    <button
                        onClick={() => onDelete(announcement.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} 小时前`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
