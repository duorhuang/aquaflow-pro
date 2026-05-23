"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarRendererProps {
    gender: "male" | "female" | string;
    equippedItems?: Record<string, { imageKey?: string } | string | null | undefined>; // maps slotType -> ShopItem object or just imageKey string
    className?: string;
    size?: number; // width/height in px (default 320)
    animated?: boolean;
}

// Color palettes for items based on common prefixes or indices
const getColorByImageKey = (key: string, defaultColor: string = "#3b82f6"): string => {
    if (!key) return defaultColor;
    if (key.includes("gold") || key.includes("champion") || key.includes("poseidon") || key.includes("trident")) return "#ffd700"; // Gold
    if (key.includes("fire") || key.includes("hot") || key.includes("red")) return "#ef4444"; // Red/Flame
    if (key.includes("ice") || key.includes("aurora") || key.includes("blue") || key.includes("abyss")) return "#06b6d4"; // Cyan/Ice
    if (key.includes("dark") || key.includes("black") || key.includes("stealth") || key.includes("titanium")) return "#1e293b"; // Dark/Slate
    if (key.includes("forest") || key.includes("green") || key.includes("mint")) return "#10b981"; // Emerald
    if (key.includes("pink") || key.includes("rose")) return "#ec4899"; // Rose
    if (key.includes("yellow") || key.includes("lemon")) return "#fbbf24"; // Amber
    if (key.includes("purple") || key.includes("violet")) return "#8b5cf6"; // Purple
    if (key.includes("orange") || key.includes("vital")) return "#f97316"; // Orange
    if (key.includes("white")) return "#f8fafc"; // White
    
    // Fallback based on basic indices
    const match = key.match(/\d+/);
    if (match) {
        const colors = ["#f8fafc", "#1e293b", "#3b82f6", "#ef4444", "#64748b", "#10b981", "#ec4899", "#fbbf24", "#f97316", "#8b5cf6", "#78350f"];
        return colors[parseInt(match[0]) % colors.length];
    }
    return defaultColor;
};

