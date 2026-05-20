"use client";

import { useRef, useState } from "react";
import { Image, Video, Link2, Plus, Trash2, Loader2, X, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { ContentBlock } from "@/types";

interface BlockEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const imageInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    const videoInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    const blocksRef = useRef(blocks);
    blocksRef.current = blocks;

    const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
        onChange(blocksRef.current.map((b, i) => i === index ? { ...b, ...updates } : b));
    };

    const removeBlock = (index: number) => {
        onChange(blocksRef.current.filter((_, i) => i !== index));
    };

    const addBlock = (type: ContentBlock["type"]) => {
        onChange([...blocksRef.current, { type, content: "" }]);
    };

    const handleFileUpload = async (file: File, blockIndex: number, type: "image" | "video") => {
        setUploadingIndex(blockIndex);
        try {
            const result = await api.upload.file(file);
            updateBlock(blockIndex, { content: result.url });
        } catch (e) {
            console.error("Upload failed:", e);
            setUploadError("上传失败，请重试");
            setTimeout(() => setUploadError(null), 3000);
        } finally {
            setUploadingIndex(null);
        }
    };

    const detectPlatform = (url: string): "xiaohongshu" | "douyin" | "bilibili" | "qq" | "youtube" | "direct" | null => {
        if (/xhslink\.com|xiaohongshu\.com/.test(url)) return "xiaohongshu";
        if (/douyin\.com|iesdouyin\.com/.test(url)) return "douyin";
        if (/bilibili\.com\/video\/BV/.test(url)) return "bilibili";
        if (/v\.qq\.com\//.test(url)) return "qq";
        if (/youtube\.com\/|youtu\.be\//.test(url)) return "youtube";
        return null;
    };

    const platformLabels: Record<string, { label: string; color: string }> = {
        xiaohongshu: { label: "小红书", color: "red" },
        douyin: { label: "抖音", color: "white" },
        bilibili: { label: "B站", color: "blue" },
        qq: { label: "腾讯视频", color: "blue" },
        youtube: { label: "YouTube", color: "red" },
    };

    return (
        <div className="space-y-3">
            {blocks.map((block, i) => (
                <div key={i} className="relative group">
                    {blocks.length > 1 && (
                        <button
                            onClick={() => removeBlock(i)}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}

                    {block.type === "text" && (
                        <textarea
                            value={block.content}
                            onChange={e => updateBlock(i, { content: e.target.value })}
                            placeholder="训练说明..."
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                        />
                    )}

                    {block.type === "image" && (
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                                block.content
                                    ? "border-transparent p-0"
                                    : "border-white/20 hover:border-primary/50 hover:bg-white/5"
                            )}
                            onClick={() => !block.content && imageInputRefs.current.get(i)?.click()}
                        >
                            {block.content ? (
                                <div className="relative">
                                    <img
                                        src={block.content}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full rounded-xl max-h-[400px] object-contain"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateBlock(i, { content: "" }); }}
                                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">点击上传图片</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1">JPG, PNG, WebP</p>
                                </>
                            )}
                            <input
                                ref={el => { if (el) imageInputRefs.current.set(i, el); }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, i, "image");
                                    e.target.value = "";
                                }}
                            />
                        </div>
                    )}

                    {block.type === "video" && (
                        <div className="space-y-2">
                            {!block.content ? (
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                                        "border-white/20 hover:border-blue-500/50 hover:bg-white/5"
                                    )}
                                    onClick={() => videoInputRefs.current.get(i)?.click()}
                                >
                                    <Video className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">点击上传视频</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1">MP4, MOV (iPhone)</p>
                                </div>
                            ) : (() => {
                                const platform = detectPlatform(block.content);
                                if (platform && platformLabels[platform]) {
                                    const { label, color } = platformLabels[platform];
                                    if (platform === "xiaohongshu") {
                                        return (
                                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                <ExternalLink className="w-4 h-4 shrink-0" style={{ color: `#${color === 'red' ? 'f87171' : '60a5fa'}` }} />
                                                <span className="text-xs flex-1 truncate" style={{ color: `#${color === 'red' ? 'fca5a5' : '93c5fd'}` }}>{label} 链接</span>
                                                <span className="text-[9px] text-muted-foreground">链接形式展示</span>
                                                <button
                                                    onClick={() => updateBlock(i, { content: "" })}
                                                    className="p-1 hover:text-white transition-colors"
                                                    style={{ color: `#${color === 'red' ? 'f87171' : '60a5fa'}` }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <Play className="w-4 h-4 text-blue-400 shrink-0" />
                                            <span className="text-xs text-blue-300 flex-1 truncate">{label} 视频</span>
                                            <span className="text-[9px] text-green-400">已确认</span>
                                            <button
                                                onClick={() => updateBlock(i, { content: "" })}
                                                className="p-1 text-blue-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                }
                                // Direct video file
                                return (
                                    <div className="relative">
                                        <video src={block.content} controls className="w-full rounded-xl max-h-[400px]" preload="none" playsInline />
                                        <button
                                            onClick={() => updateBlock(i, { content: "" })}
                                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })()}
                            <input
                                ref={el => { if (el) videoInputRefs.current.set(i, el); }}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, i, "video");
                                    e.target.value = "";
                                }}
                            />
                            {/* Video URL input */}
                            <div className="flex items-center gap-2">
                                <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <input
                                    type="text"
                                    value={block.content.startsWith("http") && !block.content.startsWith("data:") ? block.content : ""}
                                    onChange={e => updateBlock(i, { content: e.target.value })}
                                    placeholder="或粘贴视频链接 (Bilibili, 抖音, 小红书...)"
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>
                    )}

                    {block.type === "link" && (
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                            <input
                                type="text"
                                value={block.content}
                                onChange={e => updateBlock(i, { content: e.target.value })}
                                placeholder="粘贴链接..."
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-muted-foreground/50"
                            />
                        </div>
                    )}
                </div>
            ))}

            {/* Add Block Buttons */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => addBlock("text")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> 文字
                </button>
                <button onClick={() => addBlock("image")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Image className="w-3.5 h-3.5" /> 照片
                </button>
                <button onClick={() => addBlock("video")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Video className="w-3.5 h-3.5" /> 视频
                </button>
                <button onClick={() => addBlock("link")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                    <Link2 className="w-3.5 h-3.5" /> 链接
                </button>
            </div>

            {uploadingIndex !== null && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> 上传中...
                </div>
            )}
            {uploadError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {uploadError}
                </div>
            )}
        </div>
    );
}
