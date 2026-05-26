"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarRendererProps {
    gender: string;
    equippedItems?: Record<string, { imageKey?: string; slotType?: string } | string | null | undefined>;
    className?: string;
    size?: number;
    animated?: boolean;
}

// Known legacy character prefixes from the old avatar system
const LEGACY_CHARACTERS = ["shinchan", "minion", "conan", "loggervick", "ggbond", "octonauts"];

// Mapping from old slot names → new slot names
const LEGACY_SLOT_MAP: Record<string, string> = {
    head: "hair",
    body: "top",
    lower: "bottom",
    eyes: "expression",
    face: "expression",
    feet: "shoes",
    hand: "handheld",
};

const getKey = (equippedItems: any, slot: string) => {
    if (!equippedItems) return "";

    // 1. New format: bare slot key (e.g. equippedItems['hair'])
    const newItem = equippedItems[slot];
    if (newItem) return typeof newItem === "string" ? newItem : newItem.imageKey || "";

    // 2. Legacy format: character-prefixed key (e.g. equippedItems['shinchan_head'])
    for (const char of LEGACY_CHARACTERS) {
        // Try direct legacy slot name
        for (const [oldSlot, newSlot] of Object.entries(LEGACY_SLOT_MAP)) {
            if (newSlot === slot) {
                const legacyVal = equippedItems[`${char}_${oldSlot}`];
                if (legacyVal) return typeof legacyVal === "string" ? legacyVal : "";
            }
        }
        // Also try if the new slot name was already used with a prefix
        const legacyVal = equippedItems[`${char}_${slot}`];
        if (legacyVal) return typeof legacyVal === "string" ? legacyVal : "";
    }

    return "";
};

