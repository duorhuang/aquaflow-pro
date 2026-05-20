"use client";

import { useState } from "react";
import { ImageViewer } from "@/components/common/ImageViewer";
import { BlockRenderer, ImageLightbox } from "@/components/common/BlockRenderer";
import { cn } from "@/lib/utils";

function sanitizeHtml(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

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
                    "text-white space-y-2 text-base",
                    "[&>img]:max-w-full [&>img]:rounded-xl [&>img]:my-2 [&>img]:bg-black/40",
                    "[&>a]:text-blue-400 [&>a]:underline",
                    "[&>ul]:list-disc [&>ul]:pl-5 [&>ul:my-2]",
                    "[&>ol]:list-decimal [&>ol]:pl-5 [&>ol:my-2]",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(session.contentHtml) }}
            />
        );
    }

    // Legacy fallback: image + notes
    return (
        <div className={cn("space-y-3", className)}>
            {session.imageData && (
                <ImageViewer src={session.imageData} className="w-full rounded-2xl" />
            )}
            {session.notes && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
            )}
        </div>
    );
}