export function AvatarRenderer({
    gender = "male",
    equippedItems = {},
    className = "",
    size = 320,
    animated = true
}: AvatarRendererProps) {
    const isMale = gender === "male";

    // Normalize equipped items to string imageKeys
    const getEquippedKey = (slot: string): string => {
        const item = equippedItems[slot];
        if (!item) return "";
        return typeof item === "string" ? item : item.imageKey || "";
    };

    const headKey = getEquippedKey("head");
    const eyesKey = getEquippedKey("eyes");
    const bodyKey = getEquippedKey("body");
    const lowerKey = getEquippedKey("lower");
    const feetKey = getEquippedKey("feet");
    const handKey = getEquippedKey("hand");
    const bgKey = getEquippedKey("background");

    // Colors
    const headColor = getColorByImageKey(headKey, "#f8fafc");
    const eyesColor = getColorByImageKey(eyesKey, "#38bdf8");
    const bodyColor = getColorByImageKey(bodyKey, isMale ? "#3b82f6" : "#2563eb");
    const lowerColor = getColorByImageKey(lowerKey, isMale ? "#0f172a" : "#1e40af");
    const feetColor = getColorByImageKey(feetKey, "#f59e0b");
    const handColor = getColorByImageKey(handKey, "#10b981");

    return (
        <div 
            className={cn("relative overflow-hidden rounded-3xl border border-white/10 flex items-center justify-center bg-slate-950", className)}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            {/* 1. BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0">
                {bgKey ? (
                    <div className="w-full h-full relative">
                        {/* Custom SVG Backgrounds based on key */}
                        {bgKey.includes("olympic") ? (
                            <div className="w-full h-full bg-gradient-to-b from-yellow-950/40 via-slate-900 to-slate-950 flex flex-col justify-end">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400 via-amber-600 to-transparent animate-pulse" />
                                <svg className="w-full h-full absolute inset-0 opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M 0 50 Q 25 38 50 50 T 100 50 V 100 H 0 Z" fill="#ffd700" />
                                    <path d="M 0 65 Q 25 58 50 65 T 100 65 V 100 H 0 Z" fill="#ffd700" opacity="0.6" />
                                    <line x1="20" y1="0" x2="20" y2="100" stroke="#ffd700" strokeWidth="0.5" />
                                    <line x1="50" y1="0" x2="50" y2="100" stroke="#ffd700" strokeWidth="0.5" />
                                    <line x1="80" y1="0" x2="80" y2="100" stroke="#ffd700" strokeWidth="0.5" />
                                </svg>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-[9px] uppercase tracking-widest font-mono text-amber-500/80 font-bold">
                                    🏆 OLYMPIC FINALS COLISEUM
                                </div>
                            </div>
                        ) : bgKey.includes("maldives") ? (
                            <div className="w-full h-full bg-gradient-to-b from-cyan-400/20 via-sky-900 to-slate-950">
                                <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-yellow-300/40 blur-xl animate-pulse" />
                                <svg className="w-full h-full absolute inset-0 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    {/* Palm tree silhouette */}
                                    <path d="M90 100 Q82 60 70 40 Q75 35 80 42 Q80 30 75 38 Q70 25 65 35" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    {/* Sea Waves */}
                                    <path d="M0 70 C30 65 70 75 100 70 V100 H0 Z" fill="#06b6d4" />
                                </svg>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-[9px] uppercase tracking-widest font-mono text-cyan-400/80 font-bold">
                                    🌴 MALDIVES INFINITY POOL
                                </div>
                            </div>
                        ) : bgKey.includes("world_championship") ? (
                            <div className="w-full h-full bg-gradient-to-b from-blue-950/50 via-slate-900 to-slate-950">
                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#3b82f6_1px,transparent_1px),linear-gradient(-45deg,#3b82f6_1px,transparent_1px)] bg-[size:20px_20px]" />
                                <div className="absolute bottom-4 left-0 right-0 text-center text-[9px] uppercase tracking-widest font-mono text-blue-400/80 font-bold">
                                    🌍 WORLD CHAMPIONSHIP ARENA
                                </div>
                            </div>
                        ) : (
                            // Standard pools
                            <div className="w-full h-full bg-gradient-to-b from-sky-950/60 via-slate-900 to-slate-950 relative">
                                <div className="absolute inset-0 opacity-10 bg-water-pattern" />
                                <svg className="w-full h-full absolute inset-0 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M 0 60 Q 25 55 50 60 T 100 60 V 100 H 0 Z" fill="#0284c7" />
                                    <path d="M 0 75 Q 25 72 50 75 T 100 75 V 100 H 0 Z" fill="#0369a1" />
                                </svg>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-[9px] uppercase tracking-widest font-mono text-sky-400/60 font-bold">
                                    🌊 {bgKey.includes("basic") ? "TEAM TRAINING POOL" : "AQUA TRAINING DECK"}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Default beautiful water gradient
                    <div className="w-full h-full bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
                        <svg className="w-full h-full absolute bottom-0 left-0 right-0 opacity-15" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0 10 C30 5 70 15 100 10 V30 H0 Z" fill="#0284c7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* 2D CANVAS VECTOR SVG COMPONENT (Layers 2-7) */}
            <svg 
                viewBox="0 0 100 100" 
                className={cn("w-full h-full z-10 select-none", animated && "animate-swimmer-bob")}
            >
                {/* Visual definitions for glowing filters */}
                <defs>
                    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                    </radialGradient>
                    
                    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0.1   0 0 0 0 0.7   0 0 0 0 1.0  0 0 0 1 0" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
                    </linearGradient>
                </defs>

                {/* 2. FEET LAYER (Flippers / Shoes) */}
                {feetKey && (
                    <g className="feet-layer" filter={feetKey.includes("gold") ? "url(#goldGlow)" : ""}>
                        {feetKey.includes("poseidon") ? (
                            // Greek golden winged flippers
                            <g fill="#ffd700" stroke="#b45309" strokeWidth="0.5">
                                <path d="M 33 82 Q 22 84 15 88 Q 23 88 30 84 Z" /> {/* Left flipper */}
                                <path d="M 67 82 Q 78 84 85 88 Q 77 88 70 84 Z" /> {/* Right flipper */}
                                {/* Left Wings */}
                                <path d="M 28 80 Q 20 74 15 78 Q 22 80 27 82 Z" />
                                <path d="M 29 82 Q 18 78 14 82 Q 22 83 28 83 Z" />
                                {/* Right Wings */}
                                <path d="M 72 80 Q 80 74 85 78 Q 78 80 73 82 Z" />
                                <path d="M 71 82 Q 82 78 86 82 Q 78 83 72 83 Z" />
                            </g>
                        ) : feetKey.includes("monofin") ? (
                            // Large single dolphin fin
                            <path d="M 35 80 L 50 92 L 65 80 Q 50 84 35 80 Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="0.5" />
                        ) : (
                            // Standard Flippers
                            <g fill={feetColor} stroke="#475569" strokeWidth="0.4">
                                <path d="M 36 82 L 25 90 L 32 90 Z" /> {/* Left */}
                                <path d="M 64 82 L 75 90 L 68 90 Z" /> {/* Right */}
                            </g>
                        )}
                    </g>
                )}

                {/* 3. BASE SWIMMER LAYER (Torso, Arms, Legs, Face) */}
                <g className="swimmer-base">
                    {/* Skin Color */}
                    <g fill={isMale ? "#ffdbac" : "#ffd1a9"}>
                        {/* Torso */}
                        <path d="M 40 45 L 42 70 L 58 70 L 60 45 Z" />
                        {/* Shoulders */}
                        <path d="M 32 40 C 32 40 38 45 50 45 C 62 45 68 40 68 40 C 68 40 70 46 60 47 L 40 47 C 30 46 32 40 32 40 Z" />
                        {/* Left Arm */}
                        <path d="M 32 40 Q 24 55 26 68 Q 30 68 35 52 Z" />
                        {/* Right Arm */}
                        <path d="M 68 40 Q 76 55 74 68 Q 70 68 65 52 Z" />
                        {/* Left Leg */}
                        <path d="M 42 70 L 37 84 L 43 84 L 48 70 Z" />
                        {/* Right Leg */}
                        <path d="M 58 70 L 63 84 L 57 84 L 52 70 Z" />
                        {/* Neck */}
                        <rect x="47" y="32" width="6" height="7" rx="2" />
                        {/* Face */}
                        <circle cx="50" cy="27" r="9" />
                    </g>

                    {/* Torso/Body shading */}
                    <path d="M 40 45 L 42 70 L 58 70 L 60 45 Z" fill="url(#bodyShade)" />

                    {/* Cute smiling mouth & cheeks */}
                    <path d="M 48 29 Q 50 31 52 29" fill="none" stroke="#b45309" strokeWidth="0.6" strokeLinecap="round" />
                    <circle cx="45" cy="28" r="0.8" fill="#fb7185" opacity="0.6" />
                    <circle cx="55" cy="28" r="0.8" fill="#fb7185" opacity="0.6" />

                    {/* Hair (Render under cap unless no cap is worn) */}
                    {!headKey && (
                        <g fill={isMale ? "#1e293b" : "#451a03"}>
                            {isMale ? (
                                // Boys spikey wet hair
                                <path d="M 41 24 Q 50 16 59 24 C 61 22 57 19 50 20 C 44 19 39 21 41 24 Z" />
                            ) : (
                                // Girls long cute ponytail
                                <g>
                                    <path d="M 41 24 Q 50 18 59 24 C 58 14 42 14 41 24 Z" />
                                    <path d="M 57 26 Q 66 38 60 42 Q 58 35 57 26 Z" /> {/* Ponytail strand */}
                                </g>
                            )}
                        </g>
                    )}
                </g>

                {/* 4. SWIMWEAR BODY LAYER (Exclusive by Gender) */}
                <g className="swimwear-body">
                    {isMale ? (
                        // Boys body wear (trunks default, upper chest bare unless equipped body shirt)
                        bodyKey && (
                            <path d="M 40 45 L 42 62 H 58 L 60 45 Z" fill={bodyColor} stroke="#1e3a8a" strokeWidth="0.4" />
                        )
                    ) : (
                        // Girls body wear (solid standard one piece swimsuit covers torso)
                        <path 
                            d="M 40 45 L 42 65 C 45 68 55 68 58 65 L 60 45 Z" 
                            fill={bodyKey ? bodyColor : "#1e40af"} 
                            stroke="#0f172a" 
                            strokeWidth="0.4" 
                        />
                    )}
                </g>

                {/* 5. SWIMWEAR LOWER LAYER (Exclusive by Gender) */}
                <g className="swimwear-lower">
                    {isMale ? (
                        // Boys lower wear (Default or equipped swimwear trunks)
                        <path 
                            d="M 41 60 L 39 74 L 47 74 L 50 68 L 53 74 L 61 74 L 59 60 Z" 
                            fill={lowerKey ? lowerColor : "#020617"} 
                            stroke="#334155" 
                            strokeWidth="0.4" 
                        />
                    ) : (
                        // Girls lower wear (Double safety skirt or brief bottom)
                        lowerKey ? (
                            <g fill={lowerColor}>
                                {/* Double layer skirt style bottom */}
                                <path d="M 41 62 L 36 71 L 64 71 L 59 62 Z" />
                                <path d="M 42 68 Q 50 73 58 68" stroke="#1e293b" strokeWidth="0.5" />
                            </g>
                        ) : (
                            // Default swimsuit bottom matching girls body
                            <path 
                                d="M 42 63 L 40 68 C 41 71 43 72 45 71 L 50 65 L 55 71 C 57 72 59 71 60 68 L 58 63 Z" 
                                fill={bodyKey ? bodyColor : "#1e40af"} 
                                stroke="#1e293b" 
                                strokeWidth="0.4" 
                            />
                        )
                    )}
                </g>

                {/* 6. HAND HELD LAYER (Kickboards / Hand paddles / Equipment) */}
                {handKey && (
                    <g className="hand-held-layer" filter={handKey.includes("trident") ? "url(#goldGlow)" : ""}>
                        {handKey.includes("trident") ? (
                            // Golden Poseidon Trident paddles held in hand
                            <g fill="#ffd700" stroke="#d97706" strokeWidth="0.5">
                                <path d="M 75 42 L 75 75" stroke="#d97706" strokeWidth="1.2" /> {/* Shaft */}
                                <path d="M 70 42 L 80 42 L 77 47 L 73 47 Z" /> {/* Crossbar */}
                                <path d="M 71 42 L 71 34 Q 71 33 72 34 L 72 42 Z" /> {/* Left outer spear */}
                                <path d="M 75 42 L 75 30 Q 75 28 76 30 L 76 42 Z" /> {/* Middle spear */}
                                <path d="M 79 42 L 79 34 Q 79 33 78 34 L 78 42 Z" /> {/* Right outer spear */}
                            </g>
                        ) : handKey.includes("snorkel") ? (
                            // Snorkel training gear
                            <path d="M 50 28 L 54 28 Q 57 28 57 22 L 57 12 Q 57 10 59 10" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
                        ) : handKey.includes("board") || handKey.includes("float") ? (
                            // Kickboard held under arm
                            <rect x="18" y="44" width="8" height="15" rx="2" fill={handColor} stroke="#047857" strokeWidth="0.5" />
                        ) : (
                            // Generic sports items (water bottle, towel, elastic band)
                            <rect x="73" y="55" width="4" height="8" rx="1" fill={handColor} stroke="#334155" strokeWidth="0.4" />
                        )}
                    </g>
                )}

                {/* 7. GOGGLES / EYES LAYER */}
                <g className="eyes-layer" filter={eyesKey.includes("abyss") || eyesKey.includes("legend") ? "url(#sunGlow)" : ""}>
                    {eyesKey ? (
                        <g>
                            {/* Strap around head */}
                            <path d="M 41 26 H 59" stroke="#475569" strokeWidth="0.6" />
                            {/* Left Lens */}
                            <ellipse cx="46" cy="26" rx="3.2" ry="2.2" fill={eyesColor} stroke="#1e293b" strokeWidth="0.5" />
                            <circle cx="45.2" cy="25.2" r="0.6" fill="#ffffff" opacity="0.8" />
                            {/* Right Lens */}
                            <ellipse cx="54" cy="26" rx="3.2" ry="2.2" fill={eyesColor} stroke="#1e293b" strokeWidth="0.5" />
                            <circle cx="53.2" cy="25.2" r="0.6" fill="#ffffff" opacity="0.8" />
                            {/* Bridge */}
                            <line x1="49.2" y1="26" x2="50.8" y2="26" stroke="#1e293b" strokeWidth="0.6" />
                            
                            {/* Special particle effects for elite/legendary goggles */}
                            {eyesKey.includes("aurora") && (
                                <g opacity="0.7">
                                    <circle cx="43" cy="23" r="0.5" fill="#a7f3d0" />
                                    <circle cx="57" cy="23" r="0.5" fill="#f472b6" />
                                </g>
                            )}
                        </g>
                    ) : (
                        // Standard friendly dot eyes
                        <g fill="#172554">
                            <circle cx="46" cy="26" r="1" />
                            <circle cx="54" cy="26" r="1" />
                        </g>
                    )}
                </g>

                {/* 8. SWIM CAP LAYER */}
                <g className="swimcap-layer" filter={headKey.includes("gold") || headKey.includes("crest") ? "url(#goldGlow)" : ""}>
                    {headKey ? (
                        <g>
                            {/* Swim Cap Shell */}
                            <path d="M 40.5 24.5 Q 50 16 59.5 24.5 C 59.5 24.5 61 24.5 59.5 26.5 Q 50 25.5 40.5 26.5 C 39 24.5 40.5 24.5 40.5 24.5 Z" fill={headColor} />
                            
                            {/* Custom logo or patterns on cap */}
                            {headKey.includes("olympic") ? (
                                <g transform="translate(48, 20) scale(0.04)" fill="#000000" opacity="0.6">
                                    {/* Olympic Ring Crest */}
                                    <circle cx="20" cy="20" r="10" stroke="gold" strokeWidth="3" fill="none" />
                                    <circle cx="45" cy="20" r="10" stroke="gold" strokeWidth="3" fill="none" />
                                    <circle cx="70" cy="20" r="10" stroke="gold" strokeWidth="3" fill="none" />
                                </g>
                            ) : headKey.includes("fire") ? (
                                // Flame texture
                                <path d="M 46 22 Q 50 17 54 22 Q 50 24 46 22 Z" fill="#f97316" />
                            ) : headKey.includes("fin") ? (
                                // Cute shark fin on top
                                <path d="M 50 18 L 50 11 Q 53 14 55 18 Z" fill={headColor} stroke="#475569" strokeWidth="0.4" />
                            ) : (
                                // Standard colored stripes
                                <line x1="45" y1="21" x2="48" y2="25" stroke="#ffffff" strokeWidth="0.4" opacity="0.4" />
                            )}
                        </g>
                    ) : (
                        // No cap: hair rendered above. Or fallback default white swimming cap if no hair is modeled
                        <g>
                            <path d="M 40.5 24.5 Q 50 17 59.5 24.5 C 59.5 24.5 60.5 24.5 59.5 26 Q 50 25 40.5 26 C 39.5 24.5 40.5 24.5 40.5 24.5 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />
                            <text x="50" y="24" fontSize="2.5" fill="#94a3b8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">TEAM</text>
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}