export function AvatarRenderer({
    gender = "male",
    equippedItems = {},
    className = "",
    size = 320,
    animated = true
}: AvatarRendererProps) {
    const skinToneRaw = getKey(equippedItems, "skinTone");
    const skinToneMap: Record<string, string> = {
        skin_fair: "#fdd1a2", skin_light: "#f5d0a9", skin_medium: "#e0b896",
        skin_tan: "#c69c6d", skin_dark: "#8d5524", skin_deep: "#5c3a21",
    };
    const skinColor = skinToneMap[skinToneRaw] || skinToneRaw || "#fdd1a2";
    const expressionKey = getKey(equippedItems, "expression") || "neutral";
    const hairKey = getKey(equippedItems, "hair");
    const hatKey = getKey(equippedItems, "hat");
    const topKey = getKey(equippedItems, "top");
    const bottomKey = getKey(equippedItems, "bottom");
    const shoesKey = getKey(equippedItems, "shoes");
    const handheldKey = getKey(equippedItems, "handheld");
    const accessoryKey = getKey(equippedItems, "accessory");
    const bgKey = getKey(equippedItems, "background");
    const specialKey = getKey(equippedItems, "specialSkin");
    const bodyType = gender === "female" ? "female" : "male";

    return (
        <div
            className={cn("relative overflow-hidden rounded-3xl flex items-center justify-center bg-[#1a1a2e] border border-white/5", className)}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes breathe {
                    0%, 100% { transform: scaleY(1) translateY(0); }
                    50% { transform: scaleY(1.01) translateY(-0.5px); }
                }
                @keyframes blink {
                    0%, 90%, 96%, 100% { transform: scaleY(1); }
                    93% { transform: scaleY(0.05); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                .anim-breathe { animation: breathe 3.5s ease-in-out infinite; transform-origin: center 85%; }
                .anim-blink { animation: blink 4s ease-in-out infinite; transform-origin: center center; }
                .anim-float { animation: float 2.5s ease-in-out infinite; }
            `}} />

            <div className="absolute inset-0 z-0">
                {renderBackground(bgKey)}
            </div>

            <svg
                viewBox="0 0 100 100"
                className={cn("w-[90%] h-[90%] z-10 select-none", animated && "anim-breathe")}
                style={{ overflow: "visible" }}
            >
                <defs>
                    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                </defs>

                {specialKey && renderSpecialSkin(specialKey, skinColor)}

                {!specialKey && (
                    <g filter="url(#softShadow)">
                        {bodyType === "male"
                            ? renderMaleBody(skinColor, topKey, bottomKey, hairKey, expressionKey)
                            : renderFemaleBody(skinColor, topKey, bottomKey, hairKey, expressionKey)}
                    </g>
                )}

                {topKey && renderTop(topKey, bodyType)}
                {bottomKey && renderBottom(bottomKey)}
                {shoesKey && renderShoes(shoesKey)}
                {hairKey && renderHair(hairKey)}
                {hatKey && renderHat(hatKey)}
                {accessoryKey && renderAccessory(accessoryKey)}
                {handheldKey && renderHandheld(handheldKey)}
            </svg>
        </div>
    );
}

/* ============================================================
   QUIZIZZ-STYLE MALE BODY — clean fills, no strokes
   Proportions: big round head, small rounded body, short limbs
   ============================================================ */
function renderMaleBody(skinColor: string, topKey: string, bottomKey: string, hairKey: string, expressionKey: string) {
    return (
        <g>
            {/* Left leg */}
            <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
            {/* Right leg */}
            <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />

            {/* Default shorts when no bottom equipped */}
            {!bottomKey && (
                <rect x="35" y="60" width="30" height="14" rx="5" fill="#3b82f6" />
            )}

            {/* Default torso when no top equipped */}
            {!topKey && (
                <g>
                    {/* Torso */}
                    <rect x="33" y="40" width="34" height="26" rx="6" fill="#3b82f6" />
                    {/* Neckline */}
                    <ellipse cx="50" cy="42" rx="7" ry="3" fill={skinColor} />
                </g>
            )}

            {/* Left arm */}
            <rect x="22" y="42" width="13" height="20" rx="6.5" fill={skinColor} />
            {/* Right arm */}
            <rect x="65" y="42" width="13" height="20" rx="6.5" fill={skinColor} />

            {/* Neck */}
            <rect x="46" y="35" width="8" height="8" rx="3" fill={skinColor} />

            {/* Head — big round circle */}
            <circle cx="50" cy="22" r="15" fill={skinColor} />

            {/* Default hair when none equipped */}
            {!hairKey && <path d="M 35 18 Q 50 5 65 18 Q 63 12 50 8 Q 37 12 35 18 Z" fill="#2d1b0e" />}

            {/* Face */}
            {renderFace(expressionKey)}
        </g>
    );
}

/* ============================================================
   QUIZIZZ-STYLE FEMALE BODY — slightly different silhouette
   ============================================================ */
function renderFemaleBody(skinColor: string, topKey: string, bottomKey: string, hairKey: string, expressionKey: string) {
    return (
        <g>
            {/* Left leg */}
            <rect x="38" y="63" width="9" height="22" rx="4.5" fill={skinColor} />
            {/* Right leg */}
            <rect x="53" y="63" width="9" height="22" rx="4.5" fill={skinColor} />

            {/* Default bottom — one-piece style */}
            {!bottomKey && (
                <rect x="36" y="60" width="28" height="12" rx="5" fill="#ec4899" />
            )}

            {/* Default torso */}
            {!topKey && (
                <g>
                    <rect x="34" y="40" width="32" height="26" rx="6" fill="#ec4899" />
                    <ellipse cx="50" cy="42" rx="6" ry="3" fill={skinColor} />
                </g>
            )}

            {/* Arms — slightly slimmer */}
            <rect x="23" y="42" width="12" height="19" rx="6" fill={skinColor} />
            <rect x="65" y="42" width="12" height="19" rx="6" fill={skinColor} />

            {/* Neck */}
            <rect x="46" y="35" width="8" height="8" rx="3" fill={skinColor} />

            {/* Head */}
            <circle cx="50" cy="22" r="15" fill={skinColor} />

            {/* Default hair — longer side pieces */}
            {!hairKey && (
                <g>
                    <path d="M 34 18 Q 50 4 66 18 Q 64 11 50 7 Q 36 11 34 18 Z" fill="#2d1b0e" />
                    {/* Side hair */}
                    <rect x="32" y="18" width="6" height="16" rx="3" fill="#2d1b0e" />
                    <rect x="62" y="18" width="6" height="16" rx="3" fill="#2d1b0e" />
                </g>
            )}

            {/* Face */}
            {renderFace(expressionKey)}
        </g>
    );
}

/* ============================================================
   QUIZIZZ-STYLE FACE — simple, cute, no strokes
   ============================================================ */
function renderFace(key: string) {
    switch (key) {
        case "happy":
            return (
                <g>
                    <g className="anim-blink">
                        {/* Left eye — happy closed curve */}
                        <path d="M 41 21 Q 44 17 47 21" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                        {/* Right eye — happy closed curve */}
                        <path d="M 53 21 Q 56 17 59 21" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </g>
                    {/* Big smile */}
                    <path d="M 42 27 Q 50 34 58 27" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                    {/* Cheeks */}
                    <circle cx="37" cy="26" r="3" fill="#fca5a5" opacity="0.5" />
                    <circle cx="63" cy="26" r="3" fill="#fca5a5" opacity="0.5" />
                </g>
            );
        case "determined":
            return (
                <g>
                    <g className="anim-blink">
                        <circle cx="44" cy="21" r="2.5" fill="#1a1a2e" />
                        <circle cx="56" cy="21" r="2.5" fill="#1a1a2e" />
                        <circle cx="43" cy="20" r="0.8" fill="#fff" />
                        <circle cx="55" cy="20" r="0.8" fill="#fff" />
                    </g>
                    {/* Determined eyebrows */}
                    <path d="M 39 17 L 47 19" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 53 19 L 61 17" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Firm mouth */}
                    <path d="M 44 29 Q 50 31 56 29" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>
            );
        case "excited":
            return (
                <g>
                    <g className="anim-blink">
                        {/* Big round excited eyes */}
                        <circle cx="44" cy="21" r="3.5" fill="#1a1a2e" />
                        <circle cx="56" cy="21" r="3.5" fill="#1a1a2e" />
                        <circle cx="42.5" cy="19.5" r="1.2" fill="#fff" />
                        <circle cx="54.5" cy="19.5" r="1.2" fill="#fff" />
                    </g>
                    {/* Open smile */}
                    <path d="M 43 27 Q 50 35 57 27 Z" fill="#1a1a2e" />
                    <path d="M 44 27.5 Q 50 32 56 27.5 Z" fill="#f87171" />
                    {/* Cheeks */}
                    <circle cx="37" cy="25" r="3.5" fill="#fca5a5" opacity="0.5" />
                    <circle cx="63" cy="25" r="3.5" fill="#fca5a5" opacity="0.5" />
                </g>
            );
        case "proud":
            return (
                <g>
                    <g className="anim-blink">
                        {/* Half-closed proud eyes */}
                        <ellipse cx="44" cy="22" rx="2.5" ry="2" fill="#1a1a2e" />
                        <ellipse cx="56" cy="22" rx="2.5" ry="2" fill="#1a1a2e" />
                    </g>
                    {/* Confident smirk */}
                    <path d="M 45 28 Q 50 30 55 28" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    {/* Raised eyebrow */}
                    <path d="M 39 18 Q 44 16 48 18" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M 52 18 Q 56 16 61 18" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
            );
        case "focused":
            return (
                <g>
                    <g className="anim-blink">
                        {/* Focused straight eyes */}
                        <circle cx="44" cy="21" r="3" fill="#1a1a2e" />
                        <circle cx="56" cy="21" r="3" fill="#1a1a2e" />
                        <circle cx="43" cy="20" r="1" fill="#fff" />
                        <circle cx="55" cy="20" r="1" fill="#fff" />
                    </g>
                    {/* Straight eyebrows */}
                    <line x1="39" y1="17" x2="48" y2="17" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="52" y1="17" x2="61" y2="17" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
                    {/* Neutral mouth */}
                    <line x1="46" y1="29" x2="54" y2="29" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
        case "neutral":
        default:
            return (
                <g>
                    <g className="anim-blink">
                        {/* Simple dot eyes */}
                        <circle cx="44" cy="21" r="2.8" fill="#1a1a2e" />
                        <circle cx="56" cy="21" r="2.8" fill="#1a1a2e" />
                        {/* Eye highlights */}
                        <circle cx="42.8" cy="19.8" r="0.9" fill="#fff" />
                        <circle cx="54.8" cy="19.8" r="0.9" fill="#fff" />
                    </g>
                    {/* Gentle smile */}
                    <path d="M 44 28 Q 50 32 56 28" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    {/* Subtle cheeks */}
                    <circle cx="38" cy="26" r="2.5" fill="#fca5a5" opacity="0.35" />
                    <circle cx="62" cy="26" r="2.5" fill="#fca5a5" opacity="0.35" />
                </g>
            );
    }
}

/* ============================================================
   QUIZIZZ-STYLE HAIR — solid fills, clean shapes, no strokes
   ============================================================ */
function renderHair(key: string) {
    const colors: Record<string, string> = {
        hair_short: "#2d1b0e", hair_spiky: "#2d1b0e", hair_long: "#2d1b0e",
        hair_ponytail: "#2d1b0e", hair_bun: "#2d1b0e", hair_curly: "#2d1b0e",
        hair_bob: "#2d1b0e", hair_sidepart: "#2d1b0e", hair_buzzcut: "#2d1b0e",
        hair_mohawk: "#2d1b0e",
    };
    const color = colors[key] || "#2d1b0e";

    switch (key) {
        case "hair_short":
            return <path d="M 34 18 Q 35 7 50 5 Q 65 7 66 18 Q 62 12 50 10 Q 38 12 34 18 Z" fill={color} />;
        case "hair_spiky":
            return (
                <g>
                    <path d="M 38 8 L 40 0 L 44 8 L 50 -2 L 56 8 L 60 0 L 62 8" fill={color} />
                    <path d="M 34 18 Q 36 10 50 8 Q 64 10 66 18 Q 62 12 50 10 Q 38 12 34 18 Z" fill={color} />
                </g>
            );
        case "hair_long":
            return (
                <g>
                    <path d="M 33 18 Q 34 6 50 4 Q 66 6 67 18 Q 63 10 50 8 Q 37 10 33 18 Z" fill={color} />
                    <rect x="31" y="18" width="6" height="24" rx="3" fill={color} />
                    <rect x="63" y="18" width="6" height="24" rx="3" fill={color} />
                </g>
            );
        case "hair_ponytail":
            return (
                <g>
                    <path d="M 34 18 Q 35 7 50 5 Q 65 7 66 18 Q 62 12 50 10 Q 38 12 34 18 Z" fill={color} />
                    <rect x="60" y="14" width="6" height="22" rx="3" fill={color} />
                    <circle cx="63" cy="14" r="2.5" fill="#fbbf24" />
                </g>
            );
        case "hair_bun":
            return (
                <g>
                    <path d="M 34 18 Q 35 7 50 5 Q 65 7 66 18 Q 62 12 50 10 Q 38 12 34 18 Z" fill={color} />
                    <circle cx="50" cy="4" r="7" fill={color} />
                </g>
            );
        case "hair_curly":
            return (
                <g>
                    <circle cx="36" cy="10" r="5" fill={color} />
                    <circle cx="44" cy="7" r="5" fill={color} />
                    <circle cx="56" cy="7" r="5" fill={color} />
                    <circle cx="64" cy="10" r="5" fill={color} />
                    <rect x="31" y="15" width="6" height="10" rx="3" fill={color} />
                    <rect x="63" y="15" width="6" height="10" rx="3" fill={color} />
                </g>
            );
        case "hair_bob":
            return (
                <g>
                    <path d="M 33 18 Q 33 7 50 5 Q 67 7 67 18 Q 65 25 60 28 Q 50 30 40 28 Q 35 25 33 18 Z" fill={color} />
                </g>
            );
        case "hair_sidepart":
            return (
                <g>
                    <path d="M 34 18 Q 35 6 42 4 Q 44 3 46 5 Q 44 10 42 14 L 66 18 Q 62 12 50 10 Q 38 12 34 18 Z" fill={color} />
                </g>
            );
        case "hair_buzzcut":
            return <path d="M 36 16 Q 37 9 50 7 Q 63 9 64 16 Q 60 12 50 10 Q 40 12 36 16 Z" fill={color} />;
        case "hair_mohawk":
            return (
                <g>
                    <path d="M 44 8 L 42 0 L 50 -4 L 58 0 L 56 8" fill={color} />
                    <rect x="46" y="4" width="8" height="6" rx="2" fill={color} />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE HATS — solid fills, no strokes
   ============================================================ */
function renderHat(key: string) {
    switch (key) {
        case "hat_siliconecap_blue":
            return (
                <g>
                    <path d="M 33 18 Q 33 8 50 5 Q 67 8 67 18 Z" fill="#3b82f6" />
                    <ellipse cx="50" cy="18" rx="18" ry="3" fill="#2563eb" />
                </g>
            );
        case "hat_siliconecap_black":
            return (
                <g>
                    <path d="M 33 18 Q 33 8 50 5 Q 67 8 67 18 Z" fill="#374151" />
                    <ellipse cx="50" cy="18" rx="18" ry="3" fill="#1f2937" />
                </g>
            );
        case "hat_goggles_forehead":
            return (
                <g>
                    <rect x="36" y="15" width="13" height="8" rx="4" fill="#60a5fa" />
                    <rect x="51" y="15" width="13" height="8" rx="4" fill="#60a5fa" />
                    <rect x="37" y="16" width="11" height="6" rx="3" fill="#1e3a8a" opacity="0.4" />
                    <rect x="52" y="16" width="11" height="6" rx="3" fill="#1e3a8a" opacity="0.4" />
                    <rect x="48" y="17" width="4" height="3" rx="1" fill="#374151" />
                </g>
            );
        case "hat_sunvisor":
            return (
                <g>
                    <path d="M 34 16 Q 50 8 66 16 Q 50 12 34 16 Z" fill="#f59e0b" />
                    <rect x="28" y="16" width="44" height="4" rx="2" fill="#d97706" />
                </g>
            );
        case "hat_baseballcap":
            return (
                <g>
                    <path d="M 34 16 Q 34 5 50 3 Q 66 5 66 16 Z" fill="#ef4444" />
                    <rect x="26" y="15" width="48" height="4" rx="2" fill="#dc2626" />
                </g>
            );
        case "hat_beanie":
            return (
                <g>
                    <path d="M 33 16 Q 33 5 50 3 Q 67 5 67 16 Z" fill="#8b5cf6" />
                    <rect x="31" y="14" width="38" height="4" rx="2" fill="#7c3aed" />
                    <circle cx="50" cy="2" r="3.5" fill="#a78bfa" />
                </g>
            );
        case "hat_swimcap_pink":
            return (
                <g>
                    <path d="M 33 18 Q 33 8 50 5 Q 67 8 67 18 Z" fill="#ec4899" />
                    <ellipse cx="50" cy="18" rx="18" ry="3" fill="#db2777" />
                </g>
            );
        case "hat_swimcap_green":
            return (
                <g>
                    <path d="M 33 18 Q 33 8 50 5 Q 67 8 67 18 Z" fill="#22c55e" />
                    <ellipse cx="50" cy="18" rx="18" ry="3" fill="#16a34a" />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE TOPS — solid fills, simple shapes, no strokes
   ============================================================ */
function renderTop(key: string, bodyType: string) {
    const w = bodyType === "female" ? 30 : 34;
    const l = 50 - w / 2;
    const r = 50 + w / 2;

    switch (key) {
        case "top_rashguard_blue":
            return (
                <g>
                    <rect x={l} y="40" width={w} height="24" rx="5" fill="#3b82f6" />
                    <ellipse cx="50" cy="42" rx="5" ry="2.5" fill="#2563eb" />
                </g>
            );
        case "top_rashguard_black":
            return (
                <g>
                    <rect x={l} y="40" width={w} height="24" rx="5" fill="#374151" />
                    <ellipse cx="50" cy="42" rx="5" ry="2.5" fill="#1f2937" />
                </g>
            );
        case "top_competition_swimsuit":
            return (
                <g>
                    <rect x={l} y="40" width={w} height="24" rx="5" fill="#0891b2" />
                    <ellipse cx="50" cy="42" rx="4" ry="2" fill="#0e7490" />
                    <rect x={l + 2} y="46" width="3" height="14" rx="1.5" fill="#22d3ee" />
                    <rect x={r - 5} y="46" width="3" height="14" rx="1.5" fill="#22d3ee" />
                </g>
            );
        case "top_training_shirt":
            return (
                <g>
                    <rect x={l} y="40" width={w} height="24" rx="5" fill="#f59e0b" />
                    <ellipse cx="50" cy="42" rx="5" ry="2.5" fill="#d97706" />
                </g>
            );
        case "top_hoodie":
            return (
                <g>
                    <rect x={l - 2} y="39" width={w + 4} height="26" rx="6" fill="#8b5cf6" />
                    <ellipse cx="50" cy="41" rx="6" ry="3" fill="#7c3aed" />
                    <circle cx="50" cy="48" r="1.5" fill="#a78bfa" />
                    <circle cx="50" cy="53" r="1.5" fill="#a78bfa" />
                </g>
            );
        case "top_team_jacket":
            return (
                <g>
                    <rect x={l} y="40" width={w} height="24" rx="5" fill="#1e40af" />
                    <rect x="49" y="40" width="2" height="24" fill="#f59e0b" />
                    <ellipse cx="50" cy="42" rx="4" ry="2" fill="#1e3a8a" />
                </g>
            );
        case "top_onepiece_pink":
            return (
                <g>
                    <rect x={l + 2} y="40" width={w - 4} height="24" rx="5" fill="#f472b6" />
                    <ellipse cx="50" cy="42" rx="4" ry="2" fill="#ec4899" />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE BOTTOMS — solid fills, no strokes
   ============================================================ */
function renderBottom(key: string) {
    switch (key) {
        case "bottom_swimtrunks_blue":
            return <rect x="35" y="60" width="30" height="14" rx="5" fill="#3b82f6" />;
        case "bottom_swimbriefs":
            return <rect x="37" y="60" width="26" height="10" rx="5" fill="#1e40af" />;
        case "bottom_jammers_black":
            return <rect x="35" y="59" width="30" height="20" rx="6" fill="#1e293b" />;
        case "bottom_athleticshorts":
            return <rect x="35" y="60" width="30" height="16" rx="5" fill="#475569" />;
        case "bottom_swimbriefs_red":
            return <rect x="37" y="60" width="26" height="10" rx="5" fill="#dc2626" />;
        case "bottom_onpiece_bottom":
            return <rect x="36" y="60" width="28" height="12" rx="5" fill="#ec4899" />;
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE SHOES — solid fills, no strokes
   ============================================================ */
function renderShoes(key: string) {
    switch (key) {
        case "shoes_fins_long":
            return (
                <g>
                    <path d="M 33 84 L 30 90 L 36 92 L 39 84 Z" fill="#06b6d4" />
                    <rect x="34" y="82" width="6" height="4" rx="2" fill="#0891b2" />
                    <path d="M 67 84 L 70 90 L 64 92 L 61 84 Z" fill="#06b6d4" />
                    <rect x="60" y="82" width="6" height="4" rx="2" fill="#0891b2" />
                </g>
            );
        case "shoes_fins_short":
            return (
                <g>
                    <rect x="34" y="84" width="8" height="6" rx="2" fill="#f59e0b" />
                    <rect x="58" y="84" width="8" height="6" rx="2" fill="#f59e0b" />
                </g>
            );
        case "shoes_flipflops":
            return (
                <g>
                    <rect x="35" y="85" width="10" height="4" rx="2" fill="#7c3aed" />
                    <rect x="38" y="83" width="3" height="3" rx="1.5" fill="#a78bfa" />
                    <rect x="55" y="85" width="10" height="4" rx="2" fill="#7c3aed" />
                    <rect x="59" y="83" width="3" height="3" rx="1.5" fill="#a78bfa" />
                </g>
            );
        case "shoes_slides":
            return (
                <g>
                    <rect x="34" y="85" width="12" height="5" rx="2.5" fill="#1e40af" />
                    <rect x="36" y="83" width="8" height="4" rx="2" fill="#3b82f6" />
                    <rect x="54" y="85" width="12" height="5" rx="2.5" fill="#1e40af" />
                    <rect x="56" y="83" width="8" height="4" rx="2" fill="#3b82f6" />
                </g>
            );
        case "shoes_athletic_white":
            return (
                <g>
                    <rect x="34" y="84" width="11" height="7" rx="3.5" fill="#ffffff" />
                    <rect x="34" y="89" width="11" height="2" rx="1" fill="#e5e7eb" />
                    <rect x="55" y="84" width="11" height="7" rx="3.5" fill="#ffffff" />
                    <rect x="55" y="89" width="11" height="2" rx="1" fill="#e5e7eb" />
                </g>
            );
        case "shoes_water_shoes":
            return (
                <g>
                    <rect x="34" y="84" width="11" height="6" rx="3" fill="#06b6d4" />
                    <rect x="35" y="82" width="8" height="4" rx="2" fill="#0891b2" />
                    <rect x="55" y="84" width="11" height="6" rx="3" fill="#06b6d4" />
                    <rect x="57" y="82" width="8" height="4" rx="2" fill="#0891b2" />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE HANDHELD — solid fills, no strokes
   ============================================================ */
function renderHandheld(key: string) {
    switch (key) {
        case "handheld_kickboard_blue":
            return (
                <g className="anim-float">
                    <rect x="70" y="48" width="18" height="16" rx="4" fill="#3b82f6" />
                    <rect x="73" y="51" width="12" height="10" rx="2" fill="#60a5fa" />
                </g>
            );
        case "handheld_kickboard_red":
            return (
                <g className="anim-float">
                    <rect x="70" y="48" width="18" height="16" rx="4" fill="#ef4444" />
                    <rect x="73" y="51" width="12" height="10" rx="2" fill="#f87171" />
                </g>
            );
        case "handheld_pullbuoy":
            return (
                <g className="anim-float">
                    <rect x="72" y="46" width="10" height="20" rx="5" fill="#f59e0b" />
                    <rect x="74" y="48" width="6" height="16" rx="3" fill="#d97706" />
                </g>
            );
        case "handheld_snorkel":
            return (
                <g className="anim-float">
                    <rect x="74" y="40" width="4" height="20" rx="2" fill="#06b6d4" />
                    <path d="M 76 40 Q 80 36 82 40 L 82 44 Q 80 42 76 40 Z" fill="#0891b2" />
                </g>
            );
        case "handheld_stopwatch":
            return (
                <g className="anim-float">
                    <circle cx="79" cy="56" r="7" fill="#e2e8f0" />
                    <circle cx="79" cy="56" r="5" fill="#ffffff" />
                    <rect x="76" y="47" width="6" height="3" rx="1" fill="#94a3b8" />
                    <line x1="79" y1="56" x2="79" y2="52" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="79" y1="56" x2="83" y2="56" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
                </g>
            );
        case "handheld_waterbottle":
            return (
                <g className="anim-float">
                    <rect x="73" y="46" width="9" height="20" rx="3" fill="#3b82f6" />
                    <rect x="75" y="44" width="5" height="4" rx="2" fill="#1e40af" />
                    <rect x="74" y="50" width="7" height="4" rx="1" fill="#60a5fa" opacity="0.5" />
                </g>
            );
        case "handheld_training_fins":
            return (
                <g className="anim-float">
                    <rect x="70" y="50" width="18" height="10" rx="3" fill="#ec4899" />
                    <rect x="72" y="52" width="14" height="6" rx="2" fill="#f472b6" />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   QUIZIZZ-STYLE ACCESSORY — solid fills, no strokes
   ============================================================ */
function renderAccessory(key: string) {
    switch (key) {
        case "accessory_medal_gold":
            return (
                <g>
                    <path d="M 44 42 L 48 48 L 50 45 L 52 48 L 56 42" fill="#f59e0b" />
                    <circle cx="50" cy="52" r="4.5" fill="#fbbf24" />
                    <text x="50" y="53.5" textAnchor="middle" fontSize="4" fill="#92400e" fontWeight="bold">1</text>
                </g>
            );
        case "accessory_watch":
            return (
                <g>
                    <rect x="67" y="48" width="10" height="8" rx="2" fill="#374151" />
                    <rect x="68" y="49" width="8" height="6" rx="1.5" fill="#0f172a" />
                    <circle cx="72" cy="52" r="1" fill="#22d3ee" />
                </g>
            );
        case "accessory_necklace":
            return <path d="M 42 42 Q 50 46 58 42" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />;
        case "accessory_goggles_neck":
            return (
                <g>
                    <rect x="41" y="42" width="9" height="6" rx="3" fill="#60a5fa" />
                    <rect x="50" y="42" width="9" height="6" rx="3" fill="#60a5fa" />
                    <rect x="49" y="44" width="2" height="2" rx="1" fill="#374151" />
                    <rect x="42" y="43" width="7" height="4" rx="2" fill="#1e3a8a" opacity="0.4" />
                    <rect x="51" y="43" width="7" height="4" rx="2" fill="#1e3a8a" opacity="0.4" />
                </g>
            );
        default:
            return null;
    }
}

/* ============================================================
   BACKGROUND
   ============================================================ */
function renderBackground(key: string) {
    switch (key) {
        case "bg_pool":
            return <div className="w-full h-full" style={{ background: "linear-gradient(180deg, #0c1426 0%, #0a1628 100%)" }} />;
        case "bg_underwater":
            return <div className="w-full h-full" style={{ background: "linear-gradient(180deg, #042f2e 0%, #0c1f2d 100%)" }} />;
        case "bg_competition":
            return <div className="w-full h-full" style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #0f0f23 100%)" }} />;
        case "bg_beach":
            return <div className="w-full h-full" style={{ background: "linear-gradient(180deg, #38bdf8 0%, #fde68a 60%, #fbbf24 100%)" }} />;
        default:
            return <div className="w-full h-full" style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%)" }} />;
    }
}

/* ============================================================
   SPECIAL SKIN — Quizizz-style full character overlays
   Clean fills, minimal strokes only for essential details
   ============================================================ */
function renderSpecialSkin(key: string, skinColor: string) {
    switch (key) {
        case "skin_luffy":
            return (
                <g filter="url(#softShadow)">
                    {/* Spiky hair */}
                    <path d="M 24 20 L 22 6 L 32 14 L 38 0 L 46 10 L 54 2 L 62 12 L 72 6 L 76 20" fill="#2d1b0e" />
                    {/* Straw hat brim */}
                    <ellipse cx="50" cy="16" rx="20" ry="4" fill="#fbbf24" />
                    {/* Straw hat crown */}
                    <path d="M 38 16 Q 38 4 50 3 Q 62 4 62 16 Z" fill="#fbbf24" />
                    <rect x="38" y="12" width="24" height="3" rx="1" fill="#dc2626" />
                    {/* Face */}
                    <circle cx="50" cy="24" r="15" fill={skinColor} />
                    {/* Scar under eye */}
                    <path d="M 42 26 L 45 30" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Big smile */}
                    <path d="M 43 29 Q 50 36 57 29" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                    {/* Simple dot eyes */}
                    <circle cx="44" cy="23" r="2.5" fill="#1a1a2e" />
                    <circle cx="56" cy="23" r="2.5" fill="#1a1a2e" />
                    {/* Arms */}
                    <rect x="22" y="42" width="13" height="20" rx="6.5" fill={skinColor} />
                    <rect x="65" y="42" width="13" height="20" rx="6.5" fill={skinColor} />
                    {/* Torso - red vest */}
                    <rect x="33" y="40" width="34" height="24" rx="5" fill="#ef4444" />
                    <ellipse cx="50" cy="42" rx="6" ry="3" fill={skinColor} />
                    {/* Blue shorts */}
                    <rect x="35" y="60" width="30" height="14" rx="5" fill="#3b82f6" />
                    {/* Legs */}
                    <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    {/* Sandals */}
                    <rect x="35" y="84" width="12" height="5" rx="2" fill="#7c2d12" />
                    <rect x="53" y="84" width="12" height="5" rx="2" fill="#7c2d12" />
                </g>
            );
        case "skin_goku":
            return (
                <g filter="url(#softShadow)">
                    {/* Super Saiyan hair */}
                    <path d="M 22 22 L 14 4 L 28 12 L 36 -4 L 44 8 L 56 -6 L 64 10 L 78 2 L 74 22" fill="#fbbf24" />
                    {/* Face */}
                    <circle cx="50" cy="24" r="15" fill={skinColor} />
                    {/* Serious eyes */}
                    <circle cx="44" cy="23" r="2.8" fill="#1a1a2e" />
                    <circle cx="56" cy="23" r="2.8" fill="#1a1a2e" />
                    <circle cx="43" cy="22" r="0.9" fill="#fff" />
                    <circle cx="55" cy="22" r="0.9" fill="#fff" />
                    {/* Fierce eyebrows */}
                    <path d="M 39 19 L 48 21" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 52 21 L 61 19" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                    {/* Confident smile */}
                    <path d="M 45 29 Q 50 32 55 29" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    {/* Orange gi */}
                    <rect x="33" y="40" width="34" height="24" rx="5" fill="#f97316" />
                    <ellipse cx="50" cy="42" rx="6" ry="3" fill={skinColor} />
                    {/* Kanji symbol */}
                    <rect x="45" y="48" width="10" height="8" rx="1" fill="#1e293b" />
                    {/* Blue belt */}
                    <rect x="34" y="60" width="32" height="4" rx="1" fill="#1e40af" />
                    {/* Blue pants */}
                    <rect x="35" y="60" width="30" height="14" rx="5" fill="#1e40af" />
                    {/* Legs */}
                    <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    {/* Blue boots */}
                    <rect x="34" y="82" width="13" height="8" rx="3" fill="#1e40af" />
                    <rect x="53" y="82" width="13" height="8" rx="3" fill="#1e40af" />
                </g>
            );
        case "skin_naruto":
            return (
                <g filter="url(#softShadow)">
                    {/* Spiky blond hair */}
                    <path d="M 24 20 L 18 2 L 30 12 L 40 -4 L 48 8 L 56 -2 L 64 10 L 74 4 L 72 20" fill="#fbbf24" />
                    {/* Headband */}
                    <rect x="34" y="14" width="32" height="6" rx="1" fill="#1e40af" />
                    <rect x="42" y="13" width="16" height="8" rx="1" fill="#94a3b8" />
                    {/* Spiral symbol */}
                    <circle cx="50" cy="17" r="2.5" fill="#64748b" />
                    {/* Face */}
                    <circle cx="50" cy="25" r="15" fill={skinColor} />
                    {/* Whisker marks */}
                    <line x1="33" y1="26" x2="41" y2="27" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    <line x1="33" y1="30" x2="41" y2="30" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    <line x1="33" y1="34" x2="41" y2="33" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    <line x1="59" y1="27" x2="67" y2="26" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    <line x1="59" y1="30" x2="67" y2="30" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    <line x1="59" y1="33" x2="67" y2="34" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" />
                    {/* Big grin */}
                    <path d="M 43 29 Q 50 37 57 29" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                    {/* Blue eyes */}
                    <circle cx="44" cy="23" r="3" fill="#3b82f6" />
                    <circle cx="56" cy="23" r="3" fill="#3b82f6" />
                    <circle cx="44" cy="23" r="1.8" fill="#1a1a2e" />
                    <circle cx="56" cy="23" r="1.8" fill="#1a1a2e" />
                    {/* Orange jacket */}
                    <rect x="33" y="40" width="34" height="24" rx="5" fill="#f97316" />
                    <rect x="48" y="40" width="4" height="24" fill="#1a1a2e" />
                    <ellipse cx="50" cy="42" rx="5" ry="3" fill={skinColor} />
                    {/* Dark pants */}
                    <rect x="35" y="60" width="30" height="14" rx="5" fill="#1e293b" />
                    {/* Legs */}
                    <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    {/* Ninja sandals */}
                    <rect x="36" y="84" width="11" height="5" rx="2" fill="#1e293b" />
                    <rect x="53" y="84" width="11" height="5" rx="2" fill="#1e293b" />
                </g>
            );
        case "skin_conan":
            return (
                <g filter="url(#softShadow)">
                    {/* Messy brown hair */}
                    <path d="M 32 20 L 36 16 L 40 22 L 46 15 L 52 22 L 58 16 L 63 22 L 67 16 L 68 20 Q 50 10 32 20 Z" fill="#5c2e0b" />
                    <path d="M 62 12 Q 66 2 63 2 Q 60 6 60 12" fill="#5c2e0b" />
                    {/* Big round glasses */}
                    <circle cx="42" cy="25" r="11" fill="none" stroke="#1f1f1f" strokeWidth="2" />
                    <circle cx="58" cy="25" r="11" fill="none" stroke="#1f1f1f" strokeWidth="2" />
                    <line x1="53" y1="25" x2="47" y2="25" stroke="#1f1f1f" strokeWidth="2" />
                    {/* Face */}
                    <circle cx="50" cy="24" r="15" fill={skinColor} />
                    {/* Blue eyes behind glasses */}
                    <circle cx="42" cy="25" r="3" fill="#1e3a8a" />
                    <circle cx="58" cy="25" r="3" fill="#1e3a8a" />
                    <circle cx="42" cy="25" r="1.8" fill="#000" />
                    <circle cx="58" cy="25" r="1.8" fill="#000" />
                    <circle cx="40.5" cy="23.5" r="0.8" fill="#fff" />
                    <circle cx="56.5" cy="23.5" r="0.8" fill="#fff" />
                    {/* Small confident smile */}
                    <path d="M 46 31 Q 50 34 54 31" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Arrow/line for nose */}
                    <path d="M 49 27 L 51 29" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Blue suit jacket */}
                    <rect x="34" y="40" width="32" height="24" rx="5" fill="#1e40af" />
                    {/* White shirt */}
                    <polygon points="46,40 50,48 54,40" fill="#ffffff" />
                    {/* Red bow tie */}
                    <path d="M 44 43 L 40 40 L 40 46 Z" fill="#dc2626" />
                    <path d="M 56 43 L 60 40 L 60 46 Z" fill="#dc2626" />
                    <circle cx="50" cy="43" r="1.5" fill="#dc2626" />
                    {/* Gray pants */}
                    <rect x="35" y="60" width="30" height="14" rx="5" fill="#6b7280" />
                    {/* Legs */}
                    <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    {/* White shoes */}
                    <rect x="36" y="84" width="12" height="6" rx="3" fill="#ffffff" />
                    <rect x="52" y="84" width="12" height="6" rx="3" fill="#ffffff" />
                </g>
            );
        case "skin_l_deathnote":
            return (
                <g filter="url(#softShadow)">
                    {/* Messy black hair */}
                    <path d="M 22 22 L 24 10 L 32 16 L 34 2 L 42 12 L 48 4 L 56 14 L 64 6 L 70 16 L 76 10 L 78 22" fill="#1f2937" />
                    {/* Face */}
                    <circle cx="50" cy="26" r="15" fill={skinColor} />
                    {/* Dark circles under eyes */}
                    <ellipse cx="44" cy="31" rx="5" ry="2" fill="#475569" opacity="0.4" />
                    <ellipse cx="56" cy="31" rx="5" ry="2" fill="#475569" opacity="0.4" />
                    {/* Big intense eyes */}
                    <circle cx="44" cy="27" r="3.5" fill="#1a1a2e" />
                    <circle cx="56" cy="27" r="3.5" fill="#1a1a2e" />
                    <circle cx="42.5" cy="25.5" r="1" fill="#fff" />
                    <circle cx="54.5" cy="25.5" r="1" fill="#fff" />
                    {/* Neutral mouth */}
                    <line x1="46" y1="35" x2="54" y2="35" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
                    {/* White shirt */}
                    <rect x="34" y="40" width="32" height="24" rx="5" fill="#ffffff" />
                    <ellipse cx="50" cy="42" rx="5" ry="3" fill={skinColor} />
                    {/* Blue jeans */}
                    <rect x="35" y="60" width="30" height="14" rx="5" fill="#1e40af" />
                    {/* Legs */}
                    <rect x="37" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    <rect x="53" y="63" width="10" height="22" rx="5" fill={skinColor} />
                    {/* Bare feet (L's signature) */}
                    <ellipse cx="42" cy="87" rx="5.5" ry="3" fill={skinColor} />
                    <ellipse cx="58" cy="87" rx="5.5" ry="3" fill={skinColor} />
                </g>
            );
        default:
            return null;
    }
}
