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
            <div className={cn("bg-success/10 border border-success/20 rounded-xl p-5 text-center", className)}>
                <p className="text-success font-semibold text-sm">✓ 发布成功！内容已同步给队员</p>
            </div>
        );
    }

    return (
        <div className={cn("border border-border rounded-xl bg-card overflow-hidden", className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">发布新公告</p>
                <p className="text-xs text-muted-foreground mt-0.5">添加文字、照片、视频或链接，指定可见队员</p>
            </div>

            {/* Blocks */}
            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                {blocks.map((block, i) => (
                    <div key={i} className="relative group">
                        {blocks.length > 1 && (
                            <button
                                onClick={() => removeBlock(i)}
                                className="absolute top-2 right-2 p-1 bg-destructive/10 text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                            />
                        )}

                        {block.type === "image" && (
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                    block.content
                                        ? "border-transparent p-0"
                                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                )}
                                onClick={() => !block.content && imageInputRef.current?.click()}
                            >
                                {block.content ? (
                                    <img src={block.content} className="w-full rounded-lg max-h-[400px] object-contain" alt="上传的图片" />
                                ) : (
                                    <>
                                        <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">点击上传图片</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP</p>
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
                                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                    block.content
                                        ? "border-transparent p-0"
                                        : "border-border hover:border-info/50 hover:bg-secondary/50"
                                )}
                                onClick={() => !block.content && videoInputRef.current?.click()}
                            >
                                {block.content ? (
                                    <video src={block.content} controls className="w-full rounded-lg max-h-[400px]" />
                                ) : (
                                    <>
                                        <Video className="w-8 h-8 text-info mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">点击上传视频</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM</p>
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
                                <Link2 className="w-4 h-4 text-info shrink-0" />
                                <input
                                    type="text"
                                    value={block.content}
                                    onChange={e => updateBlock(i, e.target.value)}
                                    placeholder="粘贴链接..."
                                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Block Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => addBlock("text")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> 文字
                    </button>
                    <button onClick={() => addBlock("image")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                        <Image className="w-3.5 h-3.5" /> 照片
                    </button>
                    <button onClick={() => addBlock("video")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                        <Video className="w-3.5 h-3.5" /> 视频
                    </button>
                    <button onClick={() => addBlock("link")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                        <Link2 className="w-3.5 h-3.5" /> 链接
                    </button>
                </div>
            </div>

            {/* Targeting */}
            <div className="px-4 py-3 border-t border-border space-y-3">
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">可见组别</label>
                    <div className="flex gap-2 flex-wrap">
                        {["Advanced", "Intermediate", "Junior", "External"].map(g => (
                            <button
                                key={g}
                                onClick={() => setTargetGroup(targetGroup === g ? "" : g)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                    targetGroup === g
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {g === "Advanced" ? "高级组" : g === "Intermediate" ? "中级组" : g === "External" ? "校外组" : "初级组"}
                            </button>
                        ))}
                    </div>
                </div>

                {swimmers.length > 0 && (
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">指定队员 (可选)</label>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            {swimmers.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSwimmer(s.id)}
                                    className={cn(
                                        "px-2 py-1 rounded-lg text-xs font-medium border transition-colors",
                                        targetSwimmerIds.includes(s.id)
                                            ? "bg-warning/10 border-warning text-warning-foreground"
                                            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Status */}
            {(error || publishing) && (
                <div className="px-4 py-3 border-t border-border">
                    {error ? (
                        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> 发布中...
                        </div>
                    )}
                </div>
            )}

            {/* Publish Button */}
            <div className="px-4 py-3 border-t border-border">
                <button
                    onClick={handlePublish}
                    disabled={publishing || uploading || !hasContent}
                    className={cn(
                        "w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors",
                        hasContent && !publishing && !uploading
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                    )}
                >
                    {publishing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> 发布中...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" /> 发布公告
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
