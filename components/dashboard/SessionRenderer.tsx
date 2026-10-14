"use client";

import { useState } from "react";
import { ImageViewer } from "@/components/common/ImageViewer";
import { BlockRenderer, ImageLightbox } from "@/components/common/BlockRenderer";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface SessionRendererProps {
    session: Record<string, any>;
    className?: string;
}

export function SessionRenderer({ session, className }: SessionRendererProps) {
    const mode = session.editorMode || "legacy";
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    if (mode === "block" && session.contentBlocks?.length) {
        return (
            <div className={cn("space-y-4", className)}>
                {session.contentBlocks.map((block: any, i: number) => (
                    <BlockRenderer
                        key={i}
                        block={block as any}
                        onImageClick={(url) => setExpandedImage(expandedImage === url ? null : url)}
                    />
                ))}
                {expandedImage && (
                    <ImageLightbox src={expandedImage} onClose={() => setExpandedImage(null)} />
                )}
            </div>
        );
    }

    if (mode === "rich" && session.contentHtml) {
        return (
            <div
                className={cn(
                    "text-foreground space-y-2 text-base",
                    "[&>img]:max-w-full [&>img]:rounded-xl [&>img]:my-2 [&>img]:bg-secondary",
                    "[&>a]:text-primary [&>a]:underline",
                    "[&>ul]:list-disc [&>ul]:pl-5 [&>ul:my-2]",
                    "[&>ol]:list-decimal [&>ol]:pl-5 [&>ol:my-2]",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(session.contentHtml) }}
            />
        );
    }

    const blocksToRender = session.trainingBlocks || session.blocks;
    if ((mode === "plan" || !mode || mode === "legacy") && blocksToRender && blocksToRender.length > 0) {
        return (
            <div className={cn("space-y-4", className)}>
                {blocksToRender.map((block: any, idx: number) => (
                    <div key={block.id || idx} className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
                        {/* Decorative side bar */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
                            block.type === 'Warmup' ? "bg-emerald-500" :
                            block.type === 'Main Set' ? "bg-rose-500" :
                            block.type === 'Cool Down' ? "bg-sky-500" :
                            "bg-primary"
                        )} />
                        
                        <div className="flex items-center gap-2 mb-3 pl-2">
                            <span className="font-semibold text-foreground text-sm">
                                {block.type === "Warmup" ? "热身" :
                                 block.type === "Pre-Set" ? "预备组" :
                                 block.type === "Main Set" ? "主项" :
                                 block.type === "Drill Set" ? "分解练习" :
                                 block.type === "Cool Down" ? "放松" :
                                 block.type}
                            </span>
                            {block.rounds > 1 && (
                                <span className="bg-secondary text-xs px-1.5 py-0.5 rounded font-mono text-muted-foreground border border-border">x{block.rounds} 组</span>
                            )}
                            {block.note && <span className="text-xs text-muted-foreground ml-auto">{block.note}</span>}
                        </div>

                        <div className="space-y-2 pl-2">
                            {block.items?.map((item: any, iIdx: number) => (
                                <div key={item.id || iIdx} className="bg-secondary/60 rounded-lg p-2.5 flex items-start gap-3 border border-border/50">
                                    <div className="flex items-baseline gap-1 min-w-[60px]">
                                        <span className="font-bold text-foreground">{item.repeats}</span>
                                        <span className="text-muted-foreground text-xs">x</span>
                                        <span className="font-bold text-foreground">{item.distance}</span>
                                        <span className="text-xs text-muted-foreground">m</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-foreground">
                                            {item.description || `${item.stroke === 'Free' ? '自由泳' : item.stroke === 'Back' ? '仰泳' : item.stroke === 'Breast' ? '蛙泳' : item.stroke === 'Fly' ? '蝶泳' : item.stroke === 'IM' ? '混合泳' : '自选'} ${item.distance}m`}
                                        </div>
                                        {(item.equipment?.length > 0 || item.interval) && (
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {item.equipment?.map((eq: string) => (
                                                    <span key={eq} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                                        {eq === 'Fins' ? '脚蹼' : eq === 'Paddles' ? '手蹼' : eq === 'Snorkel' ? '呼吸管' : eq === 'Kickboard' ? '浮板' : '夹板'}
                                                    </span>
                                                ))}
                                                {item.interval && (
                                                    <span className={cn("text-xs font-mono font-medium", item.intervalMode === 'Rest' ? "text-warning" : "text-primary")}>
                                                        {item.intervalMode === 'Rest' ? '休息' : '包干'} {item.interval}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {/* Segments */}
                                        {item.segments && item.segments.length > 0 && (
                                            <div className="mt-2 space-y-1 border-t border-border pt-2">
                                                {item.segments.map((seg: any, sIdx: number) => (
                                                    <div key={sIdx} className="text-xs text-muted-foreground flex gap-2">
                                                        <span className="text-foreground/70 w-8">{seg.distance}m</span>
                                                        <span>{seg.type === 'Swim' ? '配合' : seg.type === 'Kick' ? '打腿' : '分解'}</span>
                                                        {seg.description && <span>- {seg.description}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {session.imageData && (
                    <div className="mt-4">
                        <ImageViewer src={session.imageData} className="w-full rounded-xl border border-border" />
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className={cn("space-y-3", className)}>
            {session.imageData && (
                <ImageViewer src={session.imageData} className="w-full rounded-xl border border-border" />
            )}
            {session.notes && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
            )}
            {!session.imageData && !session.notes && !session.contentHtml && !session.contentBlocks?.length && !session.trainingBlocks?.length && !session.blocks?.length && (
                <p className="text-sm text-muted-foreground italic">教练未发布具体内容，请联系教练确认。</p>
            )}
        </div>
    );
}
