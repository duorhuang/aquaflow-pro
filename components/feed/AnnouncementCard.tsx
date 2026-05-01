"use client";

import { useState } from "react";
import { ExternalLink, Image as ImageIcon, Play, Type, Link2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setExpandedImages(null)}
                >
                    <img src={expandedImages} className="max-w-full max-h-full rounded-xl" />
                </div>
            )}
        </div>
    );
}

function BlockRenderer({ block, onImageClick }: { block: any; onImageClick: (url: string) => void }) {
    switch (block.type) {
        case "text":
            return (
                <div className="flex items-start gap-2">
                    <Type className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{block.content}</p>
                </div>
            );

        case "image":
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">照片</span>
                    </div>
                    <img
                        src={block.content}
                        alt="Announcement"
                        className="w-full rounded-xl cursor-pointer object-contain max-h-[600px] bg-black/40"
                        onClick={() => onImageClick(block.content)}
                    />
                </div>
            );

        case "video":
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Play className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] text-muted-foreground uppercase">视频</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-black/40">
                        <video
                            src={block.content}
                            controls
                            className="w-full max-h-[600px]"
                            preload="metadata"
                        />
                    </div>
                </div>
            );

        case "link":
            const url = block.content.startsWith("http") ? block.content : `https://${block.content}`;
            const displayUrl = block.content;
            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors group"
                >
                    <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-blue-300 truncate">{displayUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400/50 shrink-0 group-hover:text-blue-400 transition-colors" />
                </a>
            );

        default:
            return null;
    }
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
