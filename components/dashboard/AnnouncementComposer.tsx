"use client";

import { useState, useRef } from "react";
import { Image, Video, Link2, X, Send, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useStore } from "@/lib/store";

type BlockType = "text" | "image" | "video" | "link";

interface Block {
    type: BlockType;
    content: string;
    thumbnailUrl?: string;
}

export function AnnouncementComposer({ className }: { className?: string }) {
    const { swimmers, addAnnouncement } = useStore();
    const [blocks, setBlocks] = useState<Block[]>([{ type: "text", content: "" }]);
    const [targetGroup, setTargetGroup] = useState<string>("");
    const [targetSwimmerIds, setTargetSwimmerIds] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const updateBlock = (index: number, content: string) => {
        setBlocks(prev => prev.map((b, i) => i === index ? { ...b, content } : b));
    };

    const removeBlock = (index: number) => {
        setBlocks(prev => prev.filter((_, i) => i !== index));
    };

    const addBlock = (type: BlockType) => {
        setBlocks(prev => [...prev, { type, content: "" }]);
    };

    const toggleSwimmer = (id: string) => {
        setTargetSwimmerIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleFileUpload = async (file: File, blockIndex: number) => {
        setUploading(true);
        try {
            const result = await api.upload.file(file);
            updateBlock(blockIndex, result.url);
        } catch (e) {
            console.error("Upload failed:", e);
            setError("上传失败，请重试");
            setTimeout(() => setError(null), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handlePublish = async () => {
        const validBlocks = blocks.filter(b => b.content.trim());
        if (validBlocks.length === 0) {
            setError("请添加至少一个内容块");
            return;
        }

        setPublishing(true);
        try {
            await addAnnouncement({
                targetGroup: targetGroup || undefined,
                targetSwimmerIds: targetSwimmerIds.length > 0 ? targetSwimmerIds : undefined,
                blocks: validBlocks,
            });
            setBlocks([{ type: "text", content: "" }]);
            setTargetGroup("");
            setTargetSwimmerIds([]);
            setPublished(true);
            setTimeout(() => setPublished(false), 3000);
        } catch (e) {
            console.error("Failed to publish:", e);
            setError("发布失败，请检查网络后重试");
            setTimeout(() => setError(null), 3000);
        } finally {
            setPublishing(false);
        }
    };

    const hasContent = blocks.some(b => b.content.trim());

    if (published) {
        return (
            <div className={cn("bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center", className)}>
                <p className="text-green-400 font-bold">发布成功！内容已同步给队员</p>
            </div>
        );
    }

    return (
        <div className={cn("bg-card/40 border border-border rounded-2xl overflow-hidden", className)}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">发布新动态</h3>
                <p className="text-xs text-muted-foreground mt-0.5">添加文字、照片、视频或链接，指定可见队员</p>
            </div>

            {/* Blocks */}
            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                {blocks.map((block, i) => (
                    <div key={i} className="relative group">
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(i)}
                                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}

                        {block.type === "text" && (
                            <textarea
                                value={block.content}
                                onChange={e => updateBlock(i, e.target.value)}
                                placeholder="写点什么..."
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
                                onClick={() => !block.content && imageInputRef.current?.click()}
                            >
                                {block.content ? (
                                    <img src={block.content} className="w-full rounded-xl max-h-[400px] object-contain" />
                                ) : (
                                    <>
                                        <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">点击上传图片</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">JPG, PNG, WebP</p>
                                    </>
                                )}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, i);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        )}

                        {block.type === "video" && (
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                                    block.content
                                        ? "border-transparent p-0"
                                        : "border-white/20 hover:border-blue-500/50 hover:bg-white/5"
                                )}
                                onClick={() => !block.content && videoInputRef.current?.click()}
                            >
                                {block.content ? (
                                    <video src={block.content} controls className="w-full rounded-xl max-h-[400px]" />
                                ) : (
                                    <>
                                        <Video className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">点击上传视频</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">MP4, WebM</p>
                                    </>
                                )}
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, i);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        )}

                        {block.type === "link" && (
                            <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                                <input
                                    type="text"
                                    value={block.content}
                                    onChange={e => updateBlock(i, e.target.value)}
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
            </div>

            {/* Targeting */}
            <div className="px-5 py-4 border-t border-white/5 space-y-3">
                <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">可见组别</label>
                    <div className="flex gap-2">
                        {["Advanced", "Intermediate", "Junior", "External"].map(g => (
                            <button
                                key={g}
                                onClick={() => setTargetGroup(targetGroup === g ? "" : g)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                    targetGroup === g
                                        ? "bg-primary/20 border-primary text-primary"
                                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                                )}
                            >
                                {g === "Advanced" ? "高级组" : g === "Intermediate" ? "中级组" : g === "External" ? "校外组" : "初级组"}
                            </button>
                        ))}
                    </div>
                </div>

                {swimmers.length > 0 && (
                    <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">指定队员 (可选)</label>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            {swimmers.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSwimmer(s.id)}
                                    className={cn(
                                        "px-2 py-1 rounded-lg text-xs font-medium border transition-colors",
                                        targetSwimmerIds.includes(s.id)
                                            ? "bg-yellow-500/20 border-yellow-500 text-yellow-300"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                                    )}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Publish Status */}
            {(error || publishing) && (
                <div className="px-5 py-3 border-t border-white/5">
                    {error ? (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> 发布中...
                        </div>
                    )}
                </div>
            )}

            {/* Publish Button */}
            <div className="px-5 py-4 border-t border-white/5">
                <button
                    onClick={handlePublish}
                    disabled={publishing || uploading || !hasContent}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                        publishing || uploading
                            ? "bg-yellow-500/80 text-white cursor-wait"
                            : hasContent
                            ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                            : "bg-white/5 text-muted-foreground cursor-not-allowed"
                    )}
                >
                    {publishing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> 发布中...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" /> 发布
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
