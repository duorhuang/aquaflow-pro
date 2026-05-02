"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const emitter = {
    listeners: [] as Array<(src: string) => void>,
    emit(src: string) {
        this.listeners.forEach(fn => fn(src));
    },
    subscribe(fn: (src: string) => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(f => f !== fn);
        };
    },
};

export function ImageViewerModal() {
    const [src, setSrc] = useState("");

    useEffect(() => {
        return emitter.subscribe(setSrc);
    }, []);

    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSrc("")}
        >
            <button
                onClick={() => setSrc("")}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            <img
                src={src}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                alt="Full size view"
            />
        </div>
    );
}

export function openImageViewer(src: string) {
    emitter.emit(src);
}

interface ImageViewerProps {
    src: string;
    alt?: string;
    className?: string;
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={cn("cursor-pointer transition-opacity hover:opacity-80", className)}
            onClick={() => openImageViewer(src)}
        />
    );
}
