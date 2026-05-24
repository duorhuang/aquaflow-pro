"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarRendererProps {
    gender: string; // Active base character: "shinchan" | "minion" | "loggervick" | "ggbond" | "conan" | "octonauts"
    equippedItems?: Record<string, { imageKey?: string } | string | null | undefined>;
    className?: string;
    size?: number;
    animated?: boolean;
}

// Smart helper to extract keys with character-prefix fallback
const getKey = (equippedItems: any, slot: string, gender: string) => {
    if (!equippedItems) return "";
    const specificItem = equippedItems[`${gender}_${slot}`];
    if (specificItem) {
        return typeof specificItem === "string" ? specificItem : specificItem.imageKey || "";
    }
    const genericItem = equippedItems[slot];
    if (genericItem) {
        return typeof genericItem === "string" ? genericItem : genericItem.imageKey || "";
    }
    return "";
};

export function AvatarRenderer({
    gender = "shinchan",
    equippedItems = {},
    className = "",
    size = 320,
    animated = true
}: AvatarRendererProps) {
    const activeBase = gender || "shinchan";

    const baseKey = getKey(equippedItems, "base", activeBase); // Premium skin
    const headKey = getKey(equippedItems, "head", activeBase) || `default_head_${activeBase}`;
    const eyesKey = getKey(equippedItems, "eyes", activeBase);
    const bodyKey = getKey(equippedItems, "body", activeBase);
    const lowerKey = getKey(equippedItems, "lower", activeBase);
    const feetKey = getKey(equippedItems, "feet", activeBase);
    const handKey = getKey(equippedItems, "hand", activeBase);
    const bgKey = getKey(equippedItems, "background", activeBase);

    // Is premium skin equipped?
    const hasSkin = !!baseKey;

    const isOneEyedMinion = eyesKey === "eyes_minion_classicgoggles";

    return (
        <div 
            className={cn("relative overflow-hidden rounded-3xl flex items-center justify-center bg-[#faf8f5] border border-[#e3dac9] shadow-md", className)}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes breathe {
                    0%, 100% { transform: scaleY(1) translateY(0); }
                    50% { transform: scaleY(1.015) translateY(-0.8px); }
                }
                @keyframes blink {
                    0%, 96%, 98%, 100% { transform: scaleY(1); }
                    97% { transform: scaleY(0.1); }
                }
                @keyframes float-prop {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                @keyframes water-shimmer {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes neon-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .anim-breathe { animation: breathe 4s ease-in-out infinite; transform-origin: center 85%; }
                .anim-blink { animation: blink 4s linear infinite; transform-origin: center 30%; }
                .anim-prop { animation: float-prop 3s ease-in-out infinite; }
                .anim-neon { animation: neon-pulse 1.2s infinite; }
            `}} />

            {/* ==========================================
                1. BACKGROUNDS (背景层 - 漫画纸张格调)
               ========================================== */}
            <div className="absolute inset-0 z-0">
                {(() => {
                    switch (bgKey) {
                        case 'bg_universal_pool':
                        default:
                            return (
                                <div className="w-full h-full relative" style={{ background: "linear-gradient(to bottom, #dbeafe, #93c5fd)" }}>
                                    <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {/* Paper texture overlay */}
                                        <filter id="paperTexture">
                                            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                                            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.07 0" />
                                            <feComposite operator="in" in2="SourceGraphic" />
                                        </filter>
                                        <rect width="100" height="100" fill="#fff" filter="url(#paperTexture)" opacity="0.4" />
                                        
                                        <g opacity="0.3" style={animated ? { animation: 'water-shimmer 12s linear infinite' } : {}}>
                                            <path d="M 0 40 Q 25 35 50 40 T 100 40 T 150 40 T 200 40 L 200 100 L 0 100 Z" fill="#ffffff" />
                                        </g>
                                        {/* Sketchy ground shadow */}
                                        <ellipse cx="50" cy="88" rx="26" ry="4" fill="#000" opacity="0.15" />
                                    </svg>
                                </div>
                            );
                    }
                })()}
            </div>

            {/* ==========================================
                2. SVG MAIN AVATAR CANVAS (手绘漫画风描边)
               ========================================== */}
            <svg 
                viewBox="0 0 100 100" 
                className={cn("w-[92%] h-[92%] z-10 select-none overflow-visible", animated && "anim-breathe")}
            >
                <defs>
                    {/* Hand-drawn Sketchy Filter: warps lines so they look like ink on comic paper */}
                    <filter id="sketchyPen" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
                    </filter>

                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="1.0" floodColor="#000" floodOpacity="0.22" />
                    </filter>

                    <filter id="neonGlow">
                        <feGaussianBlur stdDeviation="0.8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    {/* Metallic Gold Gradients */}
                    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffe066" />
                        <stop offset="50%" stopColor="#f59f00" />
                        <stop offset="100%" stopColor="#d9480f" />
                    </linearGradient>

                    {/* Blazing Fire Red */}
                    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ff922b" />
                        <stop offset="100%" stopColor="#f03e3e" />
                    </linearGradient>

                    {/* Hazel Brown eye gradient for GG Bond */}
                    <radialGradient id="brownEyeGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="65%" stopColor="#78350f" />
                        <stop offset="100%" stopColor="#451a03" />
                    </radialGradient>

                    {/* Premium 2.5D Volumetric Sporty Blue for Swim Cap */}
                    <linearGradient id="universalCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22b8cf" />
                        <stop offset="50%" stopColor="#0b7285" />
                        <stop offset="100%" stopColor="#0c8599" />
                    </linearGradient>
                </defs>

                {/* Apply the sketchyPen filter globally to the avatar group to warp lines into a hand-drawn illustration style! */}
                <g filter="url(#sketchyPen)" className="overflow-visible">
                    
                    {/* ==========================================
                        3. BASE CHARACTER & PREMIUM SKINS
                       ========================================== */}
                    <g filter="url(#shadow)">
                        {(() => {
                            switch (activeBase) {
                                // ------------------------------------------
                                // 蜡笔小新 (shinchan) - 100% 还原手绘土豆脸与粗眉毛
                                // ------------------------------------------
                                case 'shinchan':
                                    return (
                                        <g>
                                            {/* Chubby organic legs */}
                                            <rect x="42" y="73" width="5.5" height="10" rx="2.5" fill="#fdd1a2" stroke="#000" strokeWidth="1.8" />
                                            <rect x="52.5" y="73" width="5.5" height="10" rx="2.5" fill="#fdd1a2" stroke="#000" strokeWidth="1.8" />
                                            {/* Hand-drawn socks and shoes */}
                                            <path d="M 39 82 C 39 82, 42 80, 48 82 L 48 85 L 39 85 Z" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
                                            <path d="M 52 82 C 52 82, 55 80, 61 82 L 61 85 L 52 85 Z" fill="#ffffff" stroke="#000" strokeWidth="1.4" />

                                            {/* Red T-shirt & Yellow shorts with organic wavy creases */}
                                            <path d="M 36 50 C 36 50, 50 52, 64 50 L 62 67 C 50 69, 50 69, 38 67 Z" fill="#ff4d4f" stroke="#000" strokeWidth="1.8" />
                                            <path d="M 38 66 L 62 66 L 61 74 C 50 77, 50 77, 39 74 Z" fill="#ffeb3b" stroke="#000" strokeWidth="1.8" />
                                            
                                            {/* Clothing folds/creases */}
                                            <path d="M 39 53 Q 41 57 44 54" fill="none" stroke="#000" strokeWidth="1.2" />
                                            <path d="M 61 53 Q 59 57 56 54" fill="none" stroke="#000" strokeWidth="1.2" />
                                            <line x1="50" y1="67" x2="50" y2="72" stroke="#000" strokeWidth="1.3" />

                                            {/* 100% Precise potato face - iconic cheek bulge on the left */}
                                            <path d="M 36 18 C 48 16, 64 17, 68 22 C 72 26, 73 31, 73 34 C 73 39, 69 43, 62 44 C 54 45, 38 45, 27 41 C 21 38, 19 33, 19 28 C 19 22, 26 19, 36 18 Z" fill="#fdd1a2" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Detailed right ear with inner cartilage swirl */}
                                            <path d="M 72 29 C 75 29, 77 32, 75 35 C 73 37, 71 36, 70 33" fill="#fdd1a2" stroke="#000" strokeWidth="1.4" />
                                            <path d="M 72 31 Q 74 33 72 35" fill="none" stroke="#000" strokeWidth="0.8" />

                                            {/* Crop hair cap */}
                                            <path d="M 30 18 C 28 14, 32 10, 39 9 C 48 8, 62 10, 67 18 C 69 20, 68 22, 66 21 C 62 19, 45 17, 30 18 Z" fill="#262626" stroke="#000" strokeWidth="1" />
                                            <path d="M 28 20 Q 24 23 25 25" stroke="#000" strokeWidth="1.3" fill="none" />

                                            {/* Iconic extra thick messy black eyebrows */}
                                            <path d="M 33 21 C 36 17, 43 18, 46 21" stroke="#000" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                                            <path d="M 52 21 C 55 18, 62 17, 65 21" stroke="#000" strokeWidth="4.5" strokeLinecap="round" fill="none" />

                                            {/* Oval vertical anime eyes looking sideways */}
                                            <g className="anim-blink">
                                                <ellipse cx="42.5" cy="28.5" rx="5.5" ry="6.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                                <ellipse cx="42.5" cy="28.5" rx="4.2" ry="5" fill="#000" />
                                                <circle cx="41.5" cy="26.5" r="1.0" fill="#fff" />
                                                
                                                <ellipse cx="57.5" cy="28.5" rx="5.5" ry="6.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                                <ellipse cx="57.5" cy="28.5" rx="4.2" ry="5" fill="#000" />
                                                <circle cx="56.5" cy="26.5" r="1.0" fill="#fff" />
                                            </g>

                                            {/* Shy pink blush cheeks */}
                                            <ellipse cx="28" cy="35" rx="3.5" ry="2" fill="#ff4d4f" opacity="0.4" />
                                            <ellipse cx="66" cy="35" rx="3.5" ry="2" fill="#ff4d4f" opacity="0.4" />
                                            
                                            {/* Happy wobbly mouth with pink tongue */}
                                            <path d="M 46 36.5 Q 50 39.5 54 36.5" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />

                                            {/* Manga Cross-Hatch Shading under Chin */}
                                            <g stroke="#000" strokeWidth="0.5" opacity="0.7">
                                                <line x1="43" y1="45" x2="40" y2="49" />
                                                <line x1="46" y1="45" x2="43" y2="49" />
                                                <line x1="49" y1="45" x2="46" y2="49" />
                                                <line x1="52" y1="45" x2="49" y2="49" />
                                                <line x1="55" y1="45" x2="52" y2="49" />
                                            </g>

                                            {/* Organic wobbly chubby limbs */}
                                            <path d="M 36 52 Q 22 55 26 62" fill="none" stroke="#000" strokeWidth="8.5" strokeLinecap="round" />
                                            <path d="M 36 52 Q 22 55 26 62" fill="none" stroke="#fdd1a2" strokeWidth="5.5" strokeLinecap="round" />
                                            
                                            <path d="M 64 52 Q 78 55 74 62" fill="none" stroke="#000" strokeWidth="8.5" strokeLinecap="round" />
                                            <path d="M 64 52 Q 78 55 74 62" fill="none" stroke="#fdd1a2" strokeWidth="5.5" strokeLinecap="round" />

                                            {/* Premium skin elements: Action Mask Mask & Emblem overlay */}
                                            {hasSkin && (
                                                <g>
                                                    {/* Green suit overlay */}
                                                    <path d="M 36 50 C 36 50, 50 52, 64 50 L 62 67 C 50 69, 50 69, 38 67 Z" fill="#52c41a" stroke="#000" strokeWidth="1.8" />
                                                    <path d="M 45 50 L 50 67 L 55 50 Z" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
                                                    <circle cx="50" cy="58" r="2.5" fill="#f5222d" stroke="#000" strokeWidth="1" />
                                                    {/* Blue Action Mask */}
                                                    <path d="M 22 23 C 22 23, 50 20, 71 23 L 69 36 C 50 37, 50 37, 29 36 Z" fill="#1890ff" stroke="#000" strokeWidth="1.8" />
                                                    <circle cx="41.5" cy="29.5" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
                                                    <circle cx="41.5" cy="29.5" r="2.2" fill="#000" />
                                                    <circle cx="58.5" cy="29.5" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
                                                    <circle cx="58.5" cy="29.5" r="2.2" fill="#000" />
                                                    <path d="M 27 22 L 30 13 M 67 22 L 64 13" stroke="#fadb14" strokeWidth="3.5" strokeLinecap="round" />
                                                </g>
                                            )}
                                        </g>
                                    );

                                // ------------------------------------------
                                // 小黄人 (minion) - 100% 还原胶囊背带裤与单/双眼切换
                                // ------------------------------------------
                                case 'minion':
                                    return (
                                        <g>
                                            {/* Capsule Body */}
                                            <path d="M 33 28 A 17 17 0 0 1 67 28 L 67 70 A 17 17 0 0 1 33 70 Z" fill="#ffe066" stroke="#000" strokeWidth="1.8" />

                                            {/* Denim Overalls with stitches & pockets */}
                                            <path d="M 33 54 C 33 54, 50 56, 67 54 L 67 70 A 17 17 0 0 1 33 70 Z" fill="#2d59ca" stroke="#000" strokeWidth="1.8" />
                                            {/* Shoulder straps */}
                                            <path d="M 33 54 L 42 45" stroke="#2546a3" strokeWidth="5" strokeLinecap="round" />
                                            <path d="M 33 54 L 42 45" stroke="#000" strokeWidth="1.2" fill="none" />
                                            <path d="M 67 54 L 58 45" stroke="#2546a3" strokeWidth="5" strokeLinecap="round" />
                                            <path d="M 67 54 L 58 45" stroke="#000" strokeWidth="1.2" fill="none" />
                                            {/* Metallic golden buttons */}
                                            <circle cx="42" cy="46" r="2.2" fill="#d4af37" stroke="#000" strokeWidth="1" />
                                            <circle cx="58" cy="46" r="2.2" fill="#d4af37" stroke="#000" strokeWidth="1" />
                                            {/* Front pocket with G-logo */}
                                            <path d="M 45 58 L 55 58 L 54 66 L 46 66 Z" fill="#2d59ca" stroke="#1d3d94" strokeWidth="1.4" />
                                            <circle cx="50" cy="62" r="2.0" fill="none" stroke="#1d3d94" strokeWidth="1" />
                                            <line x1="49" y1="62" x2="51" y2="62" stroke="#1d3d94" strokeWidth="1" />
                                            {/* Double stitching lines */}
                                            <path d="M 34 56 Q 50 58 66 56" fill="none" stroke="#1d3d94" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

                                            {/* Goofy smile with teeth */}
                                            <path d="M 43 47 Q 50 54 57 47" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                                            <path d="M 45 48.5 Q 50 51 55 48.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                            
                                            {/* Spiky hair */}
                                            <path d="M 50 12 V 5 M 46 13 L 42 7 M 54 13 L 58 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

                                            {/* Yellow organic arms and three-fingered black gloves */}
                                            <path d="M 33 46 Q 20 54 24 62" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 33 46 Q 20 54 24 62" fill="none" stroke="#ffe066" strokeWidth="6" strokeLinecap="round" />
                                            <circle cx="24" cy="62" r="3.5" fill="#262626" stroke="#000" strokeWidth="1" />
                                            <circle cx="21" cy="61" r="1.5" fill="#262626" stroke="#000" strokeWidth="0.8" />
                                            <circle cx="25" cy="65" r="1.5" fill="#262626" stroke="#000" strokeWidth="0.8" />
                                            
                                            <path d="M 67 46 Q 80 54 76 62" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 67 46 Q 80 54 76 62" fill="none" stroke="#ffe066" strokeWidth="6" strokeLinecap="round" />
                                            <circle cx="76" cy="62" r="3.5" fill="#262626" stroke="#000" strokeWidth="1" />
                                            <circle cx="79" cy="61" r="1.5" fill="#262626" stroke="#000" strokeWidth="0.8" />
                                            <circle cx="75" cy="65" r="1.5" fill="#262626" stroke="#000" strokeWidth="0.8" />

                                            {/* Overalls pants legs & thick black boots */}
                                            <path d="M 41 70 L 41 78" stroke="#2546a3" strokeWidth="5" strokeLinecap="round" />
                                            <path d="M 59 70 L 59 78" stroke="#2546a3" strokeWidth="5" strokeLinecap="round" />
                                            <rect x="37.5" y="77" width="7" height="6.5" rx="2" fill="#1f1f1f" stroke="#000" strokeWidth="1.5" />
                                            <rect x="55.5" y="77" width="7" height="6.5" rx="2" fill="#1f1f1f" stroke="#000" strokeWidth="1.5" />

                                            {/* Dynamic single-eye vs double-eye rendering based on goggles */}
                                            {isOneEyedMinion ? (
                                                <g>
                                                    {/* Black goggles strap */}
                                                    <path d="M 31 29 H 69" stroke="#262626" strokeWidth="5" strokeLinecap="round" />
                                                    <path d="M 31 29 H 69" stroke="#000" strokeWidth="1" />
                                                    {/* Single large metallic goggle */}
                                                    <circle cx="50" cy="29" r="13" fill="#afafaf" stroke="#000" strokeWidth="1.8" />
                                                    <circle cx="50" cy="29" r="10.5" fill="#fff" stroke="#000" strokeWidth="1" />
                                                    <circle cx="50" cy="29" r="5.5" fill="#a0522d" />
                                                    <circle cx="50" cy="29" r="3" fill="#000" />
                                                    <circle cx="48" cy="27" r="1.2" fill="#fff" />
                                                    {/* Rivets */}
                                                    <circle cx="39" cy="29" r="0.8" fill="#444" />
                                                    <circle cx="61" cy="29" r="0.8" fill="#444" />
                                                    <circle cx="50" cy="18" r="0.8" fill="#444" />
                                                </g>
                                            ) : (
                                                <g>
                                                    {/* Black goggles strap */}
                                                    <path d="M 31 29 H 69" stroke="#262626" strokeWidth="5" strokeLinecap="round" />
                                                    <path d="M 31 29 H 69" stroke="#000" strokeWidth="1" />
                                                    {/* Double metallic goggles */}
                                                    <circle cx="44" cy="29" r="9" fill="#afafaf" stroke="#000" strokeWidth="1.6" />
                                                    <circle cx="44" cy="29" r="7" fill="#fff" stroke="#000" strokeWidth="1" />
                                                    <circle cx="44" cy="29" r="4.2" fill="#a0522d" />
                                                    <circle cx="44" cy="29" r="2.2" fill="#000" />
                                                    <circle cx="42.5" cy="27.5" r="1" fill="#fff" />
                                                    
                                                    <circle cx="56" cy="29" r="9" fill="#afafaf" stroke="#000" strokeWidth="1.6" />
                                                    <circle cx="56" cy="29" r="7" fill="#fff" stroke="#000" strokeWidth="1" />
                                                    <circle cx="56" cy="29" r="4.2" fill="#a0522d" />
                                                    <circle cx="56" cy="29" r="2.2" fill="#000" />
                                                    <circle cx="54.5" cy="27.5" r="1" fill="#fff" />
                                                    {/* Rivets */}
                                                    <circle cx="37" cy="29" r="0.8" fill="#444" />
                                                    <circle cx="63" cy="29" r="0.8" fill="#444" />
                                                </g>
                                            )}
                                        </g>
                                    );

                                // ------------------------------------------
                                // 光头强 (loggervick) - 100% 还原橙色安全帽与咧嘴龇牙
                                // ------------------------------------------
                                case 'loggervick':
                                    return (
                                        <g>
                                            {/* Peanut shaped Face Contour */}
                                            <path d="M 38 23 C 38 16, 62 16, 62 23 C 62 27, 56 31, 56 35 C 56 38, 62 41, 62 46 C 62 52, 55 55, 50 55 C 45 55, 38 52, 38 46 C 38 41, 44 38, 44 35 C 44 31, 38 27, 38 23 Z" fill="#fdd1a2" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Detailed side ears */}
                                            <path d="M 37 28 C 34 28, 31 31, 34 35 C 36 38, 38 36, 38 31" fill="#fdd1a2" stroke="#000" strokeWidth="1.4" />
                                            <path d="M 63 28 C 66 28, 69 31, 66 35 C 64 38, 62 36, 62 31" fill="#fdd1a2" stroke="#000" strokeWidth="1.4" />

                                            {/* 1. Official Orange Safety Helmet */}
                                            <path d="M 33 19 C 33 7, 67 7, 67 19 Z" fill="url(#gold)" stroke="#000" strokeWidth="1.6" />
                                            <path d="M 28 18 C 28 18, 50 15, 72 18 L 70 21 C 70 21, 50 18, 30 21 Z" fill="#ff781e" stroke="#000" strokeWidth="1.4" />
                                            {/* Helmet Green Logo */}
                                            <rect x="47.5" y="9" width="5" height="5" fill="#52c41a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                                            <circle cx="50" cy="11.5" r="1.5" fill="#fadb14" />

                                            {/* 2. Bulging wide mischief eyes */}
                                            <g className="anim-blink">
                                                <ellipse cx="45" cy="21.5" rx="4.8" ry="5.8" fill="#fff" stroke="#000" strokeWidth="1.4" />
                                                <circle cx="45" cy="21.5" r="1.6" fill="#000" />
                                                <ellipse cx="55" cy="21.5" rx="4.8" ry="5.8" fill="#fff" stroke="#000" strokeWidth="1.4" />
                                                <circle cx="55" cy="21.5" r="1.6" fill="#000" />
                                            </g>
                                            <path d="M 40 14 Q 45 11 49 14.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                                            <path d="M 60 14 Q 55 11 51 14.5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                                            {/* 3. Protruding pear-shaped flesh nose */}
                                            <path d="M 45 21.5 C 43 25, 43 29, 50 30 C 57 29, 57 25, 55 21.5 Z" fill="#fca5a5" stroke="#000" strokeWidth="1.4" />
                                            <ellipse cx="48" cy="24" rx="0.8" ry="1.2" fill="#fff" opacity="0.6" />

                                            {/* 4. Giant grinning mouth displaying two rows of teeth */}
                                            <path d="M 37 33.5 Q 50 36.5 63 33.5 Q 61 47.5 50 47.5 Q 39 47.5 37 33.5 Z" fill="#5c0606" stroke="#000" strokeWidth="1.6" />
                                            {/* Upper white teeth */}
                                            <path d="M 38.5 34.5 Q 50 36.5 61.5 34.5 L 61 37 Q 50 39 39 37 Z" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                                            {/* Lower white teeth */}
                                            <path d="M 41 45 Q 50 43.5 59 45 L 58.5 46.8 Q 50 45.2 41.5 46.8 Z" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                                            {/* Red Tongue */}
                                            <path d="M 46 44.5 Q 50 41 54 44.5 C 53 46.5, 47 46.5, 46 44.5 Z" fill="#ff7875" />

                                            {/* 5. Thin pencil mustache & realistic stubble shadow */}
                                            <path d="M 38 41 C 38 41, 41 49, 50 49 C 59 49, 62 41, 62 41 C 62 46, 59 54, 50 54 C 41 54, 38 46, 38 41 Z" fill="#94a3b8" opacity="0.5" />
                                            <path d="M 38 31 Q 50 34 62 31" fill="none" stroke="#000" strokeWidth="2.8" strokeLinecap="round" />

                                            {/* 6. Navy shirt & Brown woodcutter vest with cream fur trim */}
                                            <path d="M 35 48 C 35 48, 50 50, 65 48 L 62 66 H 38 Z" fill="#1e293b" stroke="#000" strokeWidth="1.6" />
                                            {/* Vest wings */}
                                            <path d="M 35 48 L 44 48 L 41 66 L 38 66 Z" fill="#7c2d12" stroke="#000" strokeWidth="1.5" />
                                            <path d="M 65 48 L 56 48 L 59 66 L 62 66 Z" fill="#7c2d12" stroke="#000" strokeWidth="1.5" />
                                            {/* Fluffy cream fur border */}
                                            <path d="M 44 48 L 41 66" stroke="#fdf6e2" strokeWidth="3.2" strokeLinecap="round" />
                                            <path d="M 56 48 L 59 66" stroke="#fdf6e2" strokeWidth="3.2" strokeLinecap="round" />

                                            {/* Wobbly wobbly organic limbs */}
                                            <path d="M 35 50 Q 22 56 26 63" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 35 50 Q 22 56 26 63" fill="none" stroke="#fdd1a2" strokeWidth="5.5" strokeLinecap="round" />
                                            <path d="M 65 50 Q 78 56 74 63" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 65 50 Q 78 56 74 63" fill="none" stroke="#fdd1a2" strokeWidth="5.5" strokeLinecap="round" />

                                            {/* Pants legs and Logger boots */}
                                            <rect x="42.5" y="66" width="5" height="15" rx="2" fill="#fdd1a2" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="66" width="5" height="15" rx="2" fill="#fdd1a2" stroke="#000" strokeWidth="1.4" />
                                            <rect x="39" y="78" width="10.5" height="7" rx="2.5" fill="#301503" stroke="#000" strokeWidth="1.5" />
                                            <rect x="51" y="78" width="10.5" height="7" rx="2.5" fill="#301503" stroke="#000" strokeWidth="1.5" />
                                        </g>
                                    );

                                // ------------------------------------------
                                // 猪猪侠 (ggbond) - 100% 还原超人头盔与单眼眨表情
                                // ------------------------------------------
                                case 'ggbond':
                                    return (
                                        <g>
                                            {/* Chubby Pink Pig Face */}
                                            <path d="M 30 30 C 30 18, 70 18, 70 30 C 70 41, 64 47, 50 47 C 36 47, 30 41, 30 30 Z" fill="#ffe4e6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            {/* Floppy pig ears */}
                                            <path d="M 31 23 C 27 23, 23 27, 26 33 C 28 36, 31 34, 31 29" fill="#fecdd3" stroke="#000" strokeWidth="1.5" />
                                            <path d="M 69 23 C 73 23, 77 27, 74 33 C 72 36, 69 34, 69 29" fill="#fecdd3" stroke="#000" strokeWidth="1.5" />

                                            {/* Red battle helmet */}
                                            <path d="M 28 28 C 28 14, 72 14, 72 28 Z" fill="#e11d48" stroke="#000" strokeWidth="1.8" />
                                            {/* Forehead padded roll */}
                                            <path d="M 28 22 C 28 22, 50 13, 72 22 C 72 22, 50 18, 28 22 Z" fill="#be123c" stroke="#000" strokeWidth="1.6" />
                                            {/* Two large yellow round goggles/eyes on top */}
                                            <circle cx="39" cy="13" r="5" fill="#fcd34d" stroke="#000" strokeWidth="1.5" />
                                            <circle cx="39" cy="13" r="3.2" fill="#fb923c" />
                                            <circle cx="61" cy="13" r="5" fill="#fcd34d" stroke="#000" strokeWidth="1.5" />
                                            <circle cx="61" cy="13" r="3.2" fill="#fb923c" />

                                            {/* Horizontal pink snout with vertical nostrils */}
                                            <ellipse cx="50" cy="35.5" rx="8.5" ry="5.8" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.8" />
                                            <ellipse cx="46.8" cy="35.5" rx="1.2" ry="2.2" fill="#9f1239" />
                                            <ellipse cx="53.2" cy="35.5" rx="1.2" ry="2.2" fill="#9f1239" />
                                            {/* Happy teeth smirk */}
                                            <path d="M 39 42 Q 50 46 61 42 Q 58 48 50 48 Q 42 48 39 42 Z" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
                                            <line x1="42" y1="43" x2="42" y2="44.5" stroke="#000" strokeWidth="0.8" />
                                            <line x1="58" y1="43" x2="58" y2="44.5" stroke="#000" strokeWidth="0.8" />

                                            {/* Unique winking eye setup */}
                                            {/* Right eye winking shut */}
                                            <path d="M 34 26.5 Q 41 30.5 45 26.5" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                                            {/* Left eye wide open and brown sparkling */}
                                            <ellipse cx="57.5" cy="25" rx="5.5" ry="6.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                                            <ellipse cx="57.5" cy="25" rx="4.5" ry="5.5" fill="url(#brownEyeGrad)" />
                                            <ellipse cx="57.5" cy="25" rx="2.5" ry="3.2" fill="#000" />
                                            <circle cx="56" cy="23" r="1.2" fill="#fff" />
                                            <circle cx="59.5" cy="26.5" r="0.6" fill="#fff" />
                                            {/* Thick curved eyebrows */}
                                            <path d="M 32 17.5 Q 38 14 44 17.5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                            <path d="M 52 17.5 Q 58 14 64 17.5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                                            {/* Red Battle Suit with large gold belly emblem */}
                                            <path d="M 33 46 C 33 46, 50 48, 67 46 L 63 68 C 50 71.5, 50 71.5, 37 68 Z" fill="#e11d48" stroke="#000" strokeWidth="1.8" />
                                            {/* Gold belly patch */}
                                            <ellipse cx="50" cy="60.5" rx="8" ry="5.5" fill="url(#gold)" stroke="#d97706" strokeWidth="1.5" />
                                            {/* '00' logo slits */}
                                            <ellipse cx="47.5" cy="60.5" rx="0.8" ry="2.2" fill="#78350f" />
                                            <ellipse cx="52.5" cy="60.5" rx="0.8" ry="2.2" fill="#78350f" />

                                            {/* Arms & Hands with gold gloves */}
                                            <path d="M 33 48 Q 20 56 24 63" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 33 48 Q 20 56 24 63" fill="none" stroke="#e11d48" strokeWidth="5.5" strokeLinecap="round" />
                                            <circle cx="24" cy="63" r="3.5" fill="url(#gold)" stroke="#000" strokeWidth="1" />

                                            <path d="M 67 48 Q 80 56 76 63" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 67 48 Q 80 56 76 63" fill="none" stroke="#e11d48" strokeWidth="5.5" strokeLinecap="round" />
                                            <circle cx="76" cy="63" r="3.5" fill="url(#gold)" stroke="#000" strokeWidth="1" />

                                            {/* Legs & Gold boots */}
                                            <rect x="41.5" y="66" width="6" height="13" rx="2" fill="#e11d48" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="66" width="6" height="13" rx="2" fill="#e11d48" stroke="#000" strokeWidth="1.4" />
                                            <rect x="38" y="76" width="10.5" height="7.5" rx="3.2" fill="url(#gold)" stroke="#000" strokeWidth="1.5" />
                                            <rect x="51.5" y="76" width="10.5" height="7.5" rx="3.2" fill="url(#gold)" stroke="#000" strokeWidth="1.5" />
                                        </g>
                                    );

                                // ------------------------------------------
                                // 柯南 (conan) - 100% 还原V形下巴、大圆眼镜与双呆毛
                                // ------------------------------------------
                                case 'conan':
                                    return (
                                        <g>
                                            {/* Pointy V-shaped anime Face */}
                                            <path d="M 33 24 C 33 13, 67 13, 67 24 C 67 31, 58 39, 50 42 C 42 39, 33 31, 33 24 Z" fill="#fed7aa" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Detailed side ears */}
                                            <path d="M 32 24 C 29 24, 27 27, 29 31 C 31 34, 33 32, 33 27" fill="#fed7aa" stroke="#000" strokeWidth="1.2" />
                                            <path d="M 68 24 C 71 24, 73 27, 71 31 C 69 34, 67 32, 67 27" fill="#fed7aa" stroke="#000" strokeWidth="1.2" />

                                            {/* Spiky layered anime hair with double cowlicks */}
                                            <path d="M 31 23 L 37 26 L 41 22 L 46 27 L 51 21 L 55 27 L 60 22 L 64 27 L 67 23 Q 50 13 31 23 Z" fill="#5c2e0b" stroke="#000" strokeWidth="1.5" />
                                            {/* Hair spikes overlapping forehead */}
                                            <path d="M 33 21 L 37 26 L 41 21 L 46 27 L 51 20 L 55 27 L 60 21 L 64 26 L 67 21" stroke="#000" strokeWidth="1.2" fill="none" />
                                            {/* Dual cowlicks at the top-right */}
                                            <path d="M 62 13 Q 66 1 63 1 Q 59 4 60 13" fill="#5c2e0b" stroke="#000" strokeWidth="1.2" />
                                            <path d="M 64 10 Q 69 3 67 2 Q 62 6 63 10" fill="#5c2e0b" stroke="#000" strokeWidth="1" />

                                            {/* Oversized Thin Round Glasses */}
                                            <circle cx="41" cy="26" r="10.5" fill="none" stroke="#1f1f1f" strokeWidth="2.2" />
                                            <circle cx="59" cy="26" r="10.5" fill="none" stroke="#1f1f1f" strokeWidth="2.2" />
                                            <line x1="51.5" y1="26" x2="48.5" y2="26" stroke="#1f1f1f" strokeWidth="2.2" />
                                            {/* Spectacles glass glare lines */}
                                            <line x1="36" y1="21" x2="44" y2="29" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
                                            <line x1="54" y1="21" x2="62" y2="29" stroke="#fff" strokeWidth="1.2" opacity="0.5" />

                                            {/* Blue oval anime eyes under glasses */}
                                            <g className="anim-blink">
                                                <ellipse cx="42" cy="26" rx="4.5" ry="5.5" fill="#fff" stroke="#000" strokeWidth="1" />
                                                <ellipse cx="42" cy="26" rx="3.5" ry="4.5" fill="#1e3a8a" />
                                                <circle cx="42" cy="26" r="1.6" fill="#000" />
                                                <circle cx="40.5" cy="24.2" r="0.8" fill="#fff" />
                                                
                                                <ellipse cx="58" cy="26" rx="4.5" ry="5.5" fill="#fff" stroke="#000" strokeWidth="1" />
                                                <ellipse cx="58" cy="26" rx="3.5" ry="4.5" fill="#1e3a8a" />
                                                <circle cx="58" cy="26" r="1.6" fill="#000" />
                                                <circle cx="56.5" cy="24.2" r="0.8" fill="#fff" />
                                            </g>
                                            
                                            {/* Tiny folding anime fold-line nose */}
                                            <line x1="49" y1="33" x2="50" y2="34.5" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" />
                                            {/* Confident side smirk */}
                                            <path d="M 45 37.5 Q 49 39.5 53 37" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />

                                            {/* Royal Blue blazer & white collar & red bow tie */}
                                            <path d="M 35 44 C 35 44, 50 46, 65 44 L 62 66 H 38 Z" fill="#1d4ed8" stroke="#000" strokeWidth="1.8" />
                                            <polygon points="46,44 50,52 54,44" fill="#fff" stroke="#000" strokeWidth="1" />
                                            {/* Voice transmitter butterfly bow tie */}
                                            <path d="M 44 47 C 44 47, 41 45, 41 48 C 41 51, 45 49, 47 49 L 50 51 L 53 49 C 55 49, 59 51, 59 48 C 59 45, 56 47, 56 47 Z" fill="#be123c" stroke="#000" strokeWidth="1.2" />
                                            <circle cx="50" cy="48" r="1.5" fill="#9f1239" />
                                            {/* Single gold blazer button */}
                                            <circle cx="50" cy="57" r="2.2" fill="url(#gold)" stroke="#d97706" strokeWidth="1" />

                                            {/* Stylish hand-on-waist pose with detailed fingers */}
                                            <path d="M 35 45 Q 24 53 28 62" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" />
                                            <path d="M 35 45 Q 24 53 28 62" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />

                                            <path d="M 65 45 Q 73 52 70 60" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" />
                                            <path d="M 65 45 Q 73 52 70 60" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
                                            {/* Hands on waist fingers detail */}
                                            <path d="M 70 60 C 69 60, 66 61, 66 63 M 70 60 C 69 61, 67 63, 67 65 M 70 60 C 70 61, 69 64, 69 66" stroke="#000" strokeWidth="1" fill="none" />

                                            {/* Grey shorts & wobbly legs */}
                                            <rect x="42" y="65" width="5.5" height="15" rx="2" fill="#fed7aa" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="65" width="5.5" height="15" rx="2" fill="#fed7aa" stroke="#000" strokeWidth="1.4" />
                                            <path d="M 38 66 H 62 L 61 73 H 39 Z" fill="#9ca3af" stroke="#000" strokeWidth="1.6" />
                                            <rect x="39.5" y="78" width="8" height="6" rx="2" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="78" width="8" height="6" rx="2" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
                                        </g>
                                    );

                                // ------------------------------------------
                                // 巴克队长 (octonauts) - 100% 还原蓝耳垫、章鱼章与胶囊眼
                                // ------------------------------------------
                                case 'octonauts':
                                    return (
                                        <g>
                                            {/* Squashed wide Polar Bear head */}
                                            <path d="M 32 30 C 32 17, 68 17, 68 30 C 68 40, 60 45, 50 45 C 40 45, 32 40, 32 30 Z" fill="#f8fafc" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Polar bear ears with soft light-blue pads */}
                                            <circle cx="33" cy="20" r="6" fill="#f8fafc" stroke="#000" strokeWidth="1.4" />
                                            <circle cx="33" cy="20" r="3.8" fill="#b5d5ec" />
                                            <circle cx="67" cy="20" r="6" fill="#f8fafc" stroke="#000" strokeWidth="1.4" />
                                            <circle cx="67" cy="20" r="3.8" fill="#b5d5ec" />

                                            {/* 1. Official Blue Captain Cap with octopus emblem */}
                                            <path d="M 35 17 Q 50 5 65 17 Q 50 20 35 17 Z" fill="#3bc9db" stroke="#000" strokeWidth="1.6" />
                                            <path d="M 35 17 Q 50 14 65 17" stroke="#0b7285" strokeWidth="1.2" fill="none" />
                                            {/* White emblem badge */}
                                            <circle cx="50" cy="11.5" r="4.2" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                                            {/* White octopus */}
                                            <circle cx="50" cy="10.5" r="1.5" fill="#0b7285" />
                                            <path d="M 48.5 12.5 Q 50 11.5 51.5 12.5 M 49.2 13 Q 50 12 50.8 13" stroke="#0b7285" strokeWidth="0.8" strokeLinecap="round" fill="none" />

                                            {/* 2. Horizontal round-rect capsule black eyes */}
                                            <g className="anim-blink">
                                                <rect x="38" y="24" width="7" height="4.5" rx="2" fill="#1f1f1f" stroke="#000" strokeWidth="1" />
                                                <rect x="39" y="25" width="1.5" height="1.5" rx="0.3" fill="#ffffff" />
                                                
                                                <rect x="55" y="24" width="7" height="4.5" rx="2" fill="#1f1f1f" stroke="#000" strokeWidth="1" />
                                                <rect x="56" y="25" width="1.5" height="1.5" rx="0.3" fill="#ffffff" />
                                            </g>

                                            {/* 3. Light-blue cloud snout & charcoal nose cap */}
                                            <path d="M 44 33 C 44 30.5, 46 29.5, 50 29.5 C 54 29.5, 56 30.5, 56 33 C 56 35.5, 53 36.5, 50 36.5 C 47 36.5, 44 35.5, 44 33 Z" fill="#a9cce3" stroke="#5fa0d4" strokeWidth="1.2" />
                                            <ellipse cx="50" cy="30" rx="2.5" ry="1.6" fill="#343a40" />

                                            {/* 4. Teal Commander Uniform with neck arrows & zipper */}
                                            <path d="M 35 44 C 35 44, 50 46, 65 44 L 62 66 H 38 Z" fill="#0b7285" stroke="#000" strokeWidth="1.8" />
                                            {/* Uniform collar */}
                                            <path d="M 38 44 Q 50 47 62 44 L 62 41 Q 50 43 38 41 Z" fill="#0891b2" stroke="#000" strokeWidth="1.4" />
                                            {/* Neck arrows '>>> <<<' */}
                                            <path d="M 41 42.5 L 43 43.5 L 41 44.5 M 44 42.5 L 46 43.5 L 44 44.5 M 59 42.5 L 57 43.5 L 59 44.5 M 56 42.5 L 54 43.5 L 56 44.5" stroke="#ffe066" strokeWidth="1" fill="none" strokeLinecap="round" />
                                            {/* Silver zipper */}
                                            <line x1="50" y1="44" x2="50" y2="52" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="1.5,1.5" />
                                            <circle cx="50" cy="53" r="1" fill="#ced4da" stroke="#000" strokeWidth="0.5" />

                                            {/* 5. Utility belt & Round compass buckle */}
                                            <rect x="37" y="60" width="26" height="4" fill="#0891b2" stroke="#000" strokeWidth="1.2" />
                                            <circle cx="50" cy="62" r="3.8" fill="url(#gold)" stroke="#000" strokeWidth="1" />
                                            <line x1="50" y1="62" x2="51.5" y2="60.5" stroke="#be123c" strokeWidth="1" />
                                            <line x1="50" y1="62" x2="48.5" y2="63.5" stroke="#1d4ed8" strokeWidth="1" />

                                            {/* White polar bear arms */}
                                            <path d="M 35 46 Q 23 54 27 62" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 35 46 Q 23 54 27 62" fill="none" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
                                            <circle cx="27" cy="62" r="3.2" fill="#f8fafc" stroke="#000" strokeWidth="1" />

                                            <path d="M 65 46 Q 77 54 73 62" fill="none" stroke="#000" strokeWidth="9" strokeLinecap="round" />
                                            <path d="M 65 46 Q 77 54 73 62" fill="none" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
                                            <circle cx="73" cy="62" r="3.2" fill="#f8fafc" stroke="#000" strokeWidth="1" />

                                            {/* Teal boots */}
                                            <rect x="42" y="65" width="5.5" height="15" rx="2" fill="#0b7285" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="65" width="5.5" height="15" rx="2" fill="#0b7285" stroke="#000" strokeWidth="1.4" />
                                            <rect x="39.5" y="78" width="8" height="6.5" rx="2" fill="#0891b2" stroke="#000" strokeWidth="1.4" />
                                            <rect x="52.5" y="78" width="8" height="6.5" rx="2" fill="#0891b2" stroke="#000" strokeWidth="1.4" />
                                        </g>
                                    );
                            }
                        })()}
                    </g>

                    {/* ==========================================
                        4. EQUIPPED GEAR (HEAD / 头部)
                       ========================================== */}
                    {headKey && (
                        <g filter="url(#shadow)">
                            {(() => {
                                switch (headKey) {
                                    // 蜡笔小新：动感超人头盔泳帽 (带描边与漫画线条)
                                    case 'head_shinchan_actioncap':
                                        if (activeBase !== 'shinchan') return null;
                                        return (
                                            <g>
                                                <path d="M 31 22 Q 50 7 69 22 Q 50 25 31 22 Z" fill="#1890ff" stroke="#000" strokeWidth="1.6" />
                                                <path d="M 44 14 Q 50 2 56 14" stroke="#fadb14" strokeWidth="3.8" strokeLinecap="round" fill="none" />
                                                <circle cx="50" cy="18" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.2" />
                                            </g>
                                        );

                                    // 小黄人：香蕉立体浮雕泳帽
                                    case 'head_minion_bananacap':
                                        if (activeBase !== 'minion') return null;
                                        return (
                                            <g>
                                                <path d="M 33 22 A 16 16 0 0 1 67 22 Q 50 26 33 22 Z" fill="#ffe066" stroke="#000" strokeWidth="1.6" />
                                                <path d="M 45 14 Q 50 18 55 14 Q 50 22 45 14 Z" fill="#d9480f" stroke="#000" strokeWidth="1" />
                                            </g>
                                        );

                                    // 光头强：经典安全施工帽 (100%对照原著)
                                    case 'head_loggervick_hardcap':
                                    case 'default_head_loggervick':
                                        if (activeBase !== 'loggervick') return null;
                                        return (
                                            <g>
                                                <path d="M 33 19 C 33 7, 67 7, 67 19 Z" fill="url(#gold)" stroke="#000" strokeWidth="1.6" />
                                                <path d="M 28 18 C 28 18, 50 15, 72 18 L 70 21 C 70 21, 50 18, 30 21 Z" fill="#ff781e" stroke="#000" strokeWidth="1.4" />
                                                <rect x="47.5" y="9" width="5" height="5" fill="#52c41a" stroke="#000" strokeWidth="0.8" rx="0.5" />
                                                <circle cx="50" cy="11.5" r="1.5" fill="#fadb14" />
                                            </g>
                                        );

                                    // 猪猪侠：五灵锁聚能头盔帽 / 经典飞行头盔
                                    case 'head_ggbond_helmet':
                                    case 'default_head_ggbond':
                                        if (activeBase !== 'ggbond') return null;
                                        return (
                                            <g>
                                                <path d="M 28 28 C 28 14, 72 14, 72 28 Z" fill="#e11d48" stroke="#000" strokeWidth="1.8" />
                                                <path d="M 28 22 C 28 22, 50 13, 72 22 C 72 22, 50 18, 28 22 Z" fill="#be123c" stroke="#000" strokeWidth="1.6" />
                                                <circle cx="39" cy="13" r="5" fill="#fcd34d" stroke="#000" strokeWidth="1.5" />
                                                <circle cx="39" cy="13" r="3.2" fill="#fb923c" />
                                                <circle cx="61" cy="13" r="5" fill="#fcd34d" stroke="#000" strokeWidth="1.5" />
                                                <circle cx="61" cy="13" r="3.2" fill="#fb923c" />
                                            </g>
                                        );

                                    // 柯南：少年侦探团徽章泳帽
                                    case 'head_conan_badgecap':
                                        if (activeBase !== 'conan') return null;
                                        return (
                                            <g>
                                                <path d="M 31 20 Q 50 5 69 20 Q 50 24 31 20 Z" fill="#e8eaed" stroke="#000" strokeWidth="1.6" />
                                                <polygon points="50,8 46,15 54,15" fill="#f5222d" stroke="#000" strokeWidth="1" />
                                                <circle cx="50" cy="14" r="1.5" fill="#fadb14" stroke="#000" strokeWidth="0.8" />
                                            </g>
                                        );

                                    // 巴克队长：蓝色舰长防风保暖泳帽 / 经典舰长帽
                                    case 'head_octonauts_cap':
                                    case 'default_head_octonauts':
                                        if (activeBase !== 'octonauts') return null;
                                        return (
                                            <g>
                                                <path d="M 35 17 Q 50 5 65 17 Q 50 20 35 17 Z" fill="#3bc9db" stroke="#000" strokeWidth="1.6" />
                                                <path d="M 35 17 Q 50 14 65 17" stroke="#0b7285" strokeWidth="1.2" fill="none" />
                                                <circle cx="50" cy="11.5" r="4.2" fill="#ffffff" stroke="#000" strokeWidth="0.8" />
                                                <circle cx="50" cy="10.5" r="1.5" fill="#0b7285" />
                                                <path d="M 48.5 12.5 Q 50 11.5 51.5 12.5 M 49.2 13 Q 50 12 50.8 13" stroke="#0b7285" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                                            </g>
                                        );

                                    // Default heads for characters that don't have base hats
                                    case 'default_head_shinchan':
                                    case 'default_head_minion':
                                    case 'default_head_conan':
                                        return null;

                                    // 通用低价装备：基础防风硅胶泳帽 (100% snug fitting, no flying saucers)
                                    case 'head_universal_cap':
                                    default:
                                        return (() => {
                                            switch (activeBase) {
                                                case 'shinchan':
                                                    return (
                                                        <g>
                                                            {/* Snug silicone racing cap */}
                                                            <path d="M 31 22 Q 50 7 69 22 Q 50 25 31 22 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.6" />
                                                            {/* Specular high-gloss reflection highlight */}
                                                            <path d="M 34 18 Q 50 11 66 18" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                                                            {/* Seam line */}
                                                            <path d="M 50 8 Q 50 16 50 23" fill="none" stroke="#1098ad" strokeWidth="0.8" opacity="0.7" />
                                                            {/* Sporty wave logo */}
                                                            <path d="M 45 18 Q 50 15 55 18 M 47 20 Q 50 17 53 20" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                case 'minion':
                                                    return (
                                                        <g>
                                                            {/* Snug cap A-shape */}
                                                            <path d="M 33 22 A 16 16 0 0 1 67 22 Q 50 26 33 22 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.6" />
                                                            {/* Volumetric highlight */}
                                                            <path d="M 36 17 Q 50 11 64 17" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                                                            {/* Sporty wave logo */}
                                                            <path d="M 45 19 Q 50 16 55 19 M 47 21 Q 50 18 53 21" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                case 'loggervick':
                                                    return (
                                                        <g>
                                                            {/* Snug fitting dome cap for Logger Vick */}
                                                            <path d="M 33 19 C 33 7, 67 7, 67 19 Q 50 22 33 19 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.6" />
                                                            {/* Glossy highlight */}
                                                            <path d="M 36 13 C 36 9, 64 9, 64 13" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                                                            {/* Sporty wave logo */}
                                                            <path d="M 45 16 Q 50 13 55 16 M 47 18 Q 50 15 53 18" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                case 'ggbond':
                                                    return (
                                                        <g>
                                                            {/* Snug dome cap for GG Bond */}
                                                            <path d="M 28 28 C 28 14, 72 14, 72 28 Q 50 31 28 28 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.8" />
                                                            {/* Glossy highlight */}
                                                            <path d="M 32 21 C 32 17, 68 17, 68 21" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                                                            {/* Sporty wave logo */}
                                                            <path d="M 44 24 Q 50 21 56 24 M 46 26 Q 50 23 54 26" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                case 'conan':
                                                    return (
                                                        <g>
                                                            {/* Snug cap for Conan */}
                                                            <path d="M 31 20 Q 50 5 69 20 Q 50 24 31 20 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.6" />
                                                            {/* Highlight */}
                                                            <path d="M 34 15 Q 50 8 66 15" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                                                            {/* Wave logo */}
                                                            <path d="M 45 16 Q 50 13 55 16 M 47 18 Q 50 15 53 18" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                case 'octonauts':
                                                    return (
                                                        <g>
                                                            {/* Snug cap for Barnacles */}
                                                            <path d="M 35 17 Q 50 5 65 17 Q 50 20 35 17 Z" fill="url(#universalCapGrad)" stroke="#000" strokeWidth="1.6" />
                                                            {/* Highlight */}
                                                            <path d="M 38 12 Q 50 7 62 12" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                                                            {/* Wave logo */}
                                                            <path d="M 45 13 Q 50 10 55 13" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                                                        </g>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })();
                                }
                            })()}
                        </g>
                    )}

                    {/* ==========================================
                        5. EQUIPPED GEAR (EYES / 眼部)
                       ========================================== */}
                    {eyesKey && (
                        <g filter="url(#shadow)">
                            {/* Detailed silicone strap wrapping realistically around the head */}
                            <path d="M 26 28 C 26 28, 18 28, 20 30" stroke="#1f1f1f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M 74 28 C 74 28, 82 28, 80 30" stroke="#1f1f1f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            
                            {(() => {
                                switch (eyesKey) {
                                    // 蜡笔小新：动感激光防雾泳镜 (高科技炫彩遮罩)
                                    case 'eyes_shinchan_actiongoggles':
                                        if (activeBase !== 'shinchan') return null;
                                        return (
                                            <g>
                                                <rect x="33" y="24" width="34" height="9" rx="3.5" fill="#52c41a" stroke="#000" strokeWidth="1.8" />
                                                <rect x="35" y="26" width="30" height="5" rx="1.5" fill="#f5222d" className="anim-neon" filter="url(#neonGlow)" />
                                                {/* High tech grid lines */}
                                                <line x1="38" y1="26" x2="38" y2="31" stroke="#ff4d4f" strokeWidth="0.6" opacity="0.6" />
                                                <line x1="45" y1="26" x2="45" y2="31" stroke="#ff4d4f" strokeWidth="0.6" opacity="0.6" />
                                                <line x1="55" y1="26" x2="55" y2="31" stroke="#ff4d4f" strokeWidth="0.6" opacity="0.6" />
                                                <line x1="62" y1="26" x2="62" y2="31" stroke="#ff4d4f" strokeWidth="0.6" opacity="0.6" />
                                                {/* Glossy reflection glare */}
                                                <polygon points="35,26 42,26 38,31 35,31" fill="#fff" opacity="0.4" />
                                            </g>
                                        );

                                    // 小黄人：小黄人经典单眼潜水镜 (升级版金框)
                                    case 'eyes_minion_classicgoggles':
                                        if (activeBase !== 'minion') return null;
                                        return (
                                            <g>
                                                {isOneEyedMinion ? (
                                                    <g>
                                                        <circle cx="50" cy="29" r="13" fill="none" stroke="url(#gold)" strokeWidth="3.8" />
                                                        <circle cx="50" cy="29" r="11" fill="none" stroke="#000" strokeWidth="1" />
                                                        {/* Glossy glares */}
                                                        <path d="M 41 22 Q 50 17 59 22" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
                                                        <polygon points="43,26 53,20 48,34 38,34" fill="#fff" opacity="0.25" />
                                                    </g>
                                                ) : (
                                                    <g>
                                                        <circle cx="44" cy="29" r="9" fill="none" stroke="url(#gold)" strokeWidth="3.2" />
                                                        <circle cx="44" cy="29" r="7.5" fill="none" stroke="#000" strokeWidth="0.8" />
                                                        <circle cx="56" cy="29" r="9" fill="none" stroke="url(#gold)" strokeWidth="3.2" />
                                                        <circle cx="56" cy="29" r="7.5" fill="none" stroke="#000" strokeWidth="0.8" />
                                                        {/* Glossy glares */}
                                                        <polygon points="39,26 46,22 43,33 36,33" fill="#fff" opacity="0.25" />
                                                        <polygon points="51,26 58,22 55,33 48,33" fill="#fff" opacity="0.25" />
                                                    </g>
                                                )}
                                            </g>
                                        );

                                    // 猪猪侠：炽热火云流光防雾泳镜 (火焰翅膀框架)
                                    case 'eyes_ggbond_firegoggles':
                                        if (activeBase !== 'ggbond') return null;
                                        return (
                                            <g>
                                                {/* Left wing flame */}
                                                <path d="M 33 21 C 28 20, 22 25, 26 31 L 36 31 Z" fill="url(#fireGrad)" stroke="#000" strokeWidth="1.4" />
                                                {/* Right wing flame */}
                                                <path d="M 67 21 C 72 20, 78 25, 74 31 L 64 31 Z" fill="url(#fireGrad)" stroke="#000" strokeWidth="1.4" />
                                                {/* Lens body */}
                                                <path d="M 33 21 L 48 23 H 52 L 67 21 L 64 31 H 36 Z" fill="#78350f" stroke="#000" strokeWidth="1.8" />
                                                <path d="M 35 22.5 L 47 24 H 53 L 65 22.5 L 62 29.5 H 38 Z" fill="url(#fireGrad)" opacity="0.9" />
                                                {/* Specular Glare */}
                                                <line x1="33" y1="21" x2="67" y2="21" stroke="#fff" strokeWidth="2.0" opacity="0.85" strokeLinecap="round" />
                                                <polygon points="36,23 45,23 40,29 36,29" fill="#fff" opacity="0.5" />
                                                <polygon points="55,23 64,23 59,29 55,29" fill="#fff" opacity="0.5" />
                                            </g>
                                        );

                                    // 柯南：追踪型夜视目镜泳镜 (战术网格与十字瞄准准心)
                                    case 'eyes_conan_scopegoggles':
                                        if (activeBase !== 'conan') return null;
                                        return (
                                            <g>
                                                {/* Tactical frames */}
                                                <rect x="31" y="20" width="16" height="12" rx="3.2" fill="none" stroke="#52c41a" strokeWidth="3.2" />
                                                <rect x="53" y="20" width="16" height="12" rx="3.2" fill="none" stroke="#52c41a" strokeWidth="3.2" />
                                                <line x1="47" y1="26" x2="53" y2="26" stroke="#52c41a" strokeWidth="3.2" />
                                                
                                                {/* Glowing HUD Target crosshair inside right lens */}
                                                <circle cx="61" cy="26" r="4.5" fill="none" stroke="#ff4d4f" strokeWidth="1.2" className="anim-neon" />
                                                <line x1="55" y1="26" x2="67" y2="26" stroke="#ff4d4f" strokeWidth="0.8" />
                                                <line x1="61" y1="20" x2="61" y2="32" stroke="#ff4d4f" strokeWidth="0.8" />
                                                
                                                {/* Specular glare */}
                                                <polygon points="32,21 38,21 34,31 32,31" fill="#fff" opacity="0.4" />
                                                <polygon points="54,21 60,21 56,31 54,31" fill="#fff" opacity="0.4" />
                                            </g>
                                        );

                                    // 巴克队长：章鱼堡全景高清防水镜 (全景面罩与水滴高光)
                                    case 'eyes_octonauts_goggles':
                                        if (activeBase !== 'octonauts') return null;
                                        return (
                                            <g>
                                                <rect x="33" y="18" width="34" height="12" rx="4" fill="rgba(34, 184, 207, 0.4)" stroke="#096dd9" strokeWidth="2.8" />
                                                {/* Thick seal border */}
                                                <rect x="34.5" y="19.5" width="31" height="9" rx="2.5" fill="none" stroke="#3bc9db" strokeWidth="1" />
                                                {/* Glossy reflection waves */}
                                                <path d="M 35 20 Q 50 16 65 20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                                                <polygon points="35,21 44,21 39,28 35,28" fill="#fff" opacity="0.45" />
                                                {/* Micro water droplets bubbles */}
                                                <circle cx="37" cy="26" r="0.8" fill="#fff" opacity="0.7" />
                                                <circle cx="63" cy="22" r="0.6" fill="#fff" opacity="0.7" />
                                            </g>
                                        );

                                    // 通用低价装备：标准防滑反光黑框泳镜
                                    case 'eyes_universal_goggles':
                                    default:
                                        return (
                                            <g>
                                                <g stroke="#1f1f1f" strokeWidth="2.2" fill="rgba(30, 41, 59, 0.65)" strokeLinejoin="round">
                                                    <rect x="34" y="23" width="13" height="9" rx="2.5" />
                                                    <rect x="53" y="23" width="13" height="9" rx="2.5" />
                                                    <line x1="47" y1="27" x2="53" y2="27" strokeWidth="3" />
                                                </g>
                                                {/* Anti-fog glass reflections */}
                                                <polygon points="35,24 41,24 37,31 35,31" fill="#fff" opacity="0.5" />
                                                <polygon points="54,24 60,24 56,31 54,31" fill="#fff" opacity="0.5" />
                                            </g>
                                        );
                                }
                            })()}
                        </g>
                    )}

                    {/* ==========================================
                        6. EQUIPPED GEAR (BODY / 衣服)
                       ========================================== */}
                    {bodyKey && (
                        <g>
                            {(() => {
                                switch (bodyKey) {
                                    // 蜡笔小新：动感超人流线型泳衣 (三色立体线条与皮带)
                                    case 'body_shinchan_actionsuit':
                                        if (activeBase !== 'shinchan') return null;
                                        return (
                                            <g>
                                                <path d="M 36 50 C 36 50, 50 52, 64 50 L 62 67 C 50 69, 50 69, 38 67 Z" fill="#52c41a" stroke="#000" strokeWidth="1.8" />
                                                {/* White center strip */}
                                                <path d="M 45 50 L 50 67 L 55 50 Z" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
                                                {/* Red triangle crest */}
                                                <polygon points="50,53 47,58 53,58" fill="#f5222d" stroke="#000" strokeWidth="0.8" />
                                                {/* Suit fabric folds */}
                                                <path d="M 39 55 Q 42 59 45 56" fill="none" stroke="#389e0d" strokeWidth="1.2" />
                                                <path d="M 61 55 Q 58 59 55 56" fill="none" stroke="#389e0d" strokeWidth="1.2" />
                                            </g>
                                        );

                                    // 小黄人：背带裙式竞速防阻水泳装
                                    case 'body_minion_overallsuit':
                                        if (activeBase !== 'minion') return null;
                                        return (
                                            <g>
                                                <path d="M 34 52 Q 50 55 66 52 L 66 71 A 16 16 0 0 1 34 71 Z" fill="#2d59ca" stroke="#000" strokeWidth="1.8" />
                                                {/* Yellow highlights/stitches */}
                                                <path d="M 38 52 V 71 M 62 52 V 71" stroke="#fcd34d" strokeWidth="2.5" strokeDasharray="1.5,1.5" />
                                                <path d="M 34 58 H 66" stroke="#1d3d94" strokeWidth="1.5" />
                                            </g>
                                        );

                                    // 猪猪侠：红色披风紧身竞技泳衣 (黄金护胸)
                                    case 'body_ggbond_capesuit':
                                        if (activeBase !== 'ggbond') return null;
                                        return (
                                            <g>
                                                <path d="M 33 46 C 33 46, 50 48, 67 46 L 63 68 C 50 71.5, 50 71.5, 37 68 Z" fill="#e11d48" stroke="#000" strokeWidth="1.8" />
                                                {/* Gold-plated breastplate */}
                                                <path d="M 41 46 L 50 63 L 59 46 Z" fill="url(#gold)" stroke="#d97706" strokeWidth="1.4" />
                                                <polygon points="50,48 48,53 52,53" fill="#be123c" />
                                                {/* Flowing cape shadow */}
                                                <path d="M 33 48 C 28 50, 26 62, 30 68" fill="none" stroke="#be123c" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                                                <path d="M 67 48 C 72 50, 74 62, 70 68" fill="none" stroke="#be123c" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                                            </g>
                                        );

                                    default:
                                        return null;
                                }
                            })()}
                        </g>
                    )}

                    {/* ==========================================
                        7. EQUIPPED GEAR (FEET / 脚部)
                       ========================================== */}
                    {feetKey && (
                        <g filter="url(#shadow)">
                            {(() => {
                                switch (feetKey) {
                                    // 光头强：专业深海重型潜水脚蹼 (带筋条与水流槽)
                                    case 'feet_loggervick_rubberfeet':
                                        if (activeBase !== 'loggervick') return null;
                                        return (
                                            <g fill="#7c2d12" stroke="#000" strokeWidth="1.6" strokeLinejoin="round">
                                                {/* Left Fin */}
                                                <path d="M 40 76 L 18 95 L 43 91 Z" />
                                                {/* Foot pocket & side ribs */}
                                                <path d="M 40 76 L 33 84 L 42 83 Z" fill="#451a03" />
                                                <line x1="18" y1="95" x2="33" y2="84" stroke="#000" strokeWidth="2.5" />
                                                <line x1="28" y1="93" x2="37" y2="83" stroke="#d97706" strokeWidth="1.2" />

                                                {/* Right Fin */}
                                                <path d="M 60 76 L 82 95 L 57 91 Z" />
                                                {/* Foot pocket & side ribs */}
                                                <path d="M 60 76 L 67 84 L 58 83 Z" fill="#451a03" />
                                                <line x1="82" y1="95" x2="67" y2="84" stroke="#000" strokeWidth="2.5" />
                                                <line x1="72" y1="93" x2="63" y2="83" stroke="#d97706" strokeWidth="1.2" />
                                            </g>
                                        );

                                    // 猪猪侠：火云铁翼超能强力脚蹼 (羽翼刀刃)
                                    case 'feet_ggbond_firefeet':
                                        if (activeBase !== 'ggbond') return null;
                                        return (
                                            <g fill="url(#fireGrad)" stroke="#000" strokeWidth="1.6" strokeLinejoin="round">
                                                {/* Left wing blade */}
                                                <path d="M 40 76 L 16 96 L 30 92 L 43 90 Z" />
                                                <polygon points="16,96 22,86 26,90" fill="#fadb14" stroke="#000" strokeWidth="1" />
                                                {/* Foot pocket */}
                                                <path d="M 40 76 L 34 84 L 42 83 Z" fill="#9f1239" />

                                                {/* Right wing blade */}
                                                <path d="M 60 76 L 84 96 L 70 92 L 57 90 Z" />
                                                <polygon points="84,96 78,86 74,90" fill="#fadb14" stroke="#000" strokeWidth="1" />
                                                {/* Foot pocket */}
                                                <path d="M 60 76 L 66 84 L 58 83 Z" fill="#9f1239" />
                                            </g>
                                        );

                                    // 柯南：涡轮喷射水下助推器 (金属外壳与尾焰喷口)
                                    case 'feet_conan_turbofeet':
                                        if (activeBase !== 'conan') return null;
                                        return (
                                            <g>
                                                {/* Left Boot */}
                                                <rect x="34" y="74" width="11" height="17" rx="3.5" fill="#e2e8f0" stroke="#000" strokeWidth="1.8" />
                                                <circle cx="39.5" cy="88" r="2.5" fill="#22b8cf" className="anim-neon" filter="url(#neonGlow)" />
                                                <line x1="34" y1="79" x2="45" y2="79" stroke="#94a3b8" strokeWidth="1.2" />
                                                {/* Bolt rivets */}
                                                <circle cx="36" cy="76" r="0.5" fill="#444" />
                                                <circle cx="43" cy="76" r="0.5" fill="#444" />

                                                {/* Right Boot */}
                                                <rect x="55" y="74" width="11" height="17" rx="3.5" fill="#e2e8f0" stroke="#000" strokeWidth="1.8" />
                                                <circle cx="60.5" cy="88" r="2.5" fill="#22b8cf" className="anim-neon" filter="url(#neonGlow)" />
                                                <line x1="55" y1="79" x2="66" y2="79" stroke="#94a3b8" strokeWidth="1.2" />
                                                {/* Bolt rivets */}
                                                <circle cx="57" cy="76" r="0.5" fill="#444" />
                                                <circle cx="64" cy="76" r="0.5" fill="#444" />
                                            </g>
                                        );

                                    // 巴克队长：极地防寒速干加厚脚蹼 (熊爪刺绣徽章)
                                    case 'feet_octonauts_feet':
                                        if (activeBase !== 'octonauts') return null;
                                        return (
                                            <g fill="#0b7285" stroke="#000" strokeWidth="1.6" strokeLinejoin="round">
                                                {/* Left polar fin */}
                                                <path d="M 40 75 L 20 92 L 43 89 Z" />
                                                <path d="M 40 75 L 34 83 L 42 82 Z" fill="#0891b2" />
                                                {/* Bear paw print logo */}
                                                <circle cx="30" cy="86" r="1.5" fill="#fff" stroke="none" />
                                                <circle cx="28" cy="83" r="0.6" fill="#fff" stroke="none" />
                                                <circle cx="30" cy="82" r="0.6" fill="#fff" stroke="none" />
                                                <circle cx="32" cy="83" r="0.6" fill="#fff" stroke="none" />

                                                {/* Right polar fin */}
                                                <path d="M 60 75 L 80 92 L 57 89 Z" />
                                                <path d="M 60 75 L 66 83 L 58 82 Z" fill="#0891b2" />
                                                {/* Bear paw print logo */}
                                                <circle cx="70" cy="86" r="1.5" fill="#fff" stroke="none" />
                                                <circle cx="68" cy="83" r="0.6" fill="#fff" stroke="none" />
                                                <circle cx="70" cy="82" r="0.6" fill="#fff" stroke="none" />
                                                <circle cx="72" cy="83" r="0.6" fill="#fff" stroke="none" />
                                            </g>
                                        );

                                    // 通用低价装备：防滑高弹运动泳拖 (防滑纹路细节)
                                    case 'feet_universal_slippers':
                                    default:
                                        return (
                                            <g stroke="#000" strokeWidth="1.5">
                                                {/* Left Slipper */}
                                                <rect x="31" y="77" width="13" height="5.5" fill="#343a40" rx="1.8" />
                                                <path d="M 33 77 Q 37.5 74 42 77" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                                                
                                                {/* Right Slipper */}
                                                <rect x="56" y="77" width="13" height="5.5" fill="#343a40" rx="1.8" />
                                                <path d="M 58 77 Q 62.5 74 67 77" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                                            </g>
                                        );
                                }
                            })()}
                        </g>
                    )}

                    {/* ==========================================
                        8. EQUIPPED GEAR (HAND / 手持)
                       ========================================== */}
                    {handKey && (
                        <g className="anim-prop" filter="url(#shadow)">
                            {(() => {
                                switch (handKey) {
                                    // 蜡笔小新：小熊饼干经典浮板 (手绘粉色恐龙)
                                    case 'hand_shinchan_chocobi':
                                        if (activeBase !== 'shinchan') return null;
                                        return (
                                            <g>
                                                {/* Hexagonal cookie box */}
                                                <polygon points="68,44 76,39 84,44 84,63 76,68 68,63" fill="#52c41a" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
                                                {/* Top and side panel outlines */}
                                                <line x1="76" y1="39" x2="76" y2="68" stroke="#237804" strokeWidth="1.4" />
                                                
                                                {/* Cute pink dinosaur logo (Wani-yama-san) */}
                                                <path d="M 72 56 C 72 50, 80 50, 80 56 C 80 61, 72 61, 72 56 Z" fill="#ff85c0" stroke="#000" strokeWidth="0.8" />
                                                <polygon points="76,51 77,53 79,53 77,54 78,57 76,55 74,57 75,54 73,53 75,53" fill="#fadb14" stroke="#000" strokeWidth="0.6" />
                                                <circle cx="75" cy="54" r="0.5" fill="#000" />
                                                <circle cx="77" cy="54" r="0.5" fill="#000" />
                                            </g>
                                        );

                                    // 小黄人：香蕉造型游泳充气救生圈 (带风嘴气门)
                                    case 'hand_minion_bananaring':
                                        if (activeBase !== 'minion') return null;
                                        return (
                                            <g>
                                                {/* Volumetric Inflatable Ring */}
                                                <path d="M 64 56 Q 74 38 84 56 Q 74 74 64 56" fill="none" stroke="#f59f00" strokeWidth="15" strokeLinecap="round" />
                                                <path d="M 64 56 Q 74 38 84 56 Q 74 74 64 56" fill="none" stroke="#ffe066" strokeWidth="10" strokeLinecap="round" />
                                                {/* Glossy inflatable reflections */}
                                                <path d="M 66 53 Q 74 41 82 53" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
                                                {/* Banana ends */}
                                                <circle cx="64" cy="56" r="2.5" fill="#5c3a21" stroke="#000" strokeWidth="0.8" />
                                                <circle cx="84" cy="56" r="2.5" fill="#5c3a21" stroke="#000" strokeWidth="0.8" />
                                                {/* Mini inflation valve */}
                                                <rect x="76" y="66" width="2" height="3.5" rx="0.5" fill="#ffffff" stroke="#000" strokeWidth="0.8" transform="rotate(15 76 66)" />
                                            </g>
                                        );

                                    // 光头强：大功率电锯阻力训练桨 (带锯齿链条与风栅)
                                    case 'hand_loggervick_chainsaw':
                                        if (activeBase !== 'loggervick') return null;
                                        return (
                                            <g stroke="#000" strokeWidth="1.6" strokeLinejoin="round">
                                                {/* Chainsaw guide bar */}
                                                <rect x="68" y="42" width="10" height="23" rx="3.5" fill="#ced4da" />
                                                {/* Metal highlights */}
                                                <line x1="73" y1="42" x2="73" y2="65" stroke="#ffffff" strokeWidth="1.2" />
                                                {/* Jagged sharp silver chain teeth */}
                                                <path d="M 78 42 L 81 44 L 78 46 L 81 48 L 78 50 L 81 52 L 78 54 L 81 56 L 78 58 L 81 60 L 78 62" fill="none" strokeWidth="1.8" />
                                                {/* Orange engine body */}
                                                <rect x="63" y="55" width="12" height="11" rx="2" fill="#ff781e" />
                                                {/* Ventilation engine grille */}
                                                <line x1="65" y1="58" x2="71" y2="58" stroke="#000" strokeWidth="1" />
                                                <line x1="65" y1="61" x2="71" y2="61" stroke="#000" strokeWidth="1" />
                                                <line x1="65" y1="64" x2="71" y2="64" stroke="#000" strokeWidth="1" />
                                            </g>
                                        );

                                    // 柯南：麻醉枪战术雷达定位手表 (金属表盘与发射灯)
                                    case 'hand_conan_watch':
                                        if (activeBase !== 'conan') return null;
                                        return (
                                            <g>
                                                {/* Strap */}
                                                <rect x="25" y="55" width="7.5" height="5" fill="#495057" stroke="#000" strokeWidth="1.2" rx="1" />
                                                {/* Bezel */}
                                                <circle cx="28.5" cy="57.5" r="4.2" fill="#adb5bd" stroke="#000" strokeWidth="1.6" />
                                                {/* Radar screen glass */}
                                                <circle cx="28.5" cy="57.5" r="2.8" fill="rgba(82, 196, 26, 0.4)" stroke="#52c41a" strokeWidth="0.8" />
                                                {/* Target indicator */}
                                                <circle cx="28.5" cy="57.5" r="0.8" fill="#f5222d" className="anim-neon" />
                                                {/* Radar grid sweep line */}
                                                <line x1="28.5" y1="57.5" x2="30.5" y2="55.5" stroke="#52c41a" strokeWidth="0.6" />
                                            </g>
                                        );

                                    // 巴克队长：GUP-A艇内嵌旋涡式双向螺旋桨 (螺旋桨叶与气泡)
                                    case 'hand_octonauts_propeller':
                                        if (activeBase !== 'octonauts') return null;
                                        return (
                                            <g>
                                                {/* Streamlined main shroud body */}
                                                <rect x="66" y="47" width="11" height="15" rx="3.5" fill="#3bc9db" stroke="#000" strokeWidth="1.8" />
                                                <line x1="71.5" y1="47" x2="71.5" y2="62" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
                                                
                                                {/* Three spinning prop blades */}
                                                <path d="M 71.5 47 Q 65 37 71.5 47 Q 78 37 71.5 47 M 71.5 62 Q 65 72 71.5 62 Q 78 72 71.5 62" stroke="#0b7285" strokeWidth="3" strokeLinecap="round" fill="none" />
                                                
                                                {/* Swirling jet air bubbles */}
                                                <circle cx="78" cy="40" r="0.8" fill="#fff" opacity="0.7" />
                                                <circle cx="65" cy="68" r="0.6" fill="#fff" opacity="0.7" />
                                            </g>
                                        );

                                    // 通用低价装备：标准双扣手执防潮发泡浮板 (双握手把口)
                                    case 'hand_universal_kickboard':
                                    default:
                                        return (
                                            <g>
                                                <rect x="64" y="44" width="18" height="26" rx="8" fill="#3bc9db" stroke="#000" strokeWidth="1.6" />
                                                <rect x="67" y="47" width="12" height="20" rx="6" fill="none" stroke="white" strokeWidth="1.8" opacity="0.6" />
                                            </g>
                                        );
                                }
                            })()}
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}
