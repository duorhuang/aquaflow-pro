"use client";

import { UserCircle2, Sparkles } from "lucide-react";

interface AvatarRendererProps {
    gender?: "male" | "female";
    equippedItems?: Record<string, string>;
    size?: number;
    animated?: boolean;
}

/**
 * Static avatar fallback replacing the canvas-based renderer
 * that caused Chrome crashes. Shows equipped item count as a badge.
 * TODO: Re-implement with SVG sprites or PNG frames when stable.
 */
export function AvatarRenderer({ gender = "male", equippedItems = {}, size = 40 }: AvatarRendererProps) {
    const equippedCount = Object.keys(equippedItems).filter(k => equippedItems[k]).length;

    return (
        <div
            className="relative flex items-center justify-center rounded-full bg-slate-900"
            style={{ width: size, height: size }}
            aria-label={`Avatar: ${gender === "female" ? "Female" : "Male"}${equippedCount > 0 ? `, ${equippedCount} items equipped` : ""}`}
        >
            <UserCircle2
                className={gender === "female" ? "text-pink-400" : "text-primary"}
                style={{ width: size * 0.7, height: size * 0.7 }}
            />
            {equippedCount > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-warning flex items-center justify-center border border-black">
                    <Sparkles className="w-2 h-2 text-black" />
                </div>
            )}
        </div>
    );
}
