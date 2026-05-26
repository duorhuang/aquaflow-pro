"use client";

import { useState } from "react";
import { ExternalLink, Image as ImageIcon, Play, Type, Link2 } from "lucide-react";

interface ContentBlock {
    type: "text" | "image" | "video" | "link";
    content: string;
    thumbnailUrl?: string;
}

interface BlockRendererProps {
    block: ContentBlock;
    onImageClick?: (url: string) => void;
}

const getVideoEmbed = (url: string): { type: "iframe" | "html5"; src: string; platform?: string } | null => {
    // YouTube is handled via link card in the render logic (blocked in China)
    // Bilibili — embed via iframe
    const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (bilibiliMatch) return { type: "iframe", src: `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&autoplay=0` };
    // QQ Video (腾讯视频)
    const qqMatch = url.match(/v\.qq\.com\/x\/cover\/.*\/([a-zA-Z0-9]+)\.html/);
    if (qqMatch) return { type: "iframe", src: `https://v.qq.com/txp/iframe/player.html?vid=${qqMatch[1]}` };
    // 抖音 (Douyin) — embed via their open player
    const douyinMatch = url.match(/douyin\.com\/video\/(\d+)/);
    if (douyinMatch) return { type: "iframe", src: `https://open.douyin.com/player/video?vid=${douyinMatch[1]}&autoplay=0` };
    // 抖音 short link
    const douyinShort = url.match(/iesdouyin\.com\/share\/video\/(\d+)/);
    if (douyinShort) return { type: "iframe", src: `https://open.douyin.com/player/video?vid=${douyinShort[1]}&autoplay=0` };
    return null;
};

const detectPlatform = (url: string): { type: "xiaohongshu" | "douyin" | "bilibili" | "qq" | "youtube" | "direct" } | null => {
    if (/xhslink\.com|xiaohongshu\.com|小红书/.test(url)) return { type: "xiaohongshu" };
    if (/douyin\.com|iesdouyin\.com/.test(url)) return { type: "douyin" };
    if (/bilibili\.com\/video\/BV/.test(url)) return { type: "bilibili" };
    if (/v\.qq\.com\//.test(url)) return { type: "qq" };
    if (/youtube\.com\/|youtu\.be\//.test(url)) return { type: "youtube" };
    return null;
};

export function BlockRenderer({ block, onImageClick }: BlockRendererProps) {
    const [videoLoaded, setVideoLoaded] = useState(false);

    switch (block.type) {
        case "text":
            return (
                <div className="flex items-start gap-2">
                    <Type className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-base text-white whitespace-pre-wrap leading-relaxed">{block.content}</p>
                </div>
            );

        case "image":
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-muted-foreground uppercase">照片</span>
                    </div>
                    <img
                        src={block.content}
                        alt="Training photo"
                        loading="lazy"
                        decoding="async"
                        className="w-full rounded-xl cursor-pointer object-contain max-h-[600px] bg-black/40"
                        onClick={() => onImageClick?.(block.content)}
                    />
                </div>
            );

        case "video":
            const platform = detectPlatform(block.content);
            const embed = getVideoEmbed(block.content);

            // 小红书 — no embed API, render as link card
            if (platform?.type === "xiaohongshu") {
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Play className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs text-muted-foreground uppercase">小红书</span>
                        </div>
                        <a
                            href={block.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                                <ExternalLink className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">小红书内容</p>
                                <p className="text-xs text-muted-foreground truncate">点击在新页面查看</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-red-400/50 shrink-0 group-hover:text-red-400 transition-colors" />
                        </a>
                    </div>
                );
            }

            // 抖音 — lazy-load iframe (click to play, avoids hanging on slow networks)
            if (platform?.type === "douyin") {
                if (!videoLoaded) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Play className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs text-muted-foreground uppercase">抖音</span>
                            </div>
                            <button
                                onClick={() => setVideoLoaded(true)}
                                className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                    <Play className="w-5 h-5 text-white fill-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">点击加载抖音视频</p>
                                    <p className="text-xs text-muted-foreground">点击后开始加载，避免慢网络下卡顿</p>
                                </div>
                            </button>
                        </div>
                    );
                }
                // Use parsed embed URL if available, otherwise fall back to original link
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Play className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs text-muted-foreground uppercase">抖音</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-black/40" style={{ paddingBottom: "177.78%" }}>
                            <iframe
                                src={embed?.src || block.content}
                                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                                allowFullScreen
                                allow="autoplay"
                            />
                        </div>
                    </div>
                );
            }

            // YouTube — BLOCKED in China, render as link card
            if (platform?.type === "youtube") {
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Play className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs text-muted-foreground uppercase">YouTube</span>
                        </div>
                        <a
                            href={block.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                                <ExternalLink className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">YouTube 视频</p>
                                <p className="text-xs text-muted-foreground">在中国大陆无法直接播放，点击在新页面查看</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-red-400/50 shrink-0 group-hover:text-red-400 transition-colors" />
                        </a>
                    </div>
                );
            }

            // Bilibili / QQ Video — lazy load iframe
            if (embed?.type === "iframe") {
                if (!videoLoaded) {
                    const platformName = embed.src.includes("bilibili") ? "B站" : "腾讯视频";
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Play className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs text-muted-foreground uppercase">视频</span>
                            </div>
                            <button
                                onClick={() => setVideoLoaded(true)}
                                className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <Play className="w-5 h-5 text-blue-400 fill-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">点击加载视频</p>
                                    <p className="text-xs text-muted-foreground">{platformName} — 点击后开始加载</p>
                                </div>
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Play className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs text-muted-foreground uppercase">视频</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-black/40" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                                src={embed.src}
                                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        </div>
                    </div>
                );
            }

            // Direct video file (MP4/WebM from laptop/iPhone)
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Play className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-muted-foreground uppercase">视频</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-black/40">
                        <video
                            src={block.content}
                            controls
                            preload="none"
                            className="w-full max-h-[600px] rounded-xl"
                            playsInline
                        />
                    </div>
                </div>
            );

        case "link":
            if (!block.content) return null;
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

export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <img src={src} className="max-w-full max-h-full rounded-xl" />
        </div>
    );
}
