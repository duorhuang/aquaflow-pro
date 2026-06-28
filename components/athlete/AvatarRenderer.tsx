"use client";

import { UserCircle2, Sparkles, Scissors, Shirt, Heart, Star, Monitor, Image, Layers, Table, Lamp } from "lucide-react";

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

/**
 * Clean, lightweight fallback for shop items thumbnail previews.
 * Fits within the deep-sea dark theme aesthetics of AquaFlow Pro.
 */
export function ItemPreview({ slotType, imageKey, size = 80 }: { slotType: string; imageKey: string; size?: number }) {
    if (!imageKey) return null;

    let IconComponent = Sparkles;
    let colorClass = "text-emerald-400";
    let bgClass = "bg-emerald-950/40 border-emerald-500/10";

    switch (slotType) {
        case 'body':
            IconComponent = Shirt;
            colorClass = "text-cyan-400";
            bgClass = "bg-cyan-950/40 border-cyan-500/10";
            break;
        case 'hair':
            IconComponent = Scissors;
            colorClass = "text-pink-400";
            bgClass = "bg-pink-950/40 border-pink-500/10";
            break;
        case 'hat':
            IconComponent = Star;
            colorClass = "text-amber-400";
            bgClass = "bg-amber-950/40 border-amber-500/10";
            break;
        case 'face':
            IconComponent = Heart;
            colorClass = "text-rose-400";
            bgClass = "bg-rose-950/40 border-rose-500/10";
            break;
        case 'desk_acc':
        case 'desk_ornament':
            IconComponent = Monitor;
            colorClass = "text-indigo-400";
            bgClass = "bg-indigo-950/40 border-indigo-500/10";
            break;
        case 'wall_hanging':
        case 'decoration_wall':
            IconComponent = Image;
            colorClass = "text-purple-400";
            bgClass = "bg-purple-950/40 border-purple-500/10";
            break;
        case 'wallpaper':
        case 'carpet':
        case 'decoration_floor':
            IconComponent = Layers;
            colorClass = "text-teal-400";
            bgClass = "bg-teal-950/40 border-teal-500/10";
            break;
        case 'cabinet':
        case 'large_cabinet':
            IconComponent = Table;
            colorClass = "text-orange-400";
            bgClass = "bg-orange-950/40 border-orange-500/10";
            break;
        case 'ground_lamp':
            IconComponent = Lamp;
            colorClass = "text-yellow-400";
            bgClass = "bg-yellow-950/40 border-yellow-500/10";
            break;
        default:
            IconComponent = Sparkles;
            colorClass = "text-emerald-400";
            bgClass = "bg-emerald-950/40 border-emerald-500/10";
    }

    return (
        <div 
            className={`flex flex-col items-center justify-center rounded-2xl border ${bgClass} w-full h-full relative`}
            style={{ width: size, height: size }}
        >
            <IconComponent className={`w-8 h-8 ${colorClass} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
            <span className="absolute bottom-1.5 text-[9px] text-white/40 tracking-wider truncate max-w-[90%] px-1 select-none">
                {imageKey.split('_').pop()?.toUpperCase()}
            </span>
        </div>
    );
}
