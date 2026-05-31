"use client";

import React from 'react';

interface AvatarRendererProps {
    equippedItems?: Record<string, string>;
    gender?: string; // To support different base models if necessary
    size?: number;
    animated?: boolean;
    mode?: "single" | "environment";
}

export function AvatarRenderer({ equippedItems = {}, gender = 'unisex', mode = "single", size }: AvatarRendererProps) {
    const hair = equippedItems['hair'] || 'default_hair';
    const clothes = equippedItems['body'] || 'default_clothes';
    const hat = equippedItems['hat'] || null;
    const face = equippedItems['face'] || null;

    // "Single" mode perfectly matches Image 3 (Centered single character)
    if (mode === "single") {
        const isZoomed = typeof size === 'number' && size < 200;
        const currentViewBox = isZoomed ? "100 100 400 400" : "0 0 600 800";
        const currentClass = isZoomed ? "" : "w-full h-full drop-shadow-md";
        return (
            <div
                className={isZoomed ? "relative flex items-center justify-center overflow-hidden shrink-0" : "relative w-full max-w-[400px] aspect-[3/4] flex items-end justify-center"}
                style={isZoomed ? { width: `${size}px`, height: `${size}px` } : undefined}
            >
                <svg
                    viewBox={currentViewBox}
                    className={currentClass}
                    style={isZoomed ? { width: '100%', height: '100%' } : undefined}
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="translate(150, 250)">
                        {/* Body / Clothes */}
                        {renderOutfit(clothes)}

                        {/* Head & Neck */}
                        <rect x="135" y="140" width="30" height="40" fill="#ffe0cc" stroke="#333" strokeWidth="3" />
                        <circle cx="150" cy="110" r="70" fill="#ffe0cc" stroke="#333" strokeWidth="3" />

                        {/* Eyes & Smile (Default) */}
                        <circle cx="120" cy="110" r="6" fill="#333" />
                        <circle cx="180" cy="110" r="6" fill="#333" />
                        <path d="M 135 130 Q 150 145 165 130" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />

                        {/* Face Face decorations */}
                        {face && renderFace(face)}

                        {/* Hair */}
                        {renderHair(hair)}

                        {/* Hat / Crown / Headdress */}
                        {hat && renderHat(hat)}

                        {/* Desk & Hands (Image 3) */}
                        <path d="M 230 300 Q 180 400 130 380" fill="none" stroke="#ffe0cc" strokeWidth="30" strokeLinecap="round" />
                        <path d="M 230 300 Q 180 400 130 380" fill="none" stroke="#333" strokeWidth="3" strokeDasharray="35, 100" />
                        {/* Yellow Pencil */}
                        <rect x="140" y="340" width="10" height="60" fill="#ffeb3b" stroke="#333" strokeWidth="2" transform="rotate(30, 145, 340)" />
                        <polygon points="110,390 125,400 115,410" fill="#fbc02d" stroke="#333" strokeWidth="2" />

                        {/* The Paper */}
                        <rect x="90" y="400" width="120" height="80" fill="#fff" stroke="#333" strokeWidth="2" transform="rotate(5, 150, 440)" />
                        <line x1="100" y1="420" x2="190" y2="430" stroke="#ccc" strokeWidth="2" />
                        <line x1="100" y1="440" x2="190" y2="450" stroke="#ccc" strokeWidth="2" />

                        {/* Desk Accessory */}
                        {equippedItems['desk_acc'] && renderDeskAcc(equippedItems['desk_acc'])}
                    </g>

                    {/* Desk Base Edge */}
                    <path d="M 0 650 L 600 650 L 600 800 L 0 800 Z" fill="#e0e0e0" stroke="#ccc" strokeWidth="4" />
                </svg>
            </div>
        );
    }

    // "Environment" mode (Images 1 & 2 - Full Desk Space)
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-end">
            <svg
                viewBox="0 0 800 1000"
                className="w-full h-full"
                preserveAspectRatio="xMidYMax slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Gold filigree gradient */}
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffe082" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#b58900" />
                    </linearGradient>
                    {/* Blue glowing lantern glass */}
                    <radialGradient id="blueLanternGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#e0f7fa" />
                        <stop offset="40%" stopColor="#4dd0e1" />
                        <stop offset="85%" stopColor="#00acc1" />
                        <stop offset="100%" stopColor="#00838f" />
                    </radialGradient>
                    {/* Inner lantern glow */}
                    <radialGradient id="lanternInnerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="30%" stopColor="#e0f7fa" />
                        <stop offset="70%" stopColor="#00e5ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                    </radialGradient>
                    {/* Tassel gradient */}
                    <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#006064" />
                        <stop offset="30%" stopColor="#00acc1" />
                        <stop offset="70%" stopColor="#00acc1" />
                        <stop offset="100%" stopColor="#004d40" />
                    </linearGradient>
                </defs>

                {/* 1. Wallpaper */}
                {equippedItems['wallpaper'] ? (
                    renderWallpaper(equippedItems['wallpaper'])
                ) : (
                    /* Default wallpaper */
                    <rect x="0" y="0" width="800" height="750" fill="#fafae6" />
                )}

                {/* 2. Window */}
                {equippedItems['window'] && equippedItems['window'] !== 'window_cloudflower' ? (
                    renderWindow(equippedItems['window'])
                ) : equippedItems['window'] === 'window_cloudflower' ? (
                    <g transform="translate(150, 200)">
                        <rect x="0" y="0" width="500" height="300" fill="#e1f5fe" stroke="#b0bec5" strokeWidth="10" rx="10" />
                        <path d="M 0 150 Q 250 -50 500 150" fill="#bbdefb" />
                        <path d="M 0 200 Q 250 150 500 200" fill="#c8e6c9" />
                        {/* Shutters */}
                        <rect x="-80" y="0" width="80" height="300" fill="#fff" stroke="#cfd8dc" strokeWidth="5" />
                        <rect x="500" y="0" width="80" height="300" fill="#fff" stroke="#cfd8dc" strokeWidth="5" />
                    </g>
                ) : null}

                {/* 3. Wall Decoration / Sticker */}
                {equippedItems['decoration_wall'] && renderDecorationWall(equippedItems['decoration_wall'])}

                {/* 4. Whiteboard */}
                {equippedItems['whiteboard'] && renderWhiteboard(equippedItems['whiteboard'])}

                {/* 5. Broadcaster (Wall Layer) */}
                {equippedItems['broadcaster'] && renderBroadcaster(equippedItems['broadcaster'])}

                {/* 6. Carpet */}
                {equippedItems['carpet'] && renderCarpet(equippedItems['carpet'])}

                {/* 7. Large Cabinet */}
                {equippedItems['large_cabinet'] && renderLargeCabinet(equippedItems['large_cabinet'])}

                {/* 8. Cabinet */}
                {equippedItems['cabinet'] && renderCabinet(equippedItems['cabinet'])}

                {/* 9. Ground Lamp */}
                {equippedItems['ground_lamp'] && renderGroundLamp(equippedItems['ground_lamp'])}

                {/* 10. Decoration Floor */}
                {equippedItems['decoration_floor'] && renderDecorationFloor(equippedItems['decoration_floor'])}

                {/* Hanging / Wall Items (Image 1) */}
                {renderWallHanging(equippedItems['wall_hanging'] || '')}

                {/* Wall Base / Dado (only show if no wallpaper is equipped) */}
                {!equippedItems['wallpaper'] && (
                    <rect x="0" y="600" width="800" height="200" fill="#f1f8e9" opacity="0.5" />
                )}

                {/* Nameplate / Sign on Wall (Image 1) */}
                <rect x="650" y="250" width="200" height="300" fill="#fff" stroke="#ffb74d" strokeWidth="8" rx="5" />
                <rect x="660" y="260" width="180" height="50" fill="#e3f2fd" />
                <text x="750" y="295" fontSize="24" fill="#333" textAnchor="middle" fontWeight="bold">同桌天地</text>

                <text x="750" y="380" fontSize="60" fill="#333" textAnchor="middle" fontWeight="bold">41</text>

                {/* Desk Base */}
                <path d="M 0 750 L 800 750 L 800 1000 L 0 1000 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="4" />
                <path d="M 0 780 L 800 780" stroke="#795548" strokeWidth="3" />

                {/* Desk Ornaments */}
                {renderDeskOrnament(equippedItems['desk_ornament'] || '')}
            </svg>
        </div>
    );
}

// Stub render functions for environment mode item categories
// TODO: Implement full SVG renderers for each item type
function renderWallpaper(item: string) {
    if (!item) return null;
    // Default fallback wallpaper
    return <rect x="0" y="0" width="800" height="750" fill="#fafae6" />;
}

function renderWindow(item: string) {
    if (!item) return null;
    return (
        <g transform="translate(150, 200)">
            <rect x="0" y="0" width="500" height="300" fill="#e1f5fe" stroke="#b0bec5" strokeWidth="10" rx="10" />
            <path d="M 0 150 Q 250 -50 500 150" fill="#bbdefb" />
            <rect x="-80" y="0" width="80" height="300" fill="#fff" stroke="#cfd8dc" strokeWidth="5" />
            <rect x="500" y="0" width="80" height="300" fill="#fff" stroke="#cfd8dc" strokeWidth="5" />
        </g>
    );
}

function renderDecorationWall(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderWhiteboard(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderBroadcaster(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderCarpet(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderLargeCabinet(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderCabinet(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderGroundLamp(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderDecorationFloor(item: string) {
    if (!item) return null;
    return null; // TODO: implement per-item SVG
}

function renderOutfit(clothes: string) {
    // Standard body base shape: M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z
    switch (clothes) {
        case 'clothes_jiashan':
            return (
                <g>
                    {/* 假两件毛衣 - Beige sweater + light blue denim collar + horse pendant */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#efebe9" stroke="#4e342e" strokeWidth="3" />
                    {/* Blue shirt collar */}
                    <polygon points="120,180 150,210 135,230 110,200" fill="#bbdefb" stroke="#333" strokeWidth="2" />
                    <polygon points="180,180 150,210 165,230 190,200" fill="#bbdefb" stroke="#333" strokeWidth="2" />
                    <path d="M 150 210 L 150 250" stroke="#333" strokeWidth="2" />
                    {/* Sweater collar ribbing */}
                    <path d="M 105,195 Q 150,225 195,195 Q 150,235 105,195 Z" fill="#d7ccc8" stroke="#4e342e" strokeWidth="2" />
                    {/* Horse Pendant */}
                    <circle cx="150" cy="270" r="12" fill="#8d6e63" stroke="#333" strokeWidth="2" />
                    <rect x="148" y="225" width="4" height="35" fill="#3e2723" />
                    <path d="M 140 270 Q 150 285 160 270" stroke="#333" strokeWidth="2" fill="none" />
                </g>
            );
        case 'clothes_youmu':
            return (
                <g>
                    {/* 游牧风披肩 - Plaid brown + asymmetrical green shawl + buckles */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#a1887f" stroke="#3e2723" strokeWidth="3" />
                    {/* Plaid lines */}
                    <path d="M 60 220 L 240 400 M 100 180 L 220 380 M 240 220 L 60 400 M 200 180 L 80 380" stroke="#5d4037" strokeWidth="2" opacity="0.6" />
                    {/* Green drape */}
                    <path d="M 40 250 C 80 200, 150 250, 180 350 C 130 420, 60 400, 40 250 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="3" />
                    {/* Metal buckle and leather strap */}
                    <rect x="110" y="240" width="30" height="8" fill="#ffb300" rx="2" stroke="#333" strokeWidth="1.5" />
                    <circle cx="125" cy="244" r="6" fill="#fff" stroke="#333" />
                </g>
            );
        case 'clothes_lanxu':
            return (
                <g>
                    {/* 兰序浅影西装 - Mint suit + cream lapel + orchid branch */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e0f2f1" stroke="#004d40" strokeWidth="3" />
                    {/* Cream Lapels */}
                    <path d="M 100 170 L 150 260 L 130 280 L 85 190 Z" fill="#fffde7" stroke="#004d40" strokeWidth="2" />
                    <path d="M 200 170 L 150 260 L 170 280 L 215 190 Z" fill="#fffde7" stroke="#004d40" strokeWidth="2" />
                    {/* Orchid Branch on Left Chest */}
                    <path d="M 80 280 Q 95 240 85 210" fill="none" stroke="#2e7d32" strokeWidth="2" />
                    <circle cx="85" cy="210" r="5" fill="#4db6ac" stroke="#004d40" strokeWidth="1" />
                    <path d="M 82 225 Q 75 220 80 230 Z" fill="#4db6ac" />
                </g>
            );
        case 'clothes_yanmei':
            return (
                <g>
                    {/* 胭梅点襟旗袍 - Pink cheongsam + cheongsam patterns + white tassels */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f8bbd0" stroke="#880e4f" strokeWidth="3" />
                    {/* Cheongsam Collar */}
                    <rect x="135" y="160" width="30" height="20" fill="#f8bbd0" stroke="#880e4f" strokeWidth="2" />
                    <line x1="135" y1="170" x2="165" y2="170" stroke="#880e4f" strokeWidth="2" />
                    {/* Red Plum branches and white flower dots */}
                    <path d="M 150 200 Q 180 240 190 280 M 150 200 Q 130 250 120 280" fill="none" stroke="#c62828" strokeWidth="2.5" />
                    <circle cx="170" cy="225" r="4" fill="#fff" stroke="#c62828" />
                    <circle cx="140" cy="235" r="4" fill="#fff" stroke="#c62828" />
                    <circle cx="180" cy="255" r="5" fill="#ff80ab" />
                    {/* Sleeve tassels */}
                    <path d="M 40 250 L 35 320" stroke="#fff" strokeWidth="3" strokeDasharray="3,3" />
                    <path d="M 260 250 L 265 320" stroke="#fff" strokeWidth="3" strokeDasharray="3,3" />
                </g>
            );
        case 'clothes_diemeng_suit':
            return (
                <g>
                    {/* 西庭蝶梦西装 - White suit coat, dark blue vest, blue shoulder feathers */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fafafa" stroke="#1565c0" strokeWidth="3" />
                    {/* Midnight Blue vest */}
                    <path d="M 120 180 L 150 250 L 180 180 Z" fill="#0d47a1" stroke="#002171" strokeWidth="2" />
                    {/* Gold buttons */}
                    <circle cx="150" cy="220" r="3" fill="#ffb300" />
                    {/* Blue shoulder feathers */}
                    <g transform="translate(45, 170)">
                        <path d="M 0 30 Q -20 -10 10 -20 Q 30 10 0 30 Z" fill="#1e88e5" opacity="0.9" />
                        <path d="M 10 40 Q -10 10 20 0 Q 40 30 10 40 Z" fill="#1565c0" />
                        <path d="M -10 20 Q -30 -10 0 -15 Q 15 15 -10 20 Z" fill="#64b5f6" opacity="0.8" />
                    </g>
                </g>
            );
        case 'clothes_diemeng_gown':
            return (
                <g>
                    {/* 西庭蝶梦礼服 - Dark blue gown, starry sparkles, navy gloves */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#0a192f" stroke="#002171" strokeWidth="3" />
                    {/* Starry sparkles */}
                    <circle cx="100" cy="240" r="2" fill="#fff" opacity="0.8" />
                    <circle cx="200" cy="240" r="2" fill="#fff" opacity="0.8" />
                    <circle cx="150" cy="270" r="3" fill="#ffeb3b" />
                    <circle cx="130" cy="210" r="2.5" fill="#fff" />
                    <circle cx="170" cy="210" r="2.5" fill="#fff" />
                    {/* White dress straps */}
                    <line x1="100" y1="180" x2="110" y2="210" stroke="#fff" strokeWidth="3" />
                    <line x1="200" y1="180" x2="190" y2="210" stroke="#fff" strokeWidth="3" />
                    {/* Chest curves */}
                    <path d="M 80 210 Q 150 240 220 210" fill="none" stroke="#0d47a1" strokeWidth="3" />
                </g>
            );
        case 'clothes_xmas_shawl':
            return (
                <g>
                    {/* 圣诞绮遇披肩 - Green shawl, fur borders, red bow */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="3" />
                    {/* White fluffy border at bottom */}
                    <path d="M 40 250 Q 150 200 260 250 Q 275 350 150 420 Q 25 350 40 250 Z" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity="0.95" />
                    {/* Red Ribbon bow at collar */}
                    <g transform="translate(150, 185)">
                        <circle cx="0" cy="0" r="8" fill="#d84315" stroke="#333" strokeWidth="1.5" />
                        <path d="M -8 0 C -25 -15, -25 15, -8 0 Z" fill="#d84315" stroke="#333" strokeWidth="1.5" />
                        <path d="M 8 0 C 25 -15, 25 15, 8 0 Z" fill="#d84315" stroke="#333" strokeWidth="1.5" />
                        <path d="M -5 5 L -15 25" stroke="#d84315" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 5 5 L 15 25" stroke="#d84315" strokeWidth="4" strokeLinecap="round" />
                    </g>
                </g>
            );
        case 'clothes_xmas_dress':
            return (
                <g>
                    {/* 圣诞绮梦蓬蓬裙 - Red holiday corset + cream sleeves + lace */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#c62828" stroke="#880e4f" strokeWidth="3" />
                    {/* Cream sleeves */}
                    <path d="M 40 250 C 20 200, -20 250, 10 320" fill="#fffde7" stroke="#333" strokeWidth="2" />
                    <path d="M 260 250 C 280 200, 320 250, 290 320" fill="#fffde7" stroke="#333" strokeWidth="2" />
                    {/* Red cuffs */}
                    <rect x="5" y="305" width="10" height="15" fill="#c62828" stroke="#333" strokeWidth="1.5" transform="rotate(-15, 10, 310)" />
                    <rect x="285" y="305" width="10" height="15" fill="#c62828" stroke="#333" strokeWidth="1.5" transform="rotate(15, 290, 310)" />
                    {/* Gold trim down center */}
                    <path d="M 150 180 L 150 320" stroke="#fbc02d" strokeWidth="4" />
                    <line x1="135" y1="220" x2="165" y2="220" stroke="#fbc02d" strokeWidth="2" />
                    <line x1="135" y1="250" x2="165" y2="250" stroke="#fbc02d" strokeWidth="2" />
                </g>
            );
        case 'clothes_ruiyun':
            return (
                <g>
                    {/* 瑞云银狐袍 - Ancient silver/white robe, gold ribbons */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f5f5f5" stroke="#424242" strokeWidth="3" />
                    <path d="M 150 180 L 120 280 L 150 330 L 180 280 Z" fill="#e0e0e0" stroke="#ccc" strokeWidth="2" />
                    <path d="M 80 230 Q 150 280 220 230" fill="none" stroke="#d4af37" strokeWidth="2.5" />
                    <path d="M 60 280 Q 150 330 240 280" fill="none" stroke="#d4af37" strokeWidth="2.5" />
                </g>
            );
        case 'clothes_fengwei':
            return (
                <g>
                    {/* 凤尾繁花裙 - Blossoming pink dress, golden collar, translucent ribbons */}
                    {/* Back ribbons (floating) */}
                    <path d="M 20 250 Q -50 200 -20 350 Q 10 400 30 330" fill="none" stroke="#ff80ab" strokeWidth="8" opacity="0.6" strokeLinecap="round" />
                    <path d="M 280 250 Q 350 200 320 350 Q 290 400 270 330" fill="none" stroke="#ff80ab" strokeWidth="8" opacity="0.6" strokeLinecap="round" />

                    {/* Main dress */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fce4ec" stroke="#c2185b" strokeWidth="3" />

                    {/* Gold neck collar */}
                    <path d="M 120 180 Q 150 205 180 180 Q 150 225 120 180 Z" fill="#ffd54f" stroke="#c2185b" strokeWidth="1.5" />
                    <circle cx="150" cy="205" r="4" fill="#e91e63" />

                    {/* Layered floral skirt lines */}
                    <path d="M 70 320 Q 150 370 230 320" fill="none" stroke="#ff80ab" strokeWidth="2" />
                    <path d="M 60 360 Q 150 410 240 360" fill="none" stroke="#ff80ab" strokeWidth="2" />
                </g>
            );
        case 'clothes_skycity':
            return (
                <g>
                    {/* 天空城骑士礼服 - Blue knight suit, blue shoulder roses */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e3f2fd" stroke="#1565c0" strokeWidth="3" />
                    <path d="M 150 180 L 120 280 L 150 330 L 180 280 Z" fill="#90caf9" stroke="#1e88e5" strokeWidth="2" />
                    {/* Gold epaulets */}
                    <rect x="35" y="210" width="25" height="8" fill="#ffca28" stroke="#333" strokeWidth="1.5" />
                    <rect x="240" y="210" width="25" height="8" fill="#ffca28" stroke="#333" strokeWidth="1.5" />
                    {/* Blue rose on left shoulder */}
                    <circle cx="45" cy="210" r="8" fill="#1565c0" stroke="#0d47a1" />
                    <circle cx="43" cy="208" r="4" fill="#42a5f5" />
                </g>
            );
        case 'clothes_yunsha':
            return (
                <g>
                    {/* 云纱宫廷蓬蓬裙 - Classical gown, blue corset lace, gauze sleeves */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fffdf7" stroke="#8d6e63" strokeWidth="3" />
                    {/* Blue corset laces */}
                    <path d="M 140 200 L 160 220 M 160 200 L 140 220 M 140 220 L 160 240 M 160 220 L 140 240" stroke="#1976d2" strokeWidth="2" />
                    {/* Gauze sleeves */}
                    <path d="M 40 250 C 10 210, -30 260, 20 330" fill="#e0f2f1" stroke="#004d40" strokeWidth="1.5" opacity="0.75" />
                    <path d="M 260 250 C 290 210, 330 260, 280 330" fill="#e0f2f1" stroke="#004d40" strokeWidth="1.5" opacity="0.75" />
                </g>
            );
        case 'clothes_chenyue':
            return (
                <g>
                    {/* 沉月·改良明制 - Red and black modern Hanfu */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#b71c1c" stroke="#212121" strokeWidth="3" />
                    {/* Black modern collars and belts */}
                    <path d="M 100 170 L 150 250 L 200 170 L 210 180 L 150 270 L 90 180 Z" fill="#212121" stroke="#b71c1c" strokeWidth="1.5" />
                    {/* Gold trim along lapel */}
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#ffb300" strokeWidth="2" />
                    {/* Intricate cloud textures on black inner cuffs */}
                    <path d="M 30 260 C 20 280, 25 320, 45 310" fill="none" stroke="#424242" strokeWidth="3" />
                    <path d="M 270 260 C 280 280, 275 320, 255 310" fill="none" stroke="#424242" strokeWidth="3" />
                </g>
            );
        case 'clothes_chunyan':
            return (
                <g>
                    {/* 春烟·改良明制 - Peach/orange Ming style coat, white fur */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffb74d" stroke="#e65100" strokeWidth="3" />
                    {/* Fluffy white fur collar */}
                    <path d="M 115 170 Q 150 200 185 170 Q 195 210 150 215 Q 105 210 115 170 Z" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    {/* Gold flower details */}
                    <circle cx="85" cy="250" r="5" fill="#fff" stroke="#ffb300" />
                    <circle cx="215" cy="250" r="5" fill="#fff" stroke="#ffb300" />
                </g>
            );
        case 'clothes_fuma':
            return (
                <g>
                    {/* 福马迎春两件套 - Ivory modern Tang coat, red borders, horse embroidery */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fffdeb" stroke="#d50000" strokeWidth="3" />
                    {/* Red frog buttons */}
                    <line x1="135" y1="210" x2="165" y2="210" stroke="#d50000" strokeWidth="3.5" />
                    <line x1="135" y1="240" x2="165" y2="240" stroke="#d50000" strokeWidth="3.5" />
                    <circle cx="150" cy="210" r="4.5" fill="#d50000" />
                    <circle cx="150" cy="240" r="4.5" fill="#d50000" />
                    {/* Golden horse patterns on shoulders */}
                    <path d="M 65 200 Q 75 190 70 210 Q 80 205 75 220" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                    <path d="M 235 200 Q 225 190 230 210 Q 220 205 225 220" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                </g>
            );
        case 'clothes_xinzhongshi':
            return (
                <g>
                    {/* 新中式毛领外套 - Red festive winter coat + fuzzy collar + pom-poms */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d50000" stroke="#3e2723" strokeWidth="3" />
                    {/* Fluffy collar */}
                    <path d="M 110,170 Q 150,195 190,170 Q 200,210 150,210 Q 100,210 110,170 Z" fill="#ffffff" stroke="#ccc" strokeWidth="1" />
                    {/* Dangling fuzzy pom-pom tassels */}
                    <line x1="135" y1="205" x2="130" y2="245" stroke="#ffffff" strokeWidth="3.5" />
                    <line x1="165" y1="205" x2="170" y2="245" stroke="#ffffff" strokeWidth="3.5" />
                    <circle cx="130" cy="245" r="10" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                    <circle cx="170" cy="245" r="10" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                </g>
            );
        case 'clothes_liusu':
            return (
                <g>
                    {/* 流苏斗篷披肩 - Tan fringe poncho + diagonal bullet belt */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d7ccc8" stroke="#5d4037" strokeWidth="3" />
                    {/* Stripes */}
                    <line x1="90" y1="180" x2="60" y2="350" stroke="#8d6e63" strokeWidth="3" />
                    <line x1="210" y1="180" x2="240" y2="350" stroke="#8d6e63" strokeWidth="3" />
                    {/* Leather bullets cross belt */}
                    <path d="M 70 200 L 230 350" stroke="#3e2723" strokeWidth="12" />
                    <path d="M 90 220 L 210 330" stroke="#d4af37" strokeWidth="6" strokeDasharray="6,8" />
                    {/* Fringe tassels at bottom */}
                    <path d="M 50 350 L 50 380 M 80 370 L 80 400 M 110 380 L 110 410 M 140 385 L 140 415 M 170 385 L 170 415 M 200 380 L 200 410 M 230 370 L 230 400 M 250 350 L 250 380" stroke="#a1887f" strokeWidth="4.5" strokeLinecap="round" />
                </g>
            );
        case 'clothes_muguang':
            return (
                <g>
                    {/* 暮光骑士装 - Cowboy vest, white shirt, sheriff badge, red bandana */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#5d4037" strokeWidth="3" />
                    {/* Brown leather vest open */}
                    <path d="M 75 180 L 110 280 L 80 380 L 35 240 Z" fill="#4e342e" stroke="#3e2723" strokeWidth="2" />
                    <path d="M 225 180 L 190 280 L 220 380 L 265 240 Z" fill="#4e342e" stroke="#3e2723" strokeWidth="2" />
                    {/* Red Bandana Band around neck */}
                    <polygon points="120,180 150,210 180,180 150,165" fill="#d50000" stroke="#b71c1c" strokeWidth="1.5" />
                    <polygon points="145,210 150,235 155,210" fill="#d50000" />
                    {/* Sheriff star badge */}
                    <polygon points="90,230 93,238 101,238 95,243 97,251 90,246 83,251 85,243 79,238 87,238" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1" />
                </g>
            );
        case 'clothes_biye':
            return (
                <g>
                    {/* 碧野闲踪袍 - Ranger green tunic + laced corset + leaf shoulder pad */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3" />
                    {/* Leather Laced Corset */}
                    <path d="M 110 240 L 190 240 L 180 340 L 120 340 Z" fill="#5d4037" stroke="#3e2723" strokeWidth="2" />
                    <path d="M 140 250 L 160 270 M 160 250 L 140 270 M 140 270 L 160 290 M 160 270 L 140 290 M 140 290 L 160 310 M 160 290 L 140 310" stroke="#ffd54f" strokeWidth="2" />
                    {/* Leaf shoulder pad on left */}
                    <path d="M 45 190 C 20 200, 30 230, 65 220 C 70 200, 60 190, 45 190 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="2" />
                    <line x1="45" y1="190" x2="65" y2="220" stroke="#2e7d32" strokeWidth="1.5" />
                </g>
            );
        case 'clothes_qingying':
            return (
                <g>
                    {/* 青萤羽纱裙 - Mint green and lavender gown + translucent insect wings */}
                    {/* Wings behind character */}
                    <g opacity="0.6">
                        {/* Left Wing */}
                        <path d="M 60 220 C -20 120, -50 250, 20 280 Z" fill="#ccff90" stroke="#76ff03" strokeWidth="2" />
                        <path d="M 40 240 C -10 180, -30 280, 20 290 Z" fill="#ccff90" stroke="#76ff03" strokeWidth="1.5" />
                        {/* Right Wing */}
                        <path d="M 240 220 C 320 120, 350 250, 280 280 Z" fill="#ccff90" stroke="#76ff03" strokeWidth="2" />
                        <path d="M 260 240 C 310 180, 330 280, 280 290 Z" fill="#ccff90" stroke="#76ff03" strokeWidth="1.5" />
                    </g>
                    {/* Main Gown */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e8f5e9" stroke="#33691e" strokeWidth="3" />
                    {/* Lavender sash */}
                    <path d="M 100 270 Q 150 290 200 270 L 195 300 Q 150 320 105 300 Z" fill="#e1bee7" stroke="#7b1fa2" strokeWidth="2" />
                    {/* Gold central flower circle */}
                    <circle cx="150" cy="295" r="8" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1.5" />
                    {/* Soft sparkling lace borders */}
                    <path d="M 80 215 Q 150 245 220 215" fill="none" stroke="#b2ff59" strokeWidth="2.5" />
                </g>
            );
        case 'clothes_fenmo':
            return (
                <g>
                    {/* 粉墨登场戏服 - Royal blue opera robe + massive flowing white cuffs */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1e88e5" stroke="#0d47a1" strokeWidth="3" />
                    {/* Gold collar pattern */}
                    <path d="M 120 180 Q 150 210 180 180 Q 150 220 120 180 Z" fill="#ffca28" stroke="#333" strokeWidth="1" />
                    {/* Red embroidery borders */}
                    <path d="M 80 230 Q 150 280 220 230" fill="none" stroke="#e53935" strokeWidth="2.5" />
                    {/* Massive flowing white opera cuffs */}
                    <path d="M 40 250 C 0 300, -40 380, 0 390 C 20 390, 40 320, 50 280" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
                    <path d="M 260 250 C 300 300, 340 380, 300 390 C 280 390, 260 320, 250 280" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
                </g>
            );
        case 'clothes_youyuan':
            return (
                <g>
                    {/* 游园惊梦戏服 - Blossom pink opera dress + white cuffs + floral print */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f8bbd0" stroke="#c2185b" strokeWidth="3" />
                    {/* Floral embroidery on chest */}
                    <circle cx="110" cy="230" r="5" fill="#e91e63" />
                    <circle cx="120" cy="240" r="5" fill="#e91e63" />
                    <circle cx="190" cy="230" r="5" fill="#e91e63" />
                    <circle cx="180" cy="240" r="5" fill="#e91e63" />
                    {/* High green collar ribbons */}
                    <path d="M 135 170 Q 150 190 165 170" stroke="#4caf50" strokeWidth="3.5" fill="none" />
                    {/* Flowing white cuffs */}
                    <path d="M 40 250 C 0 300, -30 360, 5 370 C 20 370, 35 310, 50 280" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
                    <path d="M 260 250 C 300 300, 330 360, 295 370 C 280 370, 265 310, 250 280" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
                </g>
            );
        case 'clothes_zhuguang':
            return (
                <g>
                    {/* 珠光淡黄旗袍 - Yellow cheongsam + white fur wrap + pearl beads */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fff9c4" stroke="#fbc02d" strokeWidth="3" />
                    {/* Pure-white fur stole wrap */}
                    <path d="M 50 210 Q 150 180 250 210 C 280 250, 250 290, 150 290 C 50 290, 20 250, 50 210 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                    {/* Strings of pearls */}
                    <path d="M 100 230 Q 150 280 200 230" fill="none" stroke="#fafafa" strokeWidth="5" strokeDasharray="3,4" strokeLinecap="round" />
                    <path d="M 90 240 Q 150 300 210 240" fill="none" stroke="#fafafa" strokeWidth="5" strokeDasharray="3,4" strokeLinecap="round" />
                </g>
            );
        case 'clothes_fugu':
            return (
                <g>
                    {/* 做旧复古皮衣 - Brown aviator leather jacket + white shirt & tie */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fff" stroke="#3e2723" strokeWidth="3" />
                    {/* Brown leather jacket body */}
                    <path d="M 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#5d4037" stroke="#3e2723" strokeWidth="3" />
                    {/* White collar peeking out */}
                    <polygon points="120,180 150,210 135,230 110,200" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    <polygon points="180,180 150,210 165,230 190,200" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    {/* Sharp dark brown tie */}
                    <polygon points="146,208 154,208 158,260 150,270 142,260" fill="#3e2723" stroke="#333" strokeWidth="1" />
                    {/* Golden pocket zipper */}
                    <line x1="85" y1="260" x2="105" y2="250" stroke="#ffd54f" strokeWidth="2.5" />
                </g>
            );
        case 'clothes_ruqun':
            return (
                <g>
                    {/* 璀璨齐胸襦裙 - Red high-waist skirt + orange bodice + green shoulder scarf */}
                    {/* Translucent green mesh shoulder scarf behind shoulders */}
                    <path d="M 30 220 Q 150 160 270 220 Q 290 280 270 320 Q 150 250 30 320 Z" fill="#a5d6a7" opacity="0.6" />

                    {/* Gown body */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d84315" stroke="#bf360c" strokeWidth="3" />

                    {/* Orange bodice upper chest */}
                    <path d="M 90 210 C 120 190, 180 190, 210 210 L 220 260 C 180 280, 120 280, 80 260 Z" fill="#ffb74d" stroke="#bf360c" strokeWidth="2" />

                    {/* Long green satin ribbons */}
                    <path d="M 135 250 L 125 430" stroke="#2e7d32" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 165 250 L 175 430" stroke="#2e7d32" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="150" cy="250" r="6" fill="#ffd54f" />
                </g>
            );
        case 'clothes_shaonian':
            return (
                <g>
                    {/* 少年郎圆领袍 - Cinnabar red Chinese robe + black overlap panel + gold wave */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d50000" stroke="#212121" strokeWidth="3" />
                    {/* Black overlap panel */}
                    <path d="M 125 180 C 140 180, 210 200, 230 250 C 240 285, 230 350, 220 400" fill="none" stroke="#212121" strokeWidth="15" strokeLinecap="round" />
                    {/* Gold wave on the panel */}
                    <path d="M 125 180 C 140 180, 210 200, 230 250" fill="none" stroke="#ffd54f" strokeWidth="3" />
                    {/* Dark waistbelt */}
                    <path d="M 70 340 L 230 340" stroke="#212121" strokeWidth="10" />
                    <circle cx="150" cy="340" r="7" fill="#ffd54f" />
                </g>
            );
        case 'clothes_tianku':
            return (
                <g>
                    {/* 甜酷毛毛外套 - Sky-blue toggles coat, white fur trim */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#80deea" stroke="#00838f" strokeWidth="3" />
                    {/* White fur trim on hem and cuffs */}
                    <path d="M 40 250 Q 150 200 260 250 Q 275 350 150 430 Q 25 350 40 250 Z" fill="none" stroke="#ffffff" strokeWidth="10" opacity="0.95" strokeLinecap="round" />
                    {/* Fur Collar */}
                    <path d="M 110,170 Q 150,195 190,170 Q 200,210 150,210 Q 100,210 110,170 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                    {/* Dual white toggle ropes */}
                    <line x1="130" y1="240" x2="170" y2="240" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="130" y1="270" x2="170" y2="270" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    <rect x="145" y="235" width="10" height="10" fill="#fff" stroke="#333" rx="2" />
                    <rect x="145" y="265" width="10" height="10" fill="#fff" stroke="#333" rx="2" />
                </g>
            );
        case 'clothes_binglan':
            return (
                <g>
                    {/* 冰蓝格子外套 - Blue plaid down-jacket + yellow inner hoodie */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e1f5fe" stroke="#0277bd" strokeWidth="3" />
                    {/* Plaid grid pattern */}
                    <path d="M 50 200 L 250 200 M 50 250 L 250 250 M 50 300 L 250 300 M 50 350 L 250 350" stroke="#4fc3f7" strokeWidth="1.5" opacity="0.5" />
                    <path d="M 100 170 L 100 430 M 150 170 L 150 430 M 200 170 L 200 430" stroke="#4fc3f7" strokeWidth="1.5" opacity="0.5" />
                    {/* Yellow inner hoodie collar */}
                    <path d="M 115,175 Q 150,205 185,175 Q 190,195 150,215 Q 110,195 115,175 Z" fill="#ffe082" stroke="#ffb300" strokeWidth="1.5" />
                    {/* Fur cuffs */}
                    <rect x="25" y="265" width="20" height="20" fill="#ffffff" stroke="#ccc" rx="3" transform="rotate(-10, 30, 270)" />
                    <rect x="255" y="265" width="20" height="20" fill="#ffffff" stroke="#ccc" rx="3" transform="rotate(10, 260, 270)" />
                </g>
            );
        case 'clothes_sunset':
            return (
                <g>
                    {/* 落日熔金披风 - Royal blue cloak + golden borders + grand white jabot */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="3" />
                    {/* Golden borders */}
                    <path d="M 40 250 C 80 150, 220 150, 260 250" fill="none" stroke="#ffd54f" strokeWidth="6" />
                    {/* Elaborate white layered jabot cravat */}
                    <g transform="translate(150, 175)">
                        {/* Layer 1 (top) */}
                        <path d="M -20 0 Q 0 15 20 0 L 15 25 Q 0 35 -15 25 Z" fill="#ffffff" stroke="#ccc" strokeWidth="1.5" />
                        {/* Layer 2 (middle) */}
                        <path d="M -25 20 Q 0 35 25 20 L 18 50 Q 0 60 -18 50 Z" fill="#fafafa" stroke="#ccc" strokeWidth="1" />
                        {/* Gold central emblem */}
                        <circle cx="0" cy="15" r="4.5" fill="#ffd54f" stroke="#ff8f00" />
                    </g>
                </g>
            );
        case 'clothes_fantasy_cape':
            return (
                <g>
                    {/* 流光幻翼斗篷 - Purple magical gown + lavender glowing feathers */}
                    {/* Glowing wings spread behind shoulders */}
                    <g opacity="0.8">
                        {/* Left wing */}
                        <path d="M 50 200 C -20 160, -30 220, 10 255 Z" fill="#f3e5f5" stroke="#ba68c8" strokeWidth="2.5" />
                        <circle cx="-10" cy="190" r="3" fill="#ea80fc" />
                        {/* Right wing */}
                        <path d="M 250 200 C 320 160, 330 220, 290 255 Z" fill="#f3e5f5" stroke="#ba68c8" strokeWidth="2.5" />
                        <circle cx="310" cy="190" r="3" fill="#ea80fc" />
                    </g>
                    {/* Main cape */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#6a1b9a" stroke="#4a148c" strokeWidth="3" />
                    {/* Gold linings */}
                    <path d="M 90 190 Q 150 220 210 190" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                    {/* Silver stars decorations */}
                    <polygon points="120,240 122,244 127,244 123,247 125,252 120,249 115,252 117,247 113,244 118,244" fill="#ffffff" />
                    <polygon points="180,240 182,244 187,244 183,247 185,252 180,249 175,252 177,247 173,244 178,244" fill="#ffffff" />
                </g>
            );
        case 'clothes_galaxy_suit':
            return (
                <g>
                    {/* 银河摘星太空服 - Chunky white spacesuit + dial gauges + orange collars */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fafafa" stroke="#9e9e9e" strokeWidth="3" />
                    {/* Orange collar rim */}
                    <rect x="110" y="165" width="80" height="15" fill="#ff7043" stroke="#e64a19" strokeWidth="2" rx="4" />
                    {/* Circular dial gauge on chest */}
                    <circle cx="150" cy="240" r="18" fill="#e0e0e0" stroke="#333" strokeWidth="2" />
                    <circle cx="150" cy="240" r="14" fill="#ffffff" />
                    {/* Gauge needle (red) */}
                    <line x1="150" y1="240" x2="160" y2="230" stroke="#d50000" strokeWidth="2.5" />
                    {/* Little colored lights (red/blue buttons) */}
                    <circle cx="120" cy="235" r="4.5" fill="#d50000" />
                    <circle cx="120" cy="250" r="4.5" fill="#1976d2" />
                    {/* Orange sleeve bands */}
                    <path d="M 30 260 Q 40 270 50 255" fill="none" stroke="#ff7043" strokeWidth="4" />
                    <path d="M 270 260 Q 260 270 250 255" fill="none" stroke="#ff7043" strokeWidth="4" />
                </g>
            );
        case 'clothes_jiutian_suit':
            return (
                <g>
                    {/* 九天揽月太空服 - Sleek spacesuit + glowing chest plate circle */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#eceff1" stroke="#546e7a" strokeWidth="3" />
                    {/* White helmet base rim */}
                    <rect x="110" y="165" width="80" height="15" fill="#cfd8dc" stroke="#546e7a" strokeWidth="2" rx="4" />
                    {/* Glowing turquoise holographic chest circular lens */}
                    <circle cx="150" cy="245" r="22" fill="#00e5ff" opacity="0.3" />
                    <circle cx="150" cy="245" r="16" fill="#00e5ff" stroke="#00b0ff" strokeWidth="2.5" />
                    <ellipse cx="145" cy="240" rx="4" ry="2" fill="#ffffff" />
                    {/* Technical grids on suit shoulders */}
                    <line x1="65" y1="210" x2="80" y2="230" stroke="#78909c" strokeWidth="2" />
                    <line x1="235" y1="210" x2="220" y2="230" stroke="#78909c" strokeWidth="2" />
                </g>
            );
        case 'clothes_xmas_warm':
            return (
                <g>
                    {/* 暖意圣诞氛围装 - White shirt, red vest, green plaid tie, green wool scarf */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#333" strokeWidth="3" />
                    {/* Red pinstripe sweater vest */}
                    <path d="M 75 220 C 110 180, 190 180, 225 220 L 220 380 L 80 380 Z" fill="#d50000" stroke="#b71c1c" strokeWidth="2" />
                    <path d="M 110 180 L 150 240 L 190 180 Z" fill="#ffffff" />
                    {/* Green Plaid Tie */}
                    <polygon points="146,200 154,200 157,250 150,260 143,250" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1" />
                    {/* Thick green wool scarf draped around neck */}
                    <path d="M 95,170 Q 150,200 205,170 C 220,210, 190,230, 150,230 C 110,230, 80,210, 95,170 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="2" />
                    <path d="M 95 190 L 85 285" stroke="#388e3c" strokeWidth="10" strokeLinecap="round" />
                    <line x1="82" y1="285" x2="88" y2="285" stroke="#fff" strokeWidth="2" />
                </g>
            );
        case 'clothes_xmas_capelet':
            return (
                <g>
                    {/* 毛绒甜美小披肩 - Red holiday capelet, fur borders, white hanging pom-poms */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#c62828" stroke="#880e4f" strokeWidth="3" />
                    {/* Green and white holiday pinstripe border */}
                    <path d="M 40 250 Q 150 200 260 250 Q 275 350 150 420 Q 25 350 40 250 Z" fill="none" stroke="#2e7d32" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 40 250 Q 150 200 260 250 Q 275 350 150 420 Q 25 350 40 250 Z" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,10" />
                    {/* Fur Collar */}
                    <path d="M 115 170 Q 150 200 185 170 Q 195 205 150 210 Q 105 205 115 170 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                    {/* White pom-poms hanging */}
                    <line x1="140" y1="205" x2="135" y2="245" stroke="#ffffff" strokeWidth="3" />
                    <line x1="160" y1="205" x2="165" y2="245" stroke="#ffffff" strokeWidth="3" />
                    <circle cx="135" cy="245" r="8" fill="#ffffff" stroke="#ccc" />
                    <circle cx="165" cy="245" r="8" fill="#ffffff" stroke="#ccc" />
                </g>
            );
        case 'clothes_miao':
            return (
                <g>
                    {/* 流光溢彩苗服 - Royal blue ethnic tunic + massive silver chest necklaces */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1a237e" stroke="#333" strokeWidth="3" />
                    {/* Red & green ethnic collars */}
                    <path d="M 110 170 Q 150 200 190 170" fill="none" stroke="#e53935" strokeWidth="5" />
                    <path d="M 105 175 Q 150 205 195 175" fill="none" stroke="#00e676" strokeWidth="3" />
                    {/* Massive complex silver chest armor plates/necklaces */}
                    <path d="M 90 205 Q 150 270 210 205" fill="none" stroke="#cfd8dc" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 90 205 Q 150 270 210 205" fill="none" stroke="#eceff1" strokeWidth="6" strokeDasharray="3,3" />
                    {/* Inner shield pendant */}
                    <path d="M 125 240 Q 150 280 175 240 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="1.5" />
                    {/* Dangling little circles */}
                    <circle cx="115" cy="255" r="3.5" fill="#cfd8dc" />
                    <circle cx="135" cy="275" r="3.5" fill="#cfd8dc" />
                    <circle cx="150" cy="280" r="4.5" fill="#ffffff" stroke="#90a4ae" />
                    <circle cx="165" cy="275" r="3.5" fill="#cfd8dc" />
                    <circle cx="185" cy="255" r="3.5" fill="#cfd8dc" />
                </g>
            );
        case 'clothes_tibet':
            return (
                <g>
                    {/* 草原部落藏袍 - Ivory brocade robe worn off-shoulder (asymmetric) */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fff9c4" stroke="#5d4037" strokeWidth="3" />
                    {/* Asymmetric shoulder fold (Left shoulder off) */}
                    <path d="M 40 250 C 80 180, 120 220, 150 280 C 180 340, 220 380, 220 400" fill="none" stroke="#1565c0" strokeWidth="12" strokeLinecap="round" />
                    {/* Exposed left arm undershirt */}
                    <path d="M 40 250 C 60 210, 100 220, 110 250" fill="#fff" stroke="#ffb300" strokeWidth="2" />
                    {/* Heavy bead collar (turquoise/coral red) */}
                    <path d="M 105 210 Q 150 255 195 210" fill="none" stroke="#26a69a" strokeWidth="6" strokeDasharray="6,8" strokeLinecap="round" />
                    <path d="M 110 220 Q 150 265 190 220" fill="none" stroke="#e53935" strokeWidth="5" strokeDasharray="5,6" strokeLinecap="round" />
                </g>
            );
        case 'clothes_linxia':
            return (
                <g>
                    {/* 林下之风旗袍裙 - Jade green modern cheongsam + keyhole opening */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="3" />
                    {/* Cheongsam stand collar */}
                    <rect x="135" y="160" width="30" height="20" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="2" />
                    <line x1="135" y1="170" x2="165" y2="170" stroke="#2e7d32" strokeWidth="2" />
                    {/* Delicate gold frog on collar */}
                    <circle cx="150" cy="170" r="3.5" fill="#ffd54f" />
                    {/* Keyhole chest chest opening */}
                    <ellipse cx="150" cy="205" rx="8" ry="12" fill="#ffe0cc" stroke="#2e7d32" strokeWidth="2" />
                </g>
            );
        case 'clothes_qingyun_shirt':
            return (
                <g>
                    {/* 独步青云盘扣衫 - Mint modernized Tang shirt + little shoulder panda */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#b2dfdb" stroke="#004d40" strokeWidth="3" />
                    {/* White frog button loops down center */}
                    <line x1="135" y1="210" x2="165" y2="210" stroke="#ffffff" strokeWidth="3" />
                    <line x1="135" y1="240" x2="165" y2="240" stroke="#ffffff" strokeWidth="3" />
                    <circle cx="150" cy="210" r="4" fill="#ffffff" />
                    <circle cx="150" cy="240" r="4" fill="#ffffff" />
                    {/* Cute little 3D climbing panda on left shoulder */}
                    <g transform="translate(60, 175)">
                        {/* Panda body */}
                        <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                        {/* Panda ears */}
                        <circle cx="-12" cy="-12" r="6" fill="#212121" />
                        <circle cx="12" cy="-12" r="6" fill="#212121" />
                        {/* Panda black arms hugging */}
                        <path d="M -12 8 Q 0 16 12 8" stroke="#212121" strokeWidth="6" strokeLinecap="round" fill="none" />
                        {/* Panda eyes */}
                        <circle cx="-5" cy="-2" r="3" fill="#212121" />
                        <circle cx="5" cy="-2" r="3" fill="#212121" />
                        <circle cx="-4" cy="-3" r="1" fill="#fff" />
                        <circle cx="6" cy="-3" r="1" fill="#fff" />
                    </g>
                </g>
            );
        case 'clothes_scholar_tie':
            return (
                <g>
                    {/* 斩家学士服-领带款 - Black graduation gown + blue satin collar + red tie */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#212121" stroke="#333" strokeWidth="3" />
                    {/* Blue satin collar sash */}
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#1976d2" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#64b5f6" strokeWidth="4" strokeLinecap="round" />
                    {/* White shirt collar */}
                    <polygon points="125,180 150,205 135,225 115,195" fill="#ffffff" stroke="#333" />
                    <polygon points="175,180 150,205 165,225 185,195" fill="#ffffff" stroke="#333" />
                    {/* Red tie */}
                    <polygon points="146,204 154,204 157,250 150,258 143,250" fill="#d50000" stroke="#333" strokeWidth="1" />
                    {/* Zhan crest on left chest */}
                    <circle cx="215" cy="250" r="7.5" fill="#1976d2" stroke="#fff" strokeWidth="1.5" />
                    <text x="215" y="254" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="black">斩</text>
                </g>
            );
        case 'clothes_scholar_bowtie':
            return (
                <g>
                    {/* 斩家学士服-领结款 - Black graduation gown + pink lace collar + red bowtie */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#212121" stroke="#333" strokeWidth="3" />
                    {/* Pink floral collar sash */}
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#f48fb1" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#fce4ec" strokeWidth="4" strokeLinecap="round" strokeDasharray="3,4" />
                    {/* White shirt collar */}
                    <polygon points="125,180 150,205 135,225 115,195" fill="#ffffff" stroke="#333" />
                    <polygon points="175,180 150,205 165,225 185,195" fill="#ffffff" stroke="#333" />
                    {/* Red bowtie */}
                    <g transform="translate(150, 205)">
                        <circle cx="0" cy="0" r="4.5" fill="#d50000" stroke="#333" strokeWidth="1" />
                        <path d="M -4.5 0 C -15 -10, -15 10, -4.5 0 Z" fill="#d50000" stroke="#333" strokeWidth="1" />
                        <path d="M 4.5 0 C 15 -10, 15 10, 4.5 0 Z" fill="#d50000" stroke="#333" strokeWidth="1" />
                    </g>
                    {/* Zhan crest on left chest */}
                    <circle cx="215" cy="250" r="7.5" fill="#1976d2" stroke="#fff" strokeWidth="1.5" />
                    <text x="215" y="254" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="black">斩</text>
                </g>
            );

        // ====================================================================
        // Clothes Part 3 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // ====================================================================
        case 'clothes_qingzhu':
            return (
                <g>
                    {/* 宋制青竹澜衫 - White traditional Song Dynasty scholar robe + green painted bamboo print */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fafafa" stroke="#cfd8dc" strokeWidth="3" />
                    <path d="M 100 170 L 150 250 L 200 170" fill="none" stroke="#e0f2f1" strokeWidth="6" strokeLinecap="round" />
                    {/* Green painted bamboo prints */}
                    <path d="M 90 270 C 95 240, 75 220, 85 200" fill="none" stroke="#00796b" strokeWidth="2.5" />
                    <path d="M 85 200 L 70 190 Q 80 195 90 200 L 105 195 C 95 205, 90 215, 88 225" fill="#00796b" />
                    <path d="M 210 280 C 205 250, 220 230, 215 210" fill="none" stroke="#00796b" strokeWidth="2.5" />
                    <path d="M 215 210 L 230 200 Q 220 205 210 210 L 195 205 C 205 215, 210 225, 212 235" fill="#00796b" />
                    {/* Sage collar tie */}
                    <circle cx="150" cy="225" r="4.5" fill="#80cbc4" stroke="#004d40" strokeWidth="1" />
                    <path d="M 150 229 L 150 249" stroke="#004d40" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'clothes_duijin':
            return (
                <g>
                    {/* 宋制对襟短衫 - Sage green outer crop-robe + floral borders + beige inner top + brown ribbon */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#efebe9" stroke="#d7ccc8" strokeWidth="3" />
                    {/* Sage green crop sleeves */}
                    <path d="M 60 220 L 40 250 C 0 350, 50 450, 100 450 L 100 240 Z" fill="#e8f5e9" stroke="#c8e6c9" strokeWidth="2" />
                    <path d="M 240 220 L 260 250 C 300 350, 250 450, 200 450 L 200 240 Z" fill="#e8f5e9" stroke="#c8e6c9" strokeWidth="2" />
                    {/* Embroidered vertical collar borders */}
                    <rect x="98" y="170" width="10" height="280" fill="#a5d6a7" stroke="#333" strokeWidth="1" />
                    <rect x="192" y="170" width="10" height="280" fill="#a5d6a7" stroke="#333" strokeWidth="1" />
                    {/* Pink embroidered flowers */}
                    <circle cx="103" cy="230" r="3" fill="#ff8a80" />
                    <circle cx="197" cy="230" r="3" fill="#ff8a80" />
                    <circle cx="103" cy="290" r="3" fill="#ff8a80" />
                    <circle cx="197" cy="290" r="3" fill="#ff8a80" />
                    {/* Brown ribbon lace tie */}
                    <circle cx="150" cy="220" r="5" fill="#a1887f" stroke="#3e2723" strokeWidth="1" />
                    <path d="M 148 225 C 135 240, 140 270, 138 290" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 152 225 C 165 240, 160 270, 162 290" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'clothes_qinchun_polo':
            return (
                <g>
                    {/* 青春球场衫 - Lime/yellow retro polo shirt + checkered bottom + SPORT print + watch */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d4e157" stroke="#9e9d24" strokeWidth="3" />
                    {/* Checkered print at bottom */}
                    <path d="M 50 360 L 250 360 C 230 410, 180 450, 150 450 C 120 450, 70 410, 50 360 Z" fill="#f4ff81" stroke="#9e9d24" strokeWidth="1" />
                    <path d="M 80 360 L 110 440 M 120 360 L 150 450 M 160 360 L 180 445 M 200 360 L 220 420" stroke="#afb42b" strokeWidth="2" />
                    {/* SPORT Text */}
                    <text x="150" y="300" fontSize="24" fill="#ffffff" fontWeight="black" textAnchor="middle" letterSpacing="2" stroke="#333" strokeWidth="1">SPORT</text>
                    {/* White polo collar */}
                    <polygon points="120,180 150,215 135,235 110,200" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    <polygon points="180,180 150,215 165,235 190,200" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    {/* Sports watch on right arm */}
                    <rect x="50" y="310" width="12" height="24" fill="#37474f" stroke="#000" rx="3" />
                    <rect x="47" y="316" width="18" height="12" fill="#00e5ff" stroke="#37474f" strokeWidth="1.5" />
                </g>
            );
        case 'clothes_xiejian_sport':
            return (
                <g>
                    {/* 斜肩运动装 - Lavender off-shoulder top + Olympic print + white arm bandage + pink wrist wrap */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="3" />
                    {/* Asymmetrical off shoulder strap */}
                    <path d="M 60 200 L 110 180 L 130 220 L 70 240 Z" fill="#d1c4e9" stroke="#5e35b1" strokeWidth="1.5" />
                    {/* Right side is off-shoulder (flesh layer) */}
                    <path d="M 170 170 L 220 190 L 235 240 L 160 220 Z" fill="#ffe0b2" stroke="#ffe0b2" />
                    <path d="M 170 170 L 220 190" stroke="#5e35b1" strokeWidth="2.5" />
                    {/* Olympic logo/text */}
                    <text x="150" y="310" fontSize="16" fill="#ffffff" fontWeight="black" textAnchor="middle" fontStyle="italic" stroke="#333" strokeWidth="1">Olympic</text>
                    {/* White arm bandage */}
                    <path d="M 60 270 Q 75 275 90 270 L 85 295 Q 70 298 55 293 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1" />
                    <line x1="58" y1="280" x2="88" y2="285" stroke="#b0bec5" strokeWidth="1" />
                    {/* Pink wrist wrap on left arm */}
                    <rect x="220" y="300" width="22" height="15" fill="#ff4081" stroke="#c2185b" rx="2" />
                </g>
            );
        case 'clothes_strawberry_t':
            return (
                <g>
                    {/* 莓油烦恼T恤 - Sky blue crop shirt + blueberry prints + blue cuffs */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e3f2fd" stroke="#1565c0" strokeWidth="3" />
                    {/* Blue cuffs */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#2196f3" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 250 250 L 265 270 Q 275 320 250 350" fill="none" stroke="#2196f3" strokeWidth="8" strokeLinecap="round" />
                    {/* Blueberry character in center */}
                    <circle cx="150" cy="290" r="25" fill="#1e88e5" stroke="#333" strokeWidth="2" />
                    {/* Blueberry eyes & smile */}
                    <circle cx="140" cy="285" r="3.5" fill="#333" />
                    <circle cx="160" cy="285" r="3.5" fill="#333" />
                    <path d="M 144 296 Q 150 305 156 296" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Blueberry green crown leaves */}
                    <path d="M 150 265 L 140 255 L 150 260 L 160 255 Z" fill="#4caf50" stroke="#333" strokeWidth="1.5" />
                    {textx("blueberry", 150, 340, 11)}
                </g>
            );
        case 'clothes_peach_t':
            return (
                <g>
                    {/* 桃气满满T恤 - Baby pink crop T-shirt + peach design + peach cuffs */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fce4ec" stroke="#c2185b" strokeWidth="3" />
                    {/* Pink cuffs */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#ff80ab" strokeWidth="8" strokeLinecap="round" />
                    {/* Peach character in center */}
                    <path d="M 150 315 C 130 315, 120 295, 125 275 C 130 255, 150 255, 150 265 C 150 255, 170 255, 175 275 C 180 295, 170 315, 150 315 Z" fill="#ff80ab" stroke="#333" strokeWidth="2" />
                    {/* Peach green leaf */}
                    <path d="M 150 260 Q 160 245 155 240 Q 148 245 150 260 Z" fill="#81c784" stroke="#333" strokeWidth="1" />
                    {/* Peach face */}
                    <circle cx="142" cy="285" r="3" fill="#333" />
                    <circle cx="158" cy="285" r="3" fill="#333" />
                    <path d="M 146 295 Q 150 300 154 295" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    {textx("peach", 150, 340, 12)}
                </g>
            );
        case 'clothes_watermelon_t':
            return (
                <g>
                    {/* 瓜目相看T恤 - Soft coral T-shirt + watermelon wedge character */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fbe9e7" stroke="#d84315" strokeWidth="3" />
                    {/* Watermelon character */}
                    <g transform="translate(150, 290)">
                        <path d="M -30 -10 C -30 20, 30 20, 30 -10 Z" fill="#ff7043" stroke="#333" strokeWidth="2" />
                        <path d="M -30 -10 C -30 25, 30 25, 30 -10 C 30 -5, -30 -5, -30 -10" fill="#4caf50" stroke="#333" strokeWidth="2" />
                        {/* Eyes */}
                        <circle cx="-10" cy="2" r="3" fill="#333" />
                        <circle cx="10" cy="2" r="3" fill="#333" />
                        <path d="M -3 7 Q 0 11 3 7" fill="none" stroke="#333" strokeWidth="1.5" />
                    </g>
                    {textx("watermelon", 150, 340, 11)}
                </g>
            );
        case 'clothes_avocado_t':
            return (
                <g>
                    {/* 牛转乾坤T恤 - Pastel lime green T-shirt + smiley avocado character */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f1f8e9" stroke="#558b2f" strokeWidth="3" />
                    {/* Avocado outer shape */}
                    <path d="M 150 310 C 130 310, 125 290, 130 270 C 135 250, 140 240, 150 240 C 160 240, 165 250, 170 270 C 175 290, 170 310, 150 310 Z" fill="#8bc34a" stroke="#333" strokeWidth="2" />
                    {/* Avocado inner core */}
                    <path d="M 150 300 C 135 300, 132 285, 137 275 C 142 265, 145 255, 150 255 C 155 255, 158 265, 163 275 C 168 285, 165 300, 150 300 Z" fill="#d4e157" />
                    {/* Brown core seed */}
                    <circle cx="150" cy="285" r="10" fill="#795548" stroke="#333" strokeWidth="1.5" />
                    {textx("avocado", 150, 340, 12)}
                </g>
            );
        case 'clothes_yinhe_knight':
            return (
                <g>
                    {/* 银河骑士装 - Starry midnight blue uniform + silver metallic shoulder plate */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#0d47a1" stroke="#0a2540" strokeWidth="3" />
                    {/* Starry skies glitter prints */}
                    <circle cx="90" cy="220" r="2" fill="#fff" opacity="0.8" />
                    <circle cx="190" cy="240" r="1.5" fill="#fff" opacity="0.6" />
                    <polygon points="120,280 123,283 120,286 117,283" fill="#ffd700" />
                    {/* Silver shoulder armor plate on left shoulder */}
                    <path d="M 40 250 C 45 200, 100 190, 110 210 L 80 260 Z" fill="#cfd8dc" stroke="#455a64" strokeWidth="2.5" />
                    <path d="M 50 240 L 70 215" stroke="#90a4ae" strokeWidth="2" />
                    <path d="M 60 250 L 80 225" stroke="#90a4ae" strokeWidth="2" />
                    {/* Knight sash belt */}
                    <path d="M 100 170 L 150 230" stroke="#ffd700" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 100 170 L 150 230" stroke="#ff8f00" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'clothes_cuican_galaxy':
            return (
                <g>
                    {/* 璀璨星河裙 - Deep navy off-shoulder gown + glowing constellation lines */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1a237e" stroke="#000" strokeWidth="3" />
                    {/* Off-shoulder neck trim */}
                    <path d="M 90 190 Q 150 230 210 190" fill="none" stroke="#3949ab" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 90 190 Q 150 230 210 190" fill="none" stroke="#fff59d" strokeWidth="2" strokeDasharray="3,4" />
                    {/* Constellation lines */}
                    <path d="M 110 260 L 130 300 L 170 280 L 190 320" fill="none" stroke="#ffeb3b" strokeWidth="1.5" strokeDasharray="2,2" />
                    <circle cx="110" cy="260" r="3.5" fill="#ffeb3b" />
                    <circle cx="130" cy="300" r="3.5" fill="#ffeb3b" />
                    <circle cx="170" cy="280" r="3.5" fill="#ffeb3b" />
                    <circle cx="190" cy="320" r="3.5" fill="#ffeb3b" />
                    {/* Flared bell sleeve folds */}
                    <path d="M 50 290 Q 30 350 45 420" fill="none" stroke="#283593" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 250 290 Q 270 350 255 420" fill="none" stroke="#283593" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'clothes_feiyufu':
            return (
                <g>
                    {/* 山莲云阁飞鱼服 - Navy Ming Dynasty Fenyu/Flying Fish robe + gold woven prints */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#0d1b2a" stroke="#1b263b" strokeWidth="3" />
                    {/* High traditional fold-over collar */}
                    <path d="M 115 170 L 150 235 L 185 170" fill="none" stroke="#e0e1dd" strokeWidth="6" />
                    {/* Gold flying fish wave embroideries */}
                    <path d="M 80 250 C 100 280, 120 280, 150 260 C 180 280, 200 280, 220 250" fill="none" stroke="#e5a93b" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 100 320 Q 150 355 200 320" fill="none" stroke="#e5a93b" strokeWidth="3" />
                    <path d="M 70 300 Q 150 340 230 300" fill="none" stroke="#ffd166" strokeWidth="1.5" />
                    {/* Golden sash belt */}
                    <rect x="72" y="360" width="156" height="15" fill="#d4af37" stroke="#333" strokeWidth="1.5" />
                    <circle cx="150" cy="367.5" r="5" fill="#b1a7a6" stroke="#333" />
                </g>
            );
        case 'clothes_yunjian_hanfu':
            return (
                <g>
                    {/* 斜襟云肩改良汉服 - Pure white Hanfu dress + beautiful royal blue cloud collar drape */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#eceff1" strokeWidth="3" />
                    {/* Royal blue cloud collar draped piece */}
                    <path d="M 110 170 C 105 200, 70 200, 60 230 C 50 260, 100 280, 150 280 C 200 280, 250 260, 240 230 C 230 200, 195 200, 190 170 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="2.5" />
                    <path d="M 110 170 C 105 200, 70 200, 60 230 C 50 260, 100 280, 150 280 C 200 280, 250 260, 240 230 C 230 200, 195 200, 190 170 Z" fill="none" stroke="#90caf9" strokeWidth="1.5" strokeDasharray="3,3" />
                    {/* Gold pendant hanging in middle of cloud collar */}
                    <circle cx="150" cy="275" r="4.5" fill="#ffd700" stroke="#333" />
                    <line x1="150" y1="279" x2="150" y2="295" stroke="#ffd700" strokeWidth="2" />
                </g>
            );
        case 'clothes_cuilin_hunter':
            return (
                <g>
                    {/* 翠林猎手装 - Earth green vest + leather belts + ammo casings */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e0f2f1" stroke="#b2dfdb" strokeWidth="3" />
                    {/* Green hunter vest */}
                    <path d="M 100 170 L 150 280 L 200 170 C 250 250, 240 380, 200 450 L 100 450 C 60 380, 50 250, 100 170 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="2.5" />
                    {/* Crossed brown leather bullet belts */}
                    <path d="M 90 200 L 210 380" stroke="#795548" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 210 200 L 90 380" stroke="#5d4037" strokeWidth="10" strokeLinecap="round" />
                    {/* Yellow ammo casings */}
                    <circle cx="130" cy="260" r="3.5" fill="#ffeb3b" stroke="#333" />
                    <circle cx="145" cy="282.5" r="3.5" fill="#ffeb3b" stroke="#333" />
                    <circle cx="160" cy="305" r="3.5" fill="#ffeb3b" stroke="#333" />
                </g>
            );
        case 'clothes_lvying_forest':
            return (
                <g>
                    {/* 绿影森意裙 - Olive green puff-sleeve dress + gold front laces + flowers */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#558b2f" stroke="#33691e" strokeWidth="3" />
                    {/* Ruffled light green sleeves */}
                    <circle cx="50" cy="230" r="16" fill="#a5d6a7" stroke="#33691e" strokeWidth="1.5" />
                    <circle cx="250" cy="230" r="16" fill="#a5d6a7" stroke="#33691e" strokeWidth="1.5" />
                    {/* Cream chest plate */}
                    <polygon points="120,180 180,180 165,290 135,290" fill="#fafafa" stroke="#33691e" strokeWidth="2" />
                    {/* Golden corset criss-cross laces */}
                    <path d="M 130 200 L 170 220 M 130 220 L 170 200 M 132 235 L 168 255 M 132 255 L 168 235 M 135 270 L 165 290 M 135 290 L 165 270" stroke="#fbc02d" strokeWidth="2" />
                    {/* Flower bracelets on wrist */}
                    <circle cx="65" cy="320" r="4.5" fill="#e8f5e9" stroke="#81c784" />
                    <circle cx="235" cy="320" r="4.5" fill="#e8f5e9" stroke="#81c784" />
                </g>
            );
        case 'clothes_wuhou_sweet':
            return (
                <g>
                    {/* 午后甜心裙 - Ruffled white off-shoulder top + yellow gingham checkered corset bodice */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fffde7" stroke="#fbc02d" strokeWidth="3" />
                    {/* White ruffled sleeves */}
                    <circle cx="50" cy="230" r="18" fill="#ffffff" stroke="#cfd8dc" strokeWidth="2" />
                    <circle cx="250" cy="230" r="18" fill="#ffffff" stroke="#cfd8dc" strokeWidth="2" />
                    {/* Yellow/white checkers on corset */}
                    <path d="M 100 240 C 100 240, 80 340, 100 450 L 200 450 C 220 340, 200 240, 200 240 Z" fill="#fff59d" stroke="#fbc02d" strokeWidth="2" />
                    <path d="M 120 240 L 120 450 M 140 240 L 140 450 M 160 240 L 160 450 M 180 240 L 180 450" stroke="#ffffff" strokeWidth="4" />
                    {/* Sweet shoulder bows */}
                    <circle cx="90" cy="180" r="6" fill="#fbc02d" />
                    <circle cx="210" cy="180" r="6" fill="#fbc02d" />
                </g>
            );
        case 'clothes_xiari_polo':
            return (
                <g>
                    {/* 夏日轻韵衫 - Cream tropical polo + pink/orange flowers + neck headphones */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fff8e1" stroke="#ffb300" strokeWidth="3" />
                    {/* Pink/orange flower prints */}
                    <circle cx="85" cy="240" r="8" fill="#ff8a80" />
                    <circle cx="85" cy="240" r="3" fill="#fff" />
                    <circle cx="205" cy="280" r="10" fill="#ffb74d" />
                    <circle cx="205" cy="280" r="3.5" fill="#fff" />
                    {/* White utility headphones around the neck */}
                    <path d="M 105 180 Q 150 220 195 180" fill="none" stroke="#eceff1" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 105 180 Q 150 220 195 180" fill="none" stroke="#b0bec5" strokeWidth="4" strokeLinecap="round" />
                    {/* Headphone ear pads */}
                    <rect x="90" y="160" width="18" height="26" fill="#cfd8dc" stroke="#78909c" rx="4" />
                    <rect x="192" y="160" width="18" height="26" fill="#cfd8dc" stroke="#78909c" rx="4" />
                </g>
            );
        case 'clothes_huazhi_skirt':
            return (
                <g>
                    {/* 花织背裙 - White blouse + red flower prints + dark denim suspender skirt overalls */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="3" />
                    {/* Red flower prints on white sleeves */}
                    <circle cx="65" cy="240" r="5" fill="#d50000" />
                    <circle cx="235" cy="240" r="5" fill="#d50000" />
                    {/* Denim overalls suspender dress */}
                    <path d="M 90 280 L 210 280 L 220 450 L 80 450 Z" fill="#1a237e" stroke="#0d47a1" strokeWidth="2.5" />
                    {/* Red shoulder suspender straps */}
                    <path d="M 100 170 L 100 280 M 200 170 L 200 280" stroke="#ff1744" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="100" cy="280" r="3.5" fill="#ffd700" />
                    <circle cx="200" cy="280" r="3.5" fill="#ffd700" />
                </g>
            );
        case 'clothes_sunset_field':
            return (
                <g>
                    {/* 日落田野装 - Light blue striped shirt + neck utility towel + gray inner shirt */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="3" />
                    {/* Blue striped outer shirt */}
                    <path d="M 80 200 L 60 450 L 100 450 L 120 220 Z" fill="#bbdefb" stroke="#1565c0" strokeWidth="2" />
                    <path d="M 220 200 L 240 450 L 200 450 L 180 220 Z" fill="#bbdefb" stroke="#1565c0" strokeWidth="2" />
                    {/* Stripes */}
                    <line x1="90" y1="210" x2="70" y2="450" stroke="#1e88e5" strokeWidth="2" />
                    <line x1="210" y1="210" x2="230" y2="450" stroke="#1e88e5" strokeWidth="2" />
                    {/* White towel wrapped around neck */}
                    <path d="M 110 170 Q 150 205 190 170" fill="none" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 110 170 L 100 300" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 190 170 L 200 290" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 100 300 L 100 305 M 200 290 L 200 295" stroke="#cfd8dc" strokeWidth="1" />
                </g>
            );
        case 'clothes_qinglan_qipao':
            return (
                <g>
                    {/* 青蓝旗袍 - Elegant white qipao + porcelain blue floral print + high mandarin collar */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fafafa" stroke="#1e88e5" strokeWidth="3" />
                    {/* Mandarin high collar */}
                    <path d="M 120 180 Q 150 205 180 180 L 180 170 Q 150 195 120 170 Z" fill="#e3f2fd" stroke="#1e88e5" strokeWidth="2" />
                    {/* Classic blue painted floral patterns (瓷器 style) */}
                    <path d="M 120 220 C 130 250, 140 250, 150 230 C 160 250, 170 250, 180 220" fill="none" stroke="#1565c0" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 100 290 Q 150 330 200 290" fill="none" stroke="#1565c0" strokeWidth="3" />
                    {/* Gold loop frog button on chest */}
                    <circle cx="165" cy="205" r="3.5" fill="#fbc02d" stroke="#333" />
                </g>
            );
        case 'clothes_lengbai_robe':
            return (
                <g>
                    {/* 冷白长衫 - Minimalist white traditional scholar robe + traditional black double-loop frogs */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fcfcfc" stroke="#bdbdbd" strokeWidth="3" />
                    <path d="M 115 170 L 150 230 L 185 170" fill="none" stroke="#eeeeee" strokeWidth="4" />
                    {/* Traditional black loop frogs */}
                    <g transform="translate(150, 225)">
                        <circle cx="0" cy="0" r="3" fill="#212121" />
                        <path d="M -15 0 L 15 0" stroke="#212121" strokeWidth="2" />
                    </g>
                    <g transform="translate(150, 265)">
                        <circle cx="0" cy="0" r="3" fill="#212121" />
                        <path d="M -15 0 L 15 0" stroke="#212121" strokeWidth="2" />
                    </g>
                    <g transform="translate(150, 305)">
                        <circle cx="0" cy="0" r="3" fill="#212121" />
                        <path d="M -15 0 L 15 0" stroke="#212121" strokeWidth="2" />
                    </g>
                </g>
            );

        // ====================================================================
        // Clothes Part 4 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // ====================================================================
        case 'clothes_xinnian_girl':
            return (
                <g>
                    {/* 新年女娃套装 - Red winter vest + yellow long sleeves + white fluffy fur collars */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fbc02d" stroke="#f57f17" strokeWidth="3" />
                    {/* Red winter vest */}
                    <path d="M 95 180 C 70 250, 75 380, 100 450 L 200 450 C 225 380, 230 250, 205 180 Z" fill="#d50000" stroke="#333" strokeWidth="2" />
                    {/* White fluffy fur collars */}
                    <path d="M 100 170 Q 150 200 200 170 L 210 185 Q 150 220 90 185 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
                    <circle cx="150" cy="200" r="10" fill="#ffffff" stroke="#e0e0e0" />
                    {/* Golden Chinese 福 character on chest */}
                    <text x="150" y="270" fontSize="26" fill="#fbc02d" fontWeight="black" textAnchor="middle" stroke="#333" strokeWidth="1">福</text>
                </g>
            );
        case 'clothes_xinnian_boy':
            return (
                <g>
                    {/* 新年男娃套装 - Red winter vest + white sleeves with blue trim + gold dragon prints */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="3" />
                    {/* Blue cuffs */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#00e5ff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 250 250 L 265 270 Q 275 320 250 350" fill="none" stroke="#00e5ff" strokeWidth="8" strokeLinecap="round" />
                    {/* Red vest */}
                    <path d="M 95 180 C 70 250, 75 380, 100 450 L 200 450 C 225 380, 230 250, 205 180 Z" fill="#d50000" stroke="#333" strokeWidth="2" />
                    {/* White fluffy fur collars */}
                    <path d="M 100 170 Q 150 200 200 170 L 210 185 Q 150 220 90 185 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
                    {/* Golden dragon lines */}
                    <path d="M 150 240 C 130 260, 170 280, 150 310" fill="none" stroke="#fbc02d" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="150" cy="240" r="3" fill="#fbc02d" />
                </g>
            );
        case 'clothes_lvye_cape':
            return (
                <g>
                    {/* 绿野仙踪披风 - Sage green coat + pleated neck collar + glowing blue fairy wings */}
                    {/* Fairy wings behind shoulders */}
                    <g transform="translate(150, 220)" opacity="0.75">
                        <ellipse cx="-70" cy="-20" rx="40" ry="20" fill="#e0f7fa" stroke="#00e5ff" strokeWidth="2" transform="rotate(-30 -70 -20)" />
                        <ellipse cx="70" cy="-20" rx="40" ry="20" fill="#e0f7fa" stroke="#00e5ff" strokeWidth="2" transform="rotate(30 70 -20)" />
                    </g>
                    {/* Green coat */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="3" />
                    {/* Pleated high neck collar */}
                    <path d="M 100 170 L 150 230 L 200 170" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 100 170 L 150 230 L 200 170" fill="none" stroke="#81c784" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'clothes_tonghua_dress':
            return (
                <g>
                    {/* 童话书精灵裙 - Lime green puffy gown + glowing yellow wings */}
                    {/* Yellow insect wings behind shoulders */}
                    <g transform="translate(150, 220)" opacity="0.8">
                        <ellipse cx="-70" cy="-20" rx="45" ry="18" fill="#fffde7" stroke="#ffd700" strokeWidth="1.5" transform="rotate(-35 -70 -20)" />
                        <ellipse cx="70" cy="-20" rx="45" ry="18" fill="#fffde7" stroke="#ffd700" strokeWidth="1.5" transform="rotate(35 70 -20)" />
                    </g>
                    {/* Gown */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d4e157" stroke="#827717" strokeWidth="3" />
                    {/* White ruffle trim collar */}
                    <path d="M 90 190 Q 150 225 210 190" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 130 220 L 170 220" stroke="#fbc02d" strokeWidth="3" />
                </g>
            );
        case 'clothes_junlv_coat':
            return (
                <g>
                    {/* 抗寒军绿大衣 - Olive green heavy coat + thick brown fur collar + red inner sweater */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#558b2f" stroke="#33691e" strokeWidth="3" />
                    {/* Red inner sweater */}
                    <polygon points="120,180 150,230 180,180" fill="#d50000" stroke="#333" />
                    {/* Thick brown fur collar */}
                    <path d="M 90 170 Q 150 215 210 170" fill="none" stroke="#8d6e63" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 90 170 Q 150 215 210 170" fill="none" stroke="#5d4037" strokeWidth="6" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Double breasted golden buttons */}
                    <circle cx="115" cy="270" r="4.5" fill="#fbc02d" stroke="#333" />
                    <circle cx="185" cy="270" r="4.5" fill="#fbc02d" stroke="#333" />
                    <circle cx="115" cy="320" r="4.5" fill="#fbc02d" stroke="#333" />
                    <circle cx="185" cy="320" r="4.5" fill="#fbc02d" stroke="#333" />
                </g>
            );
        case 'clothes_tianmeng_pjs':
            return (
                <g>
                    {/* 甜梦漫游记 - Sky blue pajama top + white lace collar + blue bow */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#b3e5fc" stroke="#0288d1" strokeWidth="3" />
                    {/* White lace collar */}
                    <path d="M 90 180 C 100 240, 200 240, 210 180" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 90 180 C 100 240, 200 240, 210 180" fill="none" stroke="#e0e0e0" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Blue bow in center */}
                    <g transform="translate(150, 220)">
                        <circle cx="0" cy="0" r="3.5" fill="#0288d1" stroke="#333" />
                        <path d="M -3 0 C -12 -8, -12 8, -3 0 Z" fill="#0288d1" stroke="#333" />
                        <path d="M 3 0 C 12 -8, 12 8, 3 0 Z" fill="#0288d1" stroke="#333" />
                    </g>
                </g>
            );
        case 'clothes_bairimeng_pjs':
            return (
                <g>
                    {/* 白日梦想家 - Royal blue pajama + yellow stars + orange neck pillow + pocket teddy bear */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1a237e" stroke="#0d47a1" strokeWidth="3" />
                    {/* Yellow pajama stars */}
                    <polygon points="90,260 92,265 97,265 93,269 95,274 90,271 85,274 87,269 83,265 88,265" fill="#fbc02d" />
                    <polygon points="190,300 192,305 197,305 193,309 195,314 190,311 185,314 187,309 183,305 188,305" fill="#fbc02d" />
                    {/* Cozy orange neck pillow */}
                    <path d="M 95 180 C 95 150, 205 150, 205 180" fill="none" stroke="#ffb74d" strokeWidth="24" strokeLinecap="round" />
                    <path d="M 95 180 C 95 150, 205 150, 205 180" fill="none" stroke="#f57c00" strokeWidth="4" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Small pocket bear on left chest */}
                    <rect x="180" y="240" width="22" height="22" fill="#283593" stroke="#ffd700" strokeWidth="1" />
                    {/* Brown teddy bear head peeking out */}
                    <circle cx="191" cy="232" r="7" fill="#8d6e63" stroke="#3e2723" />
                    <circle cx="186" cy="226" r="3" fill="#8d6e63" />
                    <circle cx="196" cy="226" r="3" fill="#8d6e63" />
                </g>
            );
        case 'clothes_chestnut_leather':
            return (
                <g>
                    {/* 奶油栗色皮衣 - Distressed brown leather jacket + cream knit vest + white shirt + bead necklace */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#8d6e63" stroke="#3e2723" strokeWidth="3" />
                    {/* Cream knit vest */}
                    <path d="M 100 220 L 150 300 L 200 220 L 220 450 L 80 450 Z" fill="#fffde7" stroke="#333" strokeWidth="2" />
                    {/* White shirt collar */}
                    <polygon points="120,180 150,215 135,235 110,200" fill="#ffffff" stroke="#333" />
                    <polygon points="180,180 150,215 165,235 190,200" fill="#ffffff" stroke="#333" />
                    {/* Bead necklace */}
                    <circle cx="138" cy="220" r="3" fill="#80deea" />
                    <circle cx="146" cy="225" r="3" fill="#ff8a80" />
                    <circle cx="154" cy="225" r="3" fill="#ffd54f" />
                    <circle cx="162" cy="220" r="3" fill="#80deea" />
                </g>
            );
        case 'clothes_tianku_dress':
            return (
                <g>
                    {/* 甜酷连衣裙 - Red plaid off-shoulder dress + white sleeve cuffs + black neck collar */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="3" />
                    {/* Plaid lines */}
                    <path d="M 50 300 L 250 300 M 50 340 L 250 340 M 100 250 L 100 450 M 200 250 L 200 450" stroke="#000000" strokeWidth="2.5" opacity="0.4" />
                    {/* White puffed cuffs */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 250 250 L 265 270 Q 275 320 250 350" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                    {/* Black neck choker */}
                    <path d="M 110 170 Q 150 190 190 170" fill="none" stroke="#212121" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="150" cy="183" r="3.5" fill="#d50000" />
                </g>
            );
        case 'clothes_zhajie_vest':
            return (
                <g>
                    {/* 炸街无袖衫 - Sky blue sleeveless high-neck top + chunky silver chain */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#80deea" stroke="#00838f" strokeWidth="3" />
                    {/* Flesh layer for bare shoulders */}
                    <path d="M 40 250 C 50 210, 85 190, 85 190 L 100 220 Z" fill="#ffe0b2" stroke="#00838f" strokeWidth="1" />
                    <path d="M 260 250 C 250 210, 215 190, 215 190 L 200 220 Z" fill="#ffe0b2" stroke="#00838f" strokeWidth="1" />
                    {/* High neck halter sashes */}
                    <path d="M 100 170 L 150 230 L 200 170" fill="none" stroke="#00acc1" strokeWidth="12" strokeLinecap="round" />
                    {/* Chunky silver chain */}
                    <path d="M 110 200 Q 150 240 190 200" fill="none" stroke="#cfd8dc" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 110 200 Q 150 240 190 200" fill="none" stroke="#78909c" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,4" />
                </g>
            );
        case 'clothes_yuanqi_overalls':
            return (
                <g>
                    {/* 元气背带裤 - Pink & yellow denim overalls + star print pocket + pink long sleeves */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f8bbd0" stroke="#c2185b" strokeWidth="3" />
                    {/* Pastel yellow suspenders */}
                    <path d="M 95 280 L 205 280 L 220 450 L 80 450 Z" fill="#fff59d" stroke="#fbc02d" strokeWidth="2" />
                    {/* Pink suspender shoulder sashes */}
                    <path d="M 100 170 L 100 280 M 200 170 L 200 280" stroke="#f48fb1" strokeWidth="8" strokeLinecap="round" />
                    {/* Star pocket in center */}
                    <path d="M 135 310 L 165 310 L 165 340 L 135 340 Z" fill="#f48fb1" stroke="#333" strokeWidth="1.5" />
                    <polygon points="150,315 152,320 157,320 153,324 155,329 150,326 145,329 147,324 143,320 148,320" fill="#ffeb3b" />
                </g>
            );
        case 'clothes_lanqiu_suit':
            return (
                <g>
                    {/* 炫酷篮球服 - White tee shirt layered with a blue/yellow number "11" jersey */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#b0bec5" strokeWidth="3" />
                    {/* Blue & yellow basketball jersey overlay */}
                    <path d="M 85 240 C 70 300, 75 380, 100 450 L 200 450 C 225 380, 230 300, 215 240 Z" fill="#2196f3" stroke="#fbc02d" strokeWidth="3" />
                    {/* Yellow border collar sashes */}
                    <path d="M 110 240 Q 150 270 190 240" fill="none" stroke="#fbc02d" strokeWidth="6" strokeLinecap="round" />
                    {/* Number "11" printed in center */}
                    <text x="150" y="340" fontSize="38" fill="#ffffff" fontWeight="black" textAnchor="middle" stroke="#333" strokeWidth="2">11</text>
                </g>
            );
        case 'clothes_jersey_retro':
            return (
                <g>
                    {/* 泽西风复古球衣 - Vintage light blue/white striped soccer jersey + Stay Active print */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e3f2fd" stroke="#1565c0" strokeWidth="3" />
                    {/* White vertical stripes */}
                    <line x1="85" y1="210" x2="65" y2="450" stroke="#ffffff" strokeWidth="12" />
                    <line x1="120" y1="220" x2="110" y2="450" stroke="#ffffff" strokeWidth="12" />
                    <line x1="180" y1="220" x2="190" y2="450" stroke="#ffffff" strokeWidth="12" />
                    <line x1="215" y1="210" x2="235" y2="450" stroke="#ffffff" strokeWidth="12" />
                    {/* Stay Active Text */}
                    <text x="150" y="310" fontSize="20" fill="#0d47a1" fontWeight="bold" fontStyle="italic" textAnchor="middle" stroke="#ffffff" strokeWidth="1">Stay Active</text>
                </g>
            );
        case 'clothes_ballet_vest':
            return (
                <g>
                    {/* 运动芭蕾背心 - Navy blue exercise halter-neck crop top + "100" logo + white ties */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#0277bd" stroke="#004b6b" strokeWidth="3" />
                    {/* White shoulder ribbon bows */}
                    <circle cx="105" cy="180" r="5" fill="#ffffff" stroke="#333" />
                    <circle cx="195" cy="180" r="5" fill="#ffffff" stroke="#333" />
                    {/* Halter straps */}
                    <path d="M 105 180 L 130 220 M 195 180 L 170 220" stroke="#ffffff" strokeWidth="3" />
                    {/* "100" logo printed in center */}
                    <text x="150" y="310" fontSize="32" fill="#ffd700" fontWeight="black" textAnchor="middle" fontStyle="italic" stroke="#333" strokeWidth="1">100</text>
                </g>
            );
        case 'clothes_aixiang_robe':
            return (
                <g>
                    {/* 艾香满襟江湖 - Pale green swordsman robe + painted bamboo on left + brown belt */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#c8e6c9" stroke="#388e3c" strokeWidth="3" />
                    {/* Painted bamboo on left drape */}
                    <path d="M 85 280 C 95 240, 75 220, 80 200" fill="none" stroke="#2e7d32" strokeWidth="2.5" />
                    <path d="M 80 200 L 68 190 Q 75 195 85 200 L 98 195 C 88 205, 84 215, 82 225" fill="#2e7d32" />
                    {/* Wide brown sash belt */}
                    <rect x="72" y="350" width="156" height="20" fill="#8d6e63" stroke="#3e2723" strokeWidth="2" />
                    {/* White neck wrap inner */}
                    <path d="M 115 170 L 150 230 L 185 170" fill="none" stroke="#ffffff" strokeWidth="6" />
                </g>
            );
        case 'clothes_qingai_dress':
            return (
                <g>
                    {/* 青艾拂云裳 - Traditional white dress + soft green gradient sashes + bows */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#c8e6c9" strokeWidth="3" />
                    {/* Pale green sashes draped over */}
                    <path d="M 100 170 C 120 220, 110 320, 90 450" fill="none" stroke="#a5d6a7" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 200 170 C 180 220, 190 320, 210 450" fill="none" stroke="#a5d6a7" strokeWidth="12" strokeLinecap="round" />
                    {/* Green chest bows */}
                    <circle cx="150" cy="220" r="5" fill="#81c784" stroke="#2e7d32" />
                    <path d="M 148 223 Q 135 240 142 270" fill="none" stroke="#2e7d32" strokeWidth="2" />
                    <path d="M 152 223 Q 165 240 158 270" fill="none" stroke="#2e7d32" strokeWidth="2" />
                </g>
            );
        case 'clothes_mushan_gown':
            return (
                <g>
                    {/* 暮山紫纱裙 - Royal purple and orange Hanfu dress + gold embroidery */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fff3e0" stroke="#ffb74d" strokeWidth="3" />
                    {/* Purple sleeves & sashes */}
                    <path d="M 60 220 L 40 250 C 0 350, 50 450, 100 450 L 100 240 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="2" />
                    <path d="M 240 220 L 260 250 C 300 350, 250 450, 200 450 L 200 240 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="2" />
                    {/* Orange bodice in center with gold patterns */}
                    <path d="M 110 240 C 110 240, 95 340, 110 450 L 190 450 C 205 340, 190 240, 190 240 Z" fill="#ffb74d" stroke="#f57c00" strokeWidth="2" />
                    <circle cx="150" cy="290" r="12" fill="none" stroke="#ffd700" strokeWidth="2.5" />
                    <circle cx="150" cy="290" r="6" fill="#ffd700" />
                </g>
            );
        case 'clothes_tianshui_robe':
            return (
                <g>
                    {/* 天水碧长衫 - Mint green modernization scholar robe + white feather sashes */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e0f2f1" stroke="#4db6ac" strokeWidth="3" />
                    {/* White feather-like sashes on shoulder */}
                    <path d="M 85 190 Q 150 230 215 190" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 85 190 Q 150 230 215 190" fill="none" stroke="#b2dfdb" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Modern high neck collar */}
                    <rect x="120" y="165" width="60" height="25" fill="#b2dfdb" stroke="#00796b" strokeWidth="1.5" />
                    {/* Golden neck pendant */}
                    <circle cx="150" cy="205" r="4.5" fill="#ffd700" stroke="#333" />
                </g>
            );
        case 'clothes_ziyou_shirt':
            return (
                <g>
                    {/* 自由一"夏"甜酷衫 - Sky blue short-sleeve jacket + dark blue inner "Free" T-shirt */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#bbdefb" stroke="#1565c0" strokeWidth="3" />
                    {/* Dark blue inner tee shirt */}
                    <path d="M 100 240 L 150 300 L 200 240 L 210 450 L 90 450 Z" fill="#0d47a1" stroke="#333" strokeWidth="2" />
                    <text x="150" y="350" fontSize="20" fill="#ffffff" fontWeight="black" textAnchor="middle" stroke="#333" strokeWidth="1">Free</text>
                    {/* White shorts line */}
                    <path d="M 90 430 L 210 430" stroke="#ffffff" strokeWidth="14" />
                </g>
            );
        case 'clothes_saiche_suit':
            return (
                <g>
                    {/* 热血满格赛车服 - Red and blue racing polo + sponsors (disc, pop, RACE) */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d50000" stroke="#333" strokeWidth="3" />
                    {/* Blue shoulder blocks */}
                    <path d="M 40 250 C 60 200, 100 180, 120 220 L 70 260 Z" fill="#2962ff" stroke="#333" strokeWidth="1.5" />
                    <path d="M 260 250 C 240 200, 200 180, 180 220 L 230 260 Z" fill="#2962ff" stroke="#333" strokeWidth="1.5" />
                    {/* RACE text printed in center */}
                    <text x="150" y="325" fontSize="26" fill="#ffffff" fontWeight="black" fontStyle="italic" textAnchor="middle" stroke="#333" strokeWidth="2">RACE</text>
                    {/* Small sponsor badges */}
                    <rect x="100" y="245" width="26" height="13" fill="#ffb300" rx="3" stroke="#333" />
                    <text x="113" y="254" fontSize="8" fill="#fff" fontWeight="black" textAnchor="middle">disc</text>
                    <rect x="174" y="245" width="26" height="13" fill="#00e5ff" rx="3" stroke="#333" />
                    <text x="187" y="254" fontSize="8" fill="#fff" fontWeight="black" textAnchor="middle">pop</text>
                </g>
            );

        // ====================================================================
        // Clothes Part 5 - 20 NEW ITEMS (Baicizhan 1:1 replica)
        // ====================================================================
        case 'clothes_urban_suit':
            return (
                <g>
                    {/* 利落都市套装 - Neat brown blazer + blue buttoned shirt + pen in pocket */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#8d6e63" stroke="#4e342e" strokeWidth="3" />
                    {/* Blue collared inner shirt */}
                    <path d="M 100 200 L 150 280 L 200 200 L 210 450 L 90 450 Z" fill="#90caf9" stroke="#333" strokeWidth="2" />
                    {/* White shirt collar */}
                    <polygon points="120,180 150,215 135,235 110,200" fill="#ffffff" stroke="#333" />
                    <polygon points="180,180 150,215 165,235 190,200" fill="#ffffff" stroke="#333" />
                    {/* Pen in chest pocket */}
                    <rect x="85" y="250" width="22" height="18" fill="#5d4037" stroke="#4e342e" strokeWidth="1.5" />
                    <rect x="94" y="235" width="4" height="20" fill="#ffd700" stroke="#333" />
                </g>
            );
        case 'clothes_elegant_cold':
            return (
                <g>
                    {/* 精致清冷套装 - Brown blazer + vertically-striped top + bead necklace */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#a1887f" stroke="#4e342e" strokeWidth="3" />
                    {/* Vertically-striped white top */}
                    <path d="M 100 200 L 150 280 L 200 200 L 210 450 L 90 450 Z" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    <line x1="125" y1="210" x2="115" y2="450" stroke="#bdbdbd" strokeWidth="1.5" />
                    <line x1="150" y1="210" x2="150" y2="450" stroke="#bdbdbd" strokeWidth="1.5" />
                    <line x1="175" y1="210" x2="185" y2="450" stroke="#bdbdbd" strokeWidth="1.5" />
                    {/* Delicate bead necklace */}
                    <circle cx="138" cy="210" r="3" fill="#ffb74d" />
                    <circle cx="146" cy="215" r="3" fill="#ffd54f" />
                    <circle cx="154" cy="215" r="3" fill="#ffd54f" />
                    <circle cx="162" cy="210" r="3" fill="#ffb74d" />
                </g>
            );
        case 'clothes_xuemei_robe':
            return (
                <g>
                    {/* 雪梅缀银袍 - Pale blue Hanfu robe + white fur collars + winter flower prints */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e1f5fe" stroke="#0288d1" strokeWidth="3" />
                    {/* White fur-trimmed collars */}
                    <path d="M 100 170 Q 150 200 200 170 L 210 185 Q 150 220 90 185 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
                    <circle cx="150" cy="200" r="6.5" fill="#ffffff" stroke="#e0e0e0" />
                    {/* Winter flower prints */}
                    <circle cx="85" cy="260" r="4.5" fill="#ff8a80" />
                    <circle cx="85" cy="260" r="1.5" fill="#fff" />
                    <circle cx="215" cy="290" r="5.5" fill="#ff8a80" />
                    <circle cx="215" cy="290" r="2" fill="#fff" />
                </g>
            );
        case 'clothes_yunrong_dress':
            return (
                <g>
                    {/* 云绒披罗裙 - Pale blue winter gown + gorgeous white fur cloak with blue embroideries */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e1f5fe" stroke="#0288d1" strokeWidth="3" />
                    {/* Gorgeous white fur-collared cloak overlay */}
                    <path d="M 95 180 C 65 240, 70 380, 100 450 L 200 450 C 230 380, 235 240, 205 180 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="2" />
                    {/* Blue embroideries on cloak edges */}
                    <path d="M 95 180 Q 75 300 100 450" fill="none" stroke="#29b6f6" strokeWidth="4" />
                    <path d="M 205 180 Q 225 300 200 450" fill="none" stroke="#29b6f6" strokeWidth="4" />
                    {/* Fur neck border sashes */}
                    <circle cx="150" cy="205" r="12" fill="#ffffff" stroke="#e0e0e0" />
                </g>
            );
        case 'clothes_caramel_shirt':
            return (
                <g>
                    {/* 焦糖橙衬衫 - Orange argyle sweater vest + beige shirt + brown fox badge */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#efebe9" stroke="#d7ccc8" strokeWidth="3" />
                    {/* Orange argyle vest */}
                    <path d="M 100 240 C 100 240, 85 340, 100 450 L 200 450 C 215 340, 200 240, 200 240 Z" fill="#ffb74d" stroke="#f57c00" strokeWidth="2" />
                    {/* Argyle checkers */}
                    <path d="M 120 240 L 150 340 L 180 240 M 120 340 L 150 440 L 180 340" stroke="#ffe082" strokeWidth="2" fill="none" />
                    {/* Fox brooch badge on left chest */}
                    <circle cx="180" cy="270" r="7" fill="#ff7043" stroke="#333" strokeWidth="1.5" />
                    <circle cx="180" cy="270" r="2.5" fill="#333" />
                </g>
            );
        case 'clothes_warm_autumn':
            return (
                <g>
                    {/* 暖秋套装 - Mustard yellow argyle vest + brown bowtie + hamster brooch */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fffde7" stroke="#fff59d" strokeWidth="3" />
                    {/* Yellow argyle vest */}
                    <path d="M 100 240 C 100 240, 85 340, 100 450 L 200 450 C 215 340, 200 240, 200 240 Z" fill="#ffeb3b" stroke="#fbc02d" strokeWidth="2" />
                    {/* Argyle checkers */}
                    <path d="M 120 240 L 150 340 L 180 240 M 120 340 L 150 440 L 180 340" stroke="#ffcc80" strokeWidth="2" fill="none" />
                    {/* Brown bowtie */}
                    <g transform="translate(150, 200)">
                        <circle cx="0" cy="0" r="3.5" fill="#8d6e63" stroke="#333" />
                        <path d="M -3 0 L -12 -6 L -12 6 Z" fill="#8d6e63" stroke="#333" />
                        <path d="M 3 0 L 12 -6 L 12 6 Z" fill="#8d6e63" stroke="#333" />
                    </g>
                    {/* Hamster brooch on left chest */}
                    <circle cx="180" cy="270" r="7" fill="#bcaaa4" stroke="#333" strokeWidth="1.5" />
                    <circle cx="180" cy="270" r="2" fill="#333" />
                </g>
            );
        case 'clothes_scarlet_dress':
            return (
                <g>
                    {/* 绯红礼服 - Alice playing card red/blue corset + card heart patterns */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d50000" stroke="#333" strokeWidth="3" />
                    {/* White ruffled front vest with red hearts */}
                    <polygon points="120,180 180,180 170,360 130,360" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    <circle cx="150" cy="220" r="4.5" fill="#d50000" />
                    <circle cx="150" cy="260" r="4.5" fill="#d50000" />
                    <circle cx="150" cy="300" r="4.5" fill="#d50000" />
                    {/* Blue trim side folds */}
                    <path d="M 90 220 C 70 300, 75 380, 100 450" fill="none" stroke="#2962ff" strokeWidth="8" />
                    <path d="M 210 220 C 230 300, 225 380, 200 450" fill="none" stroke="#2962ff" strokeWidth="8" />
                </g>
            );
        case 'clothes_berry_cake':
            return (
                <g>
                    {/* 莓果蛋糕裙 - Strawberry pink-red corset cupcake gown + lace borders */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ff4081" stroke="#c2185b" strokeWidth="3" />
                    {/* White dotted print */}
                    <circle cx="100" cy="270" r="2.5" fill="#ffffff" />
                    <circle cx="200" cy="270" r="2.5" fill="#ffffff" />
                    <circle cx="150" cy="340" r="2.5" fill="#ffffff" />
                    <circle cx="110" cy="400" r="2.5" fill="#ffffff" />
                    <circle cx="190" cy="400" r="2.5" fill="#ffffff" />
                    {/* Sweet white puffed lace sleeves */}
                    <circle cx="50" cy="230" r="16" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
                    <circle cx="250" cy="230" r="16" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2" />
                    {/* Pink bows on chest */}
                    <circle cx="150" cy="210" r="5" fill="#f50057" stroke="#333" />
                </g>
            );
        case 'clothes_star_phantom':
            return (
                <g>
                    {/* 星幻灵袍 - Dark brown explorer tunic + golden charts + cowl */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#4e342e" stroke="#3e2723" strokeWidth="3" />
                    {/* Gold charts */}
                    <circle cx="150" cy="310" r="16" fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.6" />
                    <line x1="130" y1="310" x2="170" y2="310" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                    <line x1="150" y1="290" x2="150" y2="330" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                    {/* Explorer cowl cloak sashes */}
                    <path d="M 95 180 Q 150 215 205 180" fill="none" stroke="#5d4037" strokeWidth="12" strokeLinecap="round" />
                </g>
            );
        case 'clothes_dark_witch':
            return (
                <g>
                    {/* 幻夜巫裙装 - Dark brown witchy corset + silver key pendant */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#3e2723" stroke="#270f0f" strokeWidth="3" />
                    {/* Criss cross lace front */}
                    <polygon points="125,190 175,190 165,300 135,300" fill="#4e342e" stroke="#270f0f" strokeWidth="1.5" />
                    <path d="M 132 210 L 168 230 M 132 230 L 168 210 M 135 250 L 165 270 M 135 270 L 165 250" stroke="#ffd54f" strokeWidth="2.5" />
                    {/* Silver key pendant on necklace */}
                    <path d="M 120 180 Q 150 220 180 180" fill="none" stroke="#cfd8dc" strokeWidth="3" />
                    <circle cx="150" cy="225" r="4.5" fill="#cfd8dc" stroke="#333" />
                    <line x1="150" y1="229.5" x2="150" y2="245" stroke="#cfd8dc" strokeWidth="2.5" />
                </g>
            );
        case 'clothes_starlight_blade':
            return (
                <g>
                    {/* 星芒银刃衣 - Sci-fi silver armor jacket + glowing neon blue circuit lines */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="3" />
                    {/* Glowing neon blue circuit lines */}
                    <path d="M 85 240 Q 110 260 110 320 L 95 440" fill="none" stroke="#00e5ff" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 215 240 Q 190 260 190 320 L 205 440" fill="none" stroke="#00e5ff" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="110" cy="320" r="3.5" fill="#fff" stroke="#00e5ff" strokeWidth="1.5" />
                    <circle cx="190" cy="320" r="3.5" fill="#fff" stroke="#00e5ff" strokeWidth="1.5" />
                    {/* Black armor plates */}
                    <rect x="128" y="200" width="44" height="25" fill="#37474f" stroke="#212121" rx="4" />
                </g>
            );
        case 'clothes_silver_stream':
            return (
                <g>
                    {/* 幻银流光皮衣 - Sci-fi silver crop jacket + neon blue lines for girls */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="3" />
                    {/* Crop jacket bottom cut-out (flesh layer) */}
                    <path d="M 80 380 C 110 400, 190 400, 220 380 L 210 450 L 90 450 Z" fill="#ffe0b2" stroke="#cfd8dc" strokeWidth="1.5" />
                    {/* Glowing neon lines */}
                    <path d="M 100 240 Q 120 280 120 360" fill="none" stroke="#00e5ff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 200 240 Q 180 280 180 360" fill="none" stroke="#00e5ff" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'clothes_retro_wind':
            return (
                <g>
                    {/* 复古风吟衫 - Cream shirt + beige zig-zag lines + brown spotted scarf tie + watch */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#faf0e6" stroke="#b08d57" strokeWidth="3" />
                    {/* Beige zig zag prints */}
                    <path d="M 60 240 L 80 260 L 100 240 L 120 260 L 140 240 L 160 260 L 180 240 L 200 260 L 220 240" fill="none" stroke="#d7ccc8" strokeWidth="3.5" />
                    <path d="M 60 300 L 80 320 L 100 300 L 120 320 L 140 300 L 160 320 L 180 300 L 200 320 L 220 300" fill="none" stroke="#d7ccc8" strokeWidth="3.5" />
                    {/* Brown spotted scarf tie */}
                    <path d="M 120 180 Q 150 215 180 180" fill="none" stroke="#8d6e63" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="138" cy="195" r="2" fill="#fff" />
                    <circle cx="150" cy="202" r="2" fill="#fff" />
                    <circle cx="162" cy="195" r="2" fill="#fff" />
                    {/* Leather sports watch on right arm */}
                    <rect x="50" y="310" width="12" height="24" fill="#5d4037" stroke="#000" rx="3" />
                    <rect x="47" y="316" width="18" height="12" fill="#ffd54f" stroke="#5d4037" strokeWidth="1.5" />
                </g>
            );
        case 'clothes_wilderness_dream':
            return (
                <g>
                    {/* 旷野织梦衫 - Cream shirt + white vest + blue/yellow flower embroideries */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#faf0e6" stroke="#b2dfdb" strokeWidth="3" />
                    {/* White vest over it */}
                    <path d="M 100 220 L 150 285 L 200 220 L 210 450 L 90 450 Z" fill="#ffffff" stroke="#333" strokeWidth="2.5" />
                    {/* Yellow collar scarf tie */}
                    <path d="M 120 180 Q 150 210 180 180" fill="none" stroke="#fbc02d" strokeWidth="6" strokeLinecap="round" />
                    {/* Blue & yellow flower embroideries */}
                    <circle cx="120" cy="320" r="5" fill="#42a5f5" />
                    <circle cx="120" cy="320" r="1.5" fill="#fbc02d" />
                    <circle cx="180" cy="320" r="5" fill="#42a5f5" />
                    <circle cx="180" cy="320" r="1.5" fill="#fbc02d" />
                </g>
            );
        case 'clothes_white_amber':
            return (
                <g>
                    {/* 白夜珀光袍 - Regal gold & white fantasy tunic + hanging crystal prisms */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#ffd700" strokeWidth="3" />
                    {/* Gold layered chest sashes */}
                    <path d="M 90 190 Q 150 235 210 190" fill="none" stroke="#ffd700" strokeWidth="12" strokeLinecap="round" />
                    {/* Hanging crystal prism gems */}
                    <circle cx="125" cy="225" r="4.5" fill="#80deea" stroke="#004d40" />
                    <circle cx="150" cy="235" r="4.5" fill="#80deea" stroke="#004d40" />
                    <circle cx="175" cy="225" r="4.5" fill="#80deea" stroke="#004d40" />
                    {/* Gold arm cuffs */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#ffd700" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 250 250 L 265 270 Q 275 320 250 350" fill="none" stroke="#ffd700" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'clothes_star_dream':
            return (
                <g>
                    {/* 星辉梦境裙装 - Purple fantasy off shoulder gown + gold chain sashes */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ab47bc" stroke="#4a148c" strokeWidth="3" />
                    {/* Gold chest chains */}
                    <path d="M 100 200 Q 150 240 200 200" fill="none" stroke="#ffd700" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 100 200 Q 150 240 200 200" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Off shoulder purple sashes */}
                    <path d="M 80 190 Q 150 220 220 190" fill="none" stroke="#ce93d8" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'clothes_breeze_vest':
            return (
                <g>
                    {/* 沁蓝微风背心 - Sleeveless light blue tank top + MID-SUMMER ICE CREAM print */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e0f7fa" stroke="#00acc1" strokeWidth="3" />
                    {/* Flesh layer for bare shoulders */}
                    <path d="M 40 250 C 50 210, 85 190, 85 190 L 100 220 Z" fill="#ffe0b2" stroke="#00acc1" strokeWidth="1" />
                    <path d="M 260 250 C 250 210, 215 190, 215 190 L 200 220 Z" fill="#ffe0b2" stroke="#00acc1" strokeWidth="1" />
                    {/* "MID-SUMMER ICE CREAM" text print */}
                    <text x="150" y="300" fontSize="13" fill="#00acc1" fontWeight="bold" textAnchor="middle" stroke="#ffffff" strokeWidth="1">MID-SUMMER</text>
                    <text x="150" y="325" fontSize="14" fill="#ff7043" fontWeight="bold" textAnchor="middle" stroke="#ffffff" strokeWidth="1">ICE CREAM</text>
                </g>
            );
        case 'clothes_iceflower_dress':
            return (
                <g>
                    {/* 冰花碎梦裙 - Light blue off-shoulder dress + layered ruffles + shell pendant */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#b3e5fc" stroke="#0288d1" strokeWidth="3" />
                    {/* Off shoulder layered white ruffles */}
                    <path d="M 80 190 Q 150 230 220 190" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 80 190 Q 150 230 220 190" fill="none" stroke="#81d4fa" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,3" />
                    {/* Silver shell necklace */}
                    <path d="M 120 180 Q 150 220 180 180" fill="none" stroke="#cfd8dc" strokeWidth="2.5" />
                    <polygon points="150,225 155,232 145,232" fill="#ffffff" stroke="#90a4ae" strokeWidth="1" />
                </g>
            );
        case 'clothes_bamboo_panda':
            return (
                <g>
                    {/* 竹影墨熊猫 - Modern olive-green Tang-style shirt + white bamboo/panda flap */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#558b2f" stroke="#33691e" strokeWidth="3" />
                    {/* Asymmetrical white drapes flap on left */}
                    <path d="M 150 220 L 220 220 L 235 450 L 150 450 Z" fill="#ffffff" stroke="#33691e" strokeWidth="2.5" />
                    {/* Painted green bamboo branches */}
                    <path d="M 175 280 C 185 240, 195 240, 190 200" fill="none" stroke="#2e7d32" strokeWidth="2" />
                    {/* Climbing panda head */}
                    <circle cx="210" cy="300" r="9" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="203" cy="293" r="3.5" fill="#333" />
                    <circle cx="217" cy="293" r="3.5" fill="#333" />
                    <circle cx="207" cy="300" r="2" fill="#333" />
                    <circle cx="213" cy="300" r="2" fill="#333" />
                </g>
            );
        case 'clothes_panda_qipao':
            return (
                <g>
                    {/* 熊猫竹趣旗袍 - White & green cheongsam halter-dress + panda charms */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffffff" stroke="#388e3c" strokeWidth="3" />
                    {/* Green cheongsam halter trims */}
                    <path d="M 115 170 L 150 230 L 185 170" fill="none" stroke="#81c784" strokeWidth="8" />
                    {/* Green painted bamboo prints */}
                    <path d="M 85 280 C 95 240, 75 220, 80 200" fill="none" stroke="#2e7d32" strokeWidth="2.5" />
                    {/* Hanging panda plush charm */}
                    <circle cx="215" cy="290" r="8" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="208" cy="283" r="3.5" fill="#333" />
                    <circle cx="222" cy="283" r="3.5" fill="#333" />
                    <circle cx="212" cy="290" r="2.2" fill="#333" />
                    <circle cx="218" cy="290" r="2.2" fill="#333" />
                </g>
            );

        // ====================================================================
        // Clothes Part 6 - 18 NEW ITEMS (Baicizhan 1:1 replica)
        // ====================================================================
        case 'clothes_apple_overalls':
            return (
                <g>
                    {/* 青苹果棕趣背带裤 - Lime green shirt + brown overalls */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#c8e6c9" stroke="#388e3c" strokeWidth="3" />
                    {/* Brown overalls denim */}
                    <path d="M 90 280 L 210 280 L 220 450 L 80 450 Z" fill="#8d6e63" stroke="#3e2723" strokeWidth="2.5" />
                    <path d="M 100 170 L 100 280 M 200 170 L 200 280" stroke="#a1887f" strokeWidth="8" strokeLinecap="round" />
                    {/* Round bead necklace */}
                    <circle cx="138" cy="220" r="3.5" fill="#81c784" stroke="#333" />
                    <circle cx="150" cy="225" r="3.5" fill="#ffd54f" stroke="#333" />
                    <circle cx="162" cy="220" r="3.5" fill="#81c784" stroke="#333" />
                </g>
            );
        case 'clothes_apple_dress':
            return (
                <g>
                    {/* 夏野青苹果长裙 - Lime green ruffled crop top + pink checks + sweet bows */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="3" />
                    {/* Pink check sleeves ruffles */}
                    <circle cx="50" cy="230" r="16" fill="#f8bbd0" stroke="#c2185b" strokeWidth="1.5" />
                    <circle cx="250" cy="230" r="16" fill="#f8bbd0" stroke="#c2185b" strokeWidth="1.5" />
                    {/* Pink collar bows */}
                    <circle cx="150" cy="210" r="5" fill="#ff4081" stroke="#c2185b" />
                </g>
            );
        case 'clothes_shanchuan_robe':
            return (
                <g>
                    {/* 山川长袍 - Pale-blue traditional robe + painted mountain & river wave patterns */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e1f5fe" stroke="#0288d1" strokeWidth="3" />
                    {/* Painted mountain wave lines */}
                    <path d="M 90 320 C 120 300, 180 300, 210 320" fill="none" stroke="#29b6f6" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 70 360 C 110 340, 190 340, 230 360" fill="none" stroke="#0288d1" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 60 400 C 100 380, 200 380, 240 400" fill="none" stroke="#0d47a1" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
        case 'clothes_moyu_fairy':
            return (
                <g>
                    {/* 墨玉烟罗仙衣 - Light blue gown + layered transparent floral lace overlays */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#e0f7fa" stroke="#4db6ac" strokeWidth="3" />
                    {/* Transparent lace overlays */}
                    <path d="M 90 200 Q 150 240 210 200" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
                    <path d="M 80 250 C 120 280, 180 280, 220 250 L 230 450 L 70 450 Z" fill="#ffffff" stroke="#b2dfdb" strokeWidth="1" opacity="0.4" />
                </g>
            );
        case 'clothes_cowboy_barn':
            return (
                <g>
                    {/* 牛仔巴恩套装 - Double denim jacket + checkered inner + brown vest */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#42a5f5" stroke="#1565c0" strokeWidth="3" />
                    {/* Checkered inner shirt */}
                    <path d="M 100 200 L 150 280 L 200 200 L 210 450 L 90 450 Z" fill="#bbdefb" stroke="#333" strokeWidth="2" />
                    <line x1="125" y1="210" x2="125" y2="450" stroke="#1e88e5" strokeWidth="1.5" />
                    <line x1="175" y1="210" x2="175" y2="450" stroke="#1e88e5" strokeWidth="1.5" />
                    {/* Brown vest collar */}
                    <polygon points="120,240 150,280 180,240 L 165,360 L 135,360" fill="#8d6e63" stroke="#3e2723" strokeWidth="1.5" />
                </g>
            );
        case 'clothes_cowgirl_barn':
            return (
                <g>
                    {/* 少女巴恩套装 - Brown fleece leather jacket + blue sweater */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="3" />
                    {/* Blue knit sweater inner */}
                    <polygon points="110,180 150,225 190,180 C 230 250, 220 380, 190 450 L 110 450 Z" fill="#0288d1" stroke="#333" strokeWidth="2" />
                    {/* White fleece border trim */}
                    <path d="M 95 180 Q 150 215 205 180" fill="none" stroke="#fafafa" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'clothes_sunflower_suit':
            return (
                <g>
                    {/* 向日葵西装 - Royal blue blazer + argyle vest + sunflower badge */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="3" />
                    {/* Argyle vest inner */}
                    <path d="M 100 220 L 150 295 L 200 220 L 210 450 L 90 450 Z" fill="#e0f2f1" stroke="#333" strokeWidth="2" />
                    {/* Golden sunflower badge brooch */}
                    <circle cx="185" cy="265" r="7.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="1.5" />
                    <circle cx="185" cy="265" r="3" fill="#8d6e63" />
                </g>
            );
        case 'clothes_pearl_girl':
            return (
                <g>
                    {/* 珍珠少女连衣裙 - Victorian orange and beige corset gown + puffed sleeves */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ffb74d" stroke="#f57c00" strokeWidth="3" />
                    {/* White lace collar standing */}
                    <path d="M 100 180 Q 150 215 200 180" fill="none" stroke="#fafafa" strokeWidth="10" strokeLinecap="round" />
                    {/* Brown puffed sleeves */}
                    <circle cx="50" cy="230" r="18" fill="#5d4037" stroke="#333" strokeWidth="2" />
                    <circle cx="250" cy="230" r="18" fill="#5d4037" stroke="#333" strokeWidth="2" />
                </g>
            );
        case 'clothes_ocean_conquer':
            return (
                <g>
                    {/* 海洋征服装 - Navy captain uniform + red collar + double gold chains */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1a237e" stroke="#0d47a1" strokeWidth="3" />
                    {/* Red high collar */}
                    <path d="M 100 170 L 150 230 L 200 170" fill="none" stroke="#d50000" strokeWidth="8" strokeLinecap="round" />
                    {/* Gold chains sashes */}
                    <path d="M 90 240 Q 150 280 210 240 M 90 270 Q 150 310 210 270" fill="none" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'clothes_sea_explorer':
            return (
                <g>
                    {/* 冒险家航海裙 - Victorian explorer beige corset + ruffled white collar */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#fffde7" stroke="#ffd54f" strokeWidth="3" />
                    {/* Beige corset bodice with gold laces */}
                    <path d="M 100 240 C 100 240, 85 340, 100 450 L 200 450 C 215 340, 200 240, 200 240 Z" fill="#ffe082" stroke="#ffb300" strokeWidth="2" />
                    <path d="M 132 260 L 168 280 M 132 280 L 168 260 M 135 300 L 165 320 M 135 320 L 165 300" stroke="#8d6e63" strokeWidth="2" />
                </g>
            );
        case 'clothes_phantom_tux':
            return (
                <g>
                    {/* 幽冥燕尾服 - Dark gothic vampire tailcoat cape + red interior + pumpkin brooch */}
                    {/* Cape wings backdrop */}
                    <path d="M 40 250 C 0 350, 40 450, 100 450 L 200 450 C 260 450, 300 350, 260 250 Z" fill="#d50000" stroke="#b71c1c" strokeWidth="2" />
                    {/* Black outer tailcoat */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#212121" stroke="#333" strokeWidth="3" />
                    {/* White ruffled collar jabot */}
                    <path d="M 105 180 Q 150 215 195 180" fill="none" stroke="#fafafa" strokeWidth="12" strokeLinecap="round" />
                    {/* Small pumpkin badge brooch */}
                    <circle cx="180" cy="240" r="6" fill="#ff9100" stroke="#333" strokeWidth="1" />
                    <path d="M 179 234 L 181 234" stroke="#4caf50" strokeWidth="2" />
                </g>
            );
        case 'clothes_vampire_queen':
            return (
                <g>
                    {/* 暗夜女巫裙 - Gothic red-and-black corset gown + golden bat wing */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#212121" stroke="#333" strokeWidth="3" />
                    {/* Red corset center */}
                    <path d="M 110 240 C 110 240, 95 340, 110 450 L 190 450 C 205 340, 190 240, 190 240 Z" fill="#d50000" stroke="#b71c1c" strokeWidth="2" />
                    {/* Golden bat wing on left shoulder */}
                    <path d="M 230 200 L 260 210 L 245 225 L 265 240 L 220 230 Z" fill="#ffb300" stroke="#ffd700" strokeWidth="1.5" />
                </g>
            );
        case 'clothes_yi_ethnic':
            return (
                <g>
                    {/* 彝锦豪情 - Ethnic Yi dark blue robe + white-patterned shoulder wrap + silver coins */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#0d47a1" stroke="#002171" strokeWidth="3" />
                    {/* White patterned shoulder wrap sash */}
                    <path d="M 90 200 L 210 380" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
                    {/* Silver coin patterns */}
                    <circle cx="120" cy="245" r="4.5" fill="#cfd8dc" stroke="#333" />
                    <circle cx="140" cy="275" r="4.5" fill="#cfd8dc" stroke="#333" />
                    <circle cx="160" cy="305" r="4.5" fill="#cfd8dc" stroke="#333" />
                    {/* Red waist sash belt */}
                    <rect x="72" y="360" width="156" height="15" fill="#d50000" stroke="#333" />
                </g>
            );
        case 'clothes_silkroad_costume':
            return (
                <g>
                    {/* 丝路霓裳 - Traditional Silk Road orange dancer gown + gold collars */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#ff7043" stroke="#d84315" strokeWidth="3" />
                    {/* Gold layered chest plate collars */}
                    <path d="M 100 170 Q 150 215 200 170" fill="none" stroke="#ffd700" strokeWidth="12" strokeLinecap="round" />
                    {/* Hanging gem bead necklaces */}
                    <circle cx="125" cy="210" r="3.5" fill="#ff4081" stroke="#333" />
                    <circle cx="150" cy="220" r="3.5" fill="#00e5ff" stroke="#333" />
                    <circle cx="175" cy="210" r="3.5" fill="#ff4081" stroke="#333" />
                </g>
            );
        case 'clothes_king_royal':
            return (
                <g>
                    {/* 国王新衣 - Royal red medieval king coat + playing card spade prints */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#d50000" stroke="#b71c1c" strokeWidth="3" />
                    {/* White fur-trimmed shoulders */}
                    <path d="M 60 250 C 65 200, 120 190, 120 190" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 240 250 C 235 200, 180 190, 180 190" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                    {/* Black playing-card spade print in center vest */}
                    <polygon points="120,240 180,240 170,450 130,450" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* Black spade symbols */}
                    <circle cx="144" cy="280" r="5" fill="#212121" />
                    <circle cx="156" cy="280" r="5" fill="#212121" />
                    <polygon points="150,265 159,280 141,280" fill="#212121" />
                    <polygon points="150,280 154,295 146,295" fill="#212121" />
                </g>
            );
        case 'clothes_queen_royal':
            return (
                <g>
                    {/* 王后华服 - Royal medieval blue dress + enormous standing white ruff collar */}
                    {/* Enormous standing white ruff lace collar */}
                    <path d="M 75 220 C 50 150, 250 150, 225 220 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="2" />
                    <path d="M 75 220 C 50 150, 250 150, 225 220 Z" fill="none" stroke="#b0bec5" strokeWidth="1" strokeDasharray="3,4" />
                    {/* Blue dress */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="3" />
                </g>
            );
        case 'clothes_punk_boy':
            return (
                <g>
                    {/* 朋克少年 - Grunge dark grey short sleeve + black tee + chunky chains */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#424242" stroke="#212121" strokeWidth="3" />
                    {/* Black inner tee shirt */}
                    <path d="M 100 230 L 150 290 L 200 230 L 210 450 L 90 450 Z" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    {/* Chunky silver pendant chains */}
                    <path d="M 110 200 Q 150 240 190 200" fill="none" stroke="#cfd8dc" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="150" cy="225" r="4.5" fill="#fbc02d" stroke="#333" />
                </g>
            );
        case 'clothes_y2k_girl':
            return (
                <g>
                    {/* Y2K女孩 - Y2K light blue off-shoulder corset top + pink choker */}
                    <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#80deea" stroke="#00acc1" strokeWidth="3" />
                    {/* Light blue sleeves wraps */}
                    <path d="M 50 250 L 35 270 Q 25 320 50 350" fill="none" stroke="#e0f7fa" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 250 250 L 265 270 Q 275 320 250 350" fill="none" stroke="#e0f7fa" strokeWidth="8" strokeLinecap="round" />
                    {/* Dark pink choker collar */}
                    <path d="M 110 170 Q 150 190 190 170" fill="none" stroke="#ff4081" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="150" cy="183" r="3.5" fill="#00e5ff" />
                </g>
            );

        default:
            return (
                <path d="M 150 450 C 50 450, 0 350, 40 250 C 80 150, 220 150, 260 250 C 300 350, 250 450, 150 450 Z" fill="#f5f5f5" stroke="#333" strokeWidth="3" />
            );
    }
}

function renderHair(hair: string) {
    // Local head coordinates: Center cx=150, cy=110, r=70
    // Face features: eyes at x=120, x=180, cy=110; mouth at y=130-135
    switch (hair) {
        case 'hair_icesilk':
            return (
                <g>
                    {/* Back hair */}
                    <path d="M 80 110 C 60 200, 40 300, 70 350" fill="none" stroke="#e0e0e0" strokeWidth="20" strokeLinecap="round" />
                    <path d="M 220 110 C 240 200, 260 300, 230 350" fill="none" stroke="#e0e0e0" strokeWidth="20" strokeLinecap="round" />
                    {/* Front hair / bangs */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#e0e0e0" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 150 40 L 140 90 L 160 90 Z" fill="#e0e0e0" />
                </g>
            );
        case 'hair_lazy_halfup':
            return (
                <g>
                    {/* 慵懒半扎发 - Messy brown hair, low side braid/ponytail */}
                    <path d="M 90 150 Q 50 220 65 300" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" strokeDasharray="30 10" />
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 110 75 Q 140 100 120 120" fill="none" stroke="#5d4037" strokeWidth="15" strokeLinecap="round" />
                    <path d="M 190 75 Q 160 100 180 120" fill="none" stroke="#5d4037" strokeWidth="15" strokeLinecap="round" />
                </g>
            );
        case 'hair_golden_braids':
            return (
                <g>
                    {/* 金丝编花瓣 - Golden wavy hair with side braids */}
                    <path d="M 75 140 Q 40 220 70 300" fill="none" stroke="#fbc02d" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 225 140 Q 260 220 230 300" fill="none" stroke="#fbc02d" strokeWidth="16" strokeLinecap="round" />
                    {/* Braids loops */}
                    <path d="M 85 120 Q 60 150 85 180" fill="none" stroke="#f57f17" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 215 120 Q 240 150 215 180" fill="none" stroke="#f57f17" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="68" cy="150" r="4" fill="#e53935" />
                    <circle cx="232" cy="150" r="4" fill="#e53935" />
                    {/* Bangs */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#fbc02d" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 150 40 Q 130 90 145 105" fill="none" stroke="#fbc02d" strokeWidth="12" strokeLinecap="round" />
                </g>
            );
        case 'hair_green_elf':
            return (
                <g>
                    {/* 林间倦缕 - Ash-green elf hair, pointy ears, long side braid */}
                    <path d="M 220 140 Q 250 240 230 330" fill="none" stroke="#66bb6a" strokeWidth="16" strokeLinecap="round" strokeDasharray="25 8" />
                    {/* Pointy Elf Ears */}
                    <path d="M 80 110 L 45 90 L 80 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    <path d="M 220 110 L 255 90 L 220 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    {/* Hair */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#66bb6a" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 110 70 Q 150 95 130 115" fill="none" stroke="#66bb6a" strokeWidth="15" strokeLinecap="round" />
                </g>
            );
        case 'hair_silver_elf':
            return (
                <g>
                    {/* 银缕垂瓣 - Silver long wavy hair, pointy ears, braids, cyan gems */}
                    <path d="M 75 140 Q 40 240 60 340" fill="none" stroke="#cfd8dc" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 225 140 Q 260 240 240 340" fill="none" stroke="#cfd8dc" strokeWidth="16" strokeLinecap="round" />
                    {/* Braids */}
                    <path d="M 85 130 L 75 220" stroke="#90a4ae" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 215 130 L 225 220" stroke="#90a4ae" strokeWidth="5" strokeLinecap="round" />
                    {/* Cyan gem beads */}
                    <circle cx="75" cy="220" r="6" fill="#00e5ff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="225" cy="220" r="6" fill="#00e5ff" stroke="#333" strokeWidth="1.5" />
                    {/* Pointy Elf Ears */}
                    <path d="M 80 110 L 45 95 L 80 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    <path d="M 220 110 L 255 95 L 220 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    {/* Bangs */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#cfd8dc" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 150 40 Q 170 90 155 105" fill="none" stroke="#cfd8dc" strokeWidth="12" strokeLinecap="round" />
                </g>
            );
        case 'hair_scholar_topknot':
            return (
                <g>
                    {/* 翩翩公子束发 - Traditional black topknot with gold crown, jade stick, red sashes */}
                    {/* Hanging red sashes behind shoulders */}
                    <path d="M 90 140 Q 60 220 80 320" fill="none" stroke="#d84315" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 210 140 Q 240 220 220 320" fill="none" stroke="#d84315" strokeWidth="5" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Topknot bun */}
                    <circle cx="150" cy="30" r="22" fill="#212121" stroke="#333" strokeWidth="2" />
                    {/* Gold crown */}
                    <path d="M 132 30 L 138 12 L 150 22 L 162 12 L 168 30 Z" fill="#ffd54f" stroke="#ff8f00" strokeWidth="2" />
                    {/* Green Jade Stick */}
                    <line x1="120" y1="28" x2="180" y2="28" stroke="#4caf50" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_noble_updo':
            return (
                <g>
                    {/* 国风贵女盘发 - Elegant dark brown high updo, plum blossoms, gold pins, pink sash */}
                    {/* Pink sash */}
                    <path d="M 215 140 Q 245 230 225 330" fill="none" stroke="#ff4081" strokeWidth="6" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* High updo bun */}
                    <ellipse cx="150" cy="32" rx="30" ry="18" fill="#3e2723" stroke="#333" strokeWidth="2" />
                    <ellipse cx="150" cy="32" rx="15" ry="8" fill="#5d4037" />
                    {/* Gold pins */}
                    <line x1="110" y1="28" x2="140" y2="38" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" />
                    <line x1="190" y1="28" x2="160" y2="38" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" />
                    {/* Red plum blossoms */}
                    <circle cx="132" cy="40" r="5" fill="#e53935" />
                    <circle cx="168" cy="40" r="5" fill="#e53935" />
                    <circle cx="150" cy="45" r="4" fill="#e53935" />
                </g>
            );
        case 'hair_energetic_highlight':
            return (
                <g>
                    {/* 元气挑染碎盖 - Short brown crop fringe with reddish highlights */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Messy spikes */}
                    <path d="M 95 80 L 105 105 L 115 85 L 130 110 L 140 85 L 155 110 L 165 85 L 180 110 L 190 85 L 205 105" fill="none" stroke="#4e342e" strokeWidth="15" strokeLinecap="round" />
                    {/* Reddish highlights */}
                    <path d="M 105 105 L 115 85" stroke="#e53935" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 155 110 L 165 85" stroke="#e53935" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 180 110 L 190 85" stroke="#e53935" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'hair_gentle_chinese':
            return (
                <g>
                    {/* 温婉中式半扎发 - Straight dark brown half-up bun, gold pins, red sashes */}
                    {/* Back long hair */}
                    <path d="M 85 145 C 70 220, 60 280, 80 350" fill="none" stroke="#2d1d17" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 215 145 C 230 220, 240 280, 220 350" fill="none" stroke="#2d1d17" strokeWidth="18" strokeLinecap="round" />
                    {/* Red hanging sashes */}
                    <path d="M 130 110 Q 110 180 120 260" fill="none" stroke="#d84315" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 170 110 Q 190 180 180 260" fill="none" stroke="#d84315" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Hair bangs */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#2d1d17" strokeWidth="25" strokeLinecap="round" />
                    {/* Half up bun */}
                    <circle cx="150" cy="38" r="18" fill="#2d1d17" stroke="#333" strokeWidth="1.5" />
                    {/* Gold flowers & pins */}
                    <circle cx="138" cy="38" r="6" fill="#ffd700" stroke="#ff8f00" strokeWidth="1" />
                    <circle cx="162" cy="38" r="6" fill="#ffd700" stroke="#ff8f00" strokeWidth="1" />
                    <line x1="125" y1="28" x2="175" y2="48" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'hair_platinum_short':
            return (
                <g>
                    {/* 矜贵白金短发 - Neat platinum short hair parted elegantly */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#fffde7" strokeWidth="25" strokeLinecap="round" />
                    {/* Side part styling */}
                    <path d="M 125 50 Q 140 100 135 115" fill="none" stroke="#fff59d" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 140 45 Q 165 100 185 115" fill="none" stroke="#fff59d" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'hair_blonde_waves':
            return (
                <g>
                    {/* 魅力波浪卷 - Flowing golden blonde side swept waves */}
                    <path d="M 75 130 C 50 200, 30 270, 50 330" fill="none" stroke="#ffeb3b" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 130 C 250 200, 270 270, 250 330" fill="none" stroke="#ffeb3b" strokeWidth="18" strokeLinecap="round" />
                    {/* Waves sweeps */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#ffeb3b" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 100 65 Q 130 95 110 115" fill="none" stroke="#fbc02d" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 140 50 Q 185 100 170 125" fill="none" stroke="#fbc02d" strokeWidth="14" strokeLinecap="round" />
                </g>
            );
        case 'hair_flared_short':
            return (
                <g>
                    {/* 元气翘边短发 - Layered light brown short hair, cute flared ends */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#a1887f" strokeWidth="25" strokeLinecap="round" />
                    {/* Flared ends */}
                    <path d="M 75 125 Q 55 155 45 150" fill="none" stroke="#a1887f" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 225 125 Q 245 155 255 150" fill="none" stroke="#a1887f" strokeWidth="12" strokeLinecap="round" />
                </g>
            );
        case 'hair_princess_curls':
            return (
                <g>
                    {/* 百变千金卷 - Golden brown long princess drills, red ribbon bow, pearls, gold stars */}
                    {/* Long drills curls */}
                    <path d="M 70 140 Q 40 200 45 260 Q 50 320 70 330" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 230 140 Q 260 200 255 260 Q 250 320 230 330" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#8d6e63" strokeWidth="25" strokeLinecap="round" />
                    {/* Red ribbon bow on top */}
                    <g transform="translate(150, 42)">
                        <rect x="-15" y="-6" width="30" height="12" fill="#d84315" rx="3" stroke="#333" strokeWidth="1.5" />
                        <path d="M -15 0 C -35 -15, -35 15, -15 0" fill="#d84315" stroke="#333" strokeWidth="1.5" />
                        <path d="M 15 0 C 35 -15, 35 15, 15 0" fill="#d84315" stroke="#333" strokeWidth="1.5" />
                    </g>
                    {/* Pearl arch */}
                    <path d="M 115 50 Q 150 35 185 50" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="4 4" />
                    {/* Gold stars */}
                    <path d="M 140 18 L 143 23 L 148 23 L 144 26 L 146 31 L 140 28 L 134 31 L 136 26 L 132 23 L 137 23 Z" fill="#ffd54f" />
                    <path d="M 160 18 L 163 23 L 168 23 L 164 26 L 166 31 L 160 28 L 154 31 L 156 26 L 152 23 L 157 23 Z" fill="#ffd54f" />
                </g>
            );
        case 'hair_fox_ears':
            return (
                <g>
                    {/* 银狐碎影短发 - Messy ash brown short hair, furry fox ears on top */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#78909c" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 105 85 L 120 110 M 195 85 L 180 110" stroke="#78909c" strokeWidth="12" strokeLinecap="round" />
                    {/* Furry Fox Ears */}
                    <g transform="translate(0, 5)">
                        <path d="M 85 55 L 75 10 L 105 45 Z" fill="#78909c" stroke="#333" strokeWidth="2" />
                        <path d="M 83 48 L 78 20 L 96 40 Z" fill="#ffcdd2" />
                        <path d="M 215 55 L 225 10 L 195 45 Z" fill="#78909c" stroke="#333" strokeWidth="2" />
                        <path d="M 217 48 L 222 20 L 204 40 Z" fill="#ffcdd2" />
                    </g>
                </g>
            );
        case 'hair_clearsky_curls':
            return (
                <g>
                    {/* 晴空少年短卷发 - Ash grey short messy curly hair */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#90a4ae" strokeWidth="25" strokeLinecap="round" />
                    {/* Curls details */}
                    <path d="M 90 75 Q 110 50 115 80" fill="none" stroke="#b0bec5" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 130 65 Q 150 40 155 70" fill="none" stroke="#b0bec5" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 170 70 Q 190 45 195 75" fill="none" stroke="#b0bec5" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_rosy_sunset':
            return (
                <g>
                    {/* 烟霞漫步垂发 - Long wavy ash brown hair, light blue beads, crystal drops */}
                    <path d="M 75 140 C 45 220, 40 300, 65 350" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 260 300, 235 350" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    {/* Bangs */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#8d6e63" strokeWidth="25" strokeLinecap="round" />
                    {/* Light blue beads */}
                    <path d="M 90 90 Q 150 50 210 90" fill="none" stroke="#80deea" strokeWidth="4" strokeDasharray="6 6" />
                    {/* Hanging crystal drops */}
                    <circle cx="100" cy="115" r="4" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                    <path d="M 100 119 L 100 128" stroke="#333" strokeWidth="1" />
                    <circle cx="200" cy="115" r="4" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                    <path d="M 200 119 L 200 128" stroke="#333" strokeWidth="1" />
                </g>
            );
        case 'hair_yi_scarf':
            return (
                <g>
                    {/* 彝族头巾 - Wrapped dark blue ethnic headscarf, silver embroidery, left tassel */}
                    {/* Large wrapped headscarf */}
                    <path d="M 75 110 C 60 70, 90 25, 150 25 C 210 25, 240 70, 225 110 C 210 135, 90 135, 75 110 Z" fill="#1a237e" stroke="#333" strokeWidth="3.5" />
                    <path d="M 75 110 Q 150 50 225 110" fill="none" stroke="#3949ab" strokeWidth="8" />
                    {/* Silver embroidery circles */}
                    <circle cx="110" cy="70" r="8" fill="none" stroke="#eceff1" strokeWidth="2.5" strokeDasharray="3 2" />
                    <circle cx="150" cy="55" r="8" fill="none" stroke="#eceff1" strokeWidth="2.5" strokeDasharray="3 2" />
                    <circle cx="190" cy="70" r="8" fill="none" stroke="#eceff1" strokeWidth="2.5" strokeDasharray="3 2" />
                    {/* Long hanging left tassel */}
                    <path d="M 75 105 Q 40 180 50 260" fill="none" stroke="#eceff1" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="50" cy="265" r="5" fill="#f44336" />
                </g>
            );
        case 'hair_uyghur_cap':
            return (
                <g>
                    {/* 维吾尔族花帽 - Red square square-topped cap, gold chains, two long braids */}
                    {/* Two long dark braids behind shoulders */}
                    <path d="M 75 140 Q 40 240 60 340" fill="none" stroke="#212121" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 225 140 Q 260 240 240 340" fill="none" stroke="#212121" strokeWidth="12" strokeLinecap="round" />
                    {/* Gold bands at end of braids */}
                    <rect x="52" y="325" width="16" height="8" fill="#ffd700" stroke="#333" strokeWidth="1.5" />
                    <rect x="232" y="325" width="16" height="8" fill="#ffd700" stroke="#333" strokeWidth="1.5" />
                    {/* Black bangs hair */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Uyghur Cap */}
                    <path d="M 105 60 L 120 25 L 180 25 L 195 60 Z" fill="#d84315" stroke="#333" strokeWidth="2.5" />
                    {/* Floral embroidery and gold beads */}
                    <path d="M 120 25 L 150 45 L 180 25" fill="none" stroke="#ffeb3b" strokeWidth="2" />
                    <circle cx="150" cy="45" r="5" fill="#e53935" />
                    {/* Hanging gold chains */}
                    <path d="M 100 65 Q 150 95 200 65" fill="none" stroke="#ffd700" strokeWidth="3.5" strokeDasharray="4 4" />
                </g>
            );
        case 'hair_king_crown':
            return (
                <g>
                    {/* 国王K的王冠 - Gold crown, red velvet lining, wavy light blonde hair */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#fff176" strokeWidth="25" strokeLinecap="round" />
                    {/* Wavy side locks */}
                    <path d="M 75 120 Q 55 170 70 200" fill="none" stroke="#fff176" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 225 120 Q 245 170 230 200" fill="none" stroke="#fff176" strokeWidth="14" strokeLinecap="round" />
                    {/* Crown */}
                    <g transform="translate(0, 5)">
                        {/* Red velvet inside */}
                        <path d="M 115 50 Q 150 20 185 50 Z" fill="#b71c1c" />
                        {/* Gold spikes crown */}
                        <path d="M 110 55 L 115 25 L 132 40 L 150 15 L 168 40 L 185 25 L 190 55 Z" fill="#ffd700" stroke="#ff8f00" strokeWidth="2.5" />
                        <rect x="110" y="50" width="80" height="8" fill="#ffd700" stroke="#ff8f00" strokeWidth="1.5" />
                        {/* Jewels */}
                        <circle cx="150" cy="15" r="4" fill="#0288d1" />
                        <circle cx="115" cy="25" r="3" fill="#e53935" />
                        <circle cx="185" cy="25" r="3" fill="#e53935" />
                        <circle cx="150" cy="54" r="3.5" fill="#4caf50" />
                    </g>
                </g>
            );
        case 'hair_queen_tiara':
            return (
                <g>
                    {/* 王后Q的水晶 - Towering gold tiara/crown, curly golden hair */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#ffca28" strokeWidth="25" strokeLinecap="round" />
                    {/* Golden shoulder waves */}
                    <path d="M 75 130 Q 50 200 65 270" fill="none" stroke="#ffca28" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 225 130 Q 250 200 235 270" fill="none" stroke="#ffca28" strokeWidth="16" strokeLinecap="round" />
                    {/* Tiara */}
                    <g transform="translate(0, 5)">
                        <path d="M 115 52 L 122 10 L 138 35 L 150 2 L 162 35 L 178 10 L 185 52 Z" fill="#ffd700" stroke="#ff8f00" strokeWidth="2" />
                        {/* Blue diamonds sparkles */}
                        <circle cx="150" cy="2" r="4" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                        <circle cx="122" cy="10" r="3" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                        <circle cx="178" cy="10" r="3" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                        {/* Pearls rim */}
                        <path d="M 118 50 Q 150 42 182 50" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="3 3" />
                    </g>
                </g>
            );
        case 'hair_xiaosheng_cap':
            return (
                <g>
                    {/* 小生头面 - Traditional Chinese opera scholar cap, blue/yellow/gold embroidery, butterfly sashes */}
                    {/* Black base hair */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Scholar Cap */}
                    <path d="M 100 70 L 110 25 L 190 25 L 200 70 Z" fill="#0d47a1" stroke="#333" strokeWidth="2.5" />
                    <rect x="110" y="25" width="80" height="8" fill="#ffb300" stroke="#333" strokeWidth="1.5" />
                    <circle cx="150" cy="50" r="10" fill="#d84315" stroke="#333" strokeWidth="2" />
                    <circle cx="150" cy="50" r="4" fill="#fff" />
                    {/* Butterfly wing sashes */}
                    <g transform="translate(60, 45)">
                        <path d="M 40 0 Q 0 -30 10 -40 Q 50 -10 40 0 Z" fill="#ffb300" stroke="#333" strokeWidth="1.5" />
                        <path d="M 40 -5 Q 20 -20 30 -25" fill="none" stroke="#d84315" strokeWidth="2.5" />
                    </g>
                    <g transform="translate(200, 45) scale(-1, 1)">
                        <path d="M 40 0 Q 0 -30 10 -40 Q 50 -10 40 0 Z" fill="#ffb300" stroke="#333" strokeWidth="1.5" />
                        <path d="M 40 -5 Q 20 -20 30 -25" fill="none" stroke="#d84315" strokeWidth="2.5" />
                    </g>
                </g>
            );
        case 'hair_huadan_headdress':
            return (
                <g>
                    {/* 花旦头面 - Traditional opera female headdress, red flower balls, gold pins, pearls, braids */}
                    {/* Two long black braids */}
                    <path d="M 85 140 L 75 300" stroke="#212121" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 215 140 L 225 300" stroke="#212121" strokeWidth="8" strokeLinecap="round" />
                    {/* Headdress frame */}
                    <path d="M 90 70 Q 150 15 210 70" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Gold pins needles */}
                    <line x1="80" y1="40" x2="110" y2="60" stroke="#ffd700" strokeWidth="3" />
                    <line x1="220" y1="40" x2="190" y2="60" stroke="#ffd700" strokeWidth="3" />
                    {/* Red flower balls */}
                    <circle cx="100" cy="45" r="9" fill="#d84315" stroke="#b71c1c" strokeWidth="1.5" />
                    <circle cx="125" cy="30" r="9" fill="#d84315" stroke="#b71c1c" strokeWidth="1.5" />
                    <circle cx="150" cy="22" r="10" fill="#d84315" stroke="#b71c1c" strokeWidth="1.5" />
                    <circle cx="175" cy="30" r="9" fill="#d84315" stroke="#b71c1c" strokeWidth="1.5" />
                    <circle cx="200" cy="45" r="9" fill="#d84315" stroke="#b71c1c" strokeWidth="1.5" />
                    {/* Pearl drops */}
                    <path d="M 92 68 Q 150 48 208 68" fill="none" stroke="#fff" strokeWidth="4.5" strokeDasharray="5 5" />
                </g>
            );
        case 'hair_elf_short':
            return (
                <g>
                    {/* 森之精灵短发 - Light blonde/beige short parted hair, pointy elf ears */}
                    {/* Pointy Elf Ears */}
                    <path d="M 80 110 L 45 92 L 80 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    <path d="M 220 110 L 255 92 L 220 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    {/* Hair */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#f5f5dc" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 120 60 Q 140 100 132 118" fill="none" stroke="#e6e6fa" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_elf_long':
            return (
                <g>
                    {/* 森之精灵长发 - White/silver flowing hair, pointy elf ears, green vine braids */}
                    <path d="M 75 140 C 45 220, 35 300, 55 360" fill="none" stroke="#fafafa" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 300, 245 360" fill="none" stroke="#fafafa" strokeWidth="18" strokeLinecap="round" />
                    {/* Green vines wrapping */}
                    <path d="M 70 160 Q 50 240 60 300" fill="none" stroke="#4caf50" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 230 160 Q 250 240 240 300" fill="none" stroke="#4caf50" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="53" cy="200" r="3" fill="#81c784" />
                    <circle cx="247" cy="200" r="3" fill="#81c784" />
                    <circle cx="57" cy="250" r="3" fill="#81c784" />
                    <circle cx="243" cy="250" r="3" fill="#81c784" />
                    {/* Pointy Elf Ears */}
                    <path d="M 80 110 L 45 92 L 80 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    <path d="M 220 110 L 255 92 L 220 120 Z" fill="#ffe0cc" stroke="#333" strokeWidth="2.5" />
                    {/* Front hair */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#fafafa" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_chunli_buns':
            return (
                <g>
                    {/* 中国娃娃春丽头 - High buns wrapped in white silk, red pom-poms, low small ponytails */}
                    {/* Small low ponytails */}
                    <path d="M 85 140 Q 60 190 70 240" fill="none" stroke="#424242" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 215 140 Q 240 190 230 240" fill="none" stroke="#424242" strokeWidth="8" strokeLinecap="round" />
                    {/* Black hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#424242" strokeWidth="25" strokeLinecap="round" />
                    {/* High round buns */}
                    <circle cx="90" cy="40" r="22" fill="#424242" stroke="#333" strokeWidth="2" />
                    <circle cx="210" cy="40" r="22" fill="#424242" stroke="#333" strokeWidth="2" />
                    {/* White silk wraps */}
                    <circle cx="90" cy="40" r="22" fill="none" stroke="#ffffff" strokeWidth="5.5" opacity="0.9" />
                    <circle cx="210" cy="40" r="22" fill="none" stroke="#ffffff" strokeWidth="5.5" opacity="0.9" />
                    {/* Red ribbons/pompoms & gold coins */}
                    <circle cx="90" cy="62" r="7" fill="#d84315" />
                    <circle cx="90" cy="62" r="3.5" fill="#ffd700" />
                    <circle cx="210" cy="62" r="7" fill="#d84315" />
                    <circle cx="210" cy="62" r="3.5" fill="#ffd700" />
                </g>
            );
        case 'hair_lion_dance':
            return (
                <g>
                    {/* 龙年款醒狮头 - Orange/white lion dance headpiece covering hair */}
                    {/* Back black hair showing slightly */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Lion mask base */}
                    <path d="M 75 110 C 60 40, 95 10, 150 10 C 205 10, 240 40, 225 110 C 220 130, 80 130, 75 110 Z" fill="#ff6d00" stroke="#333" strokeWidth="3" />
                    {/* White fur trim brow */}
                    <path d="M 70 85 Q 150 60 230 85" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
                    {/* Cute big eyes */}
                    <circle cx="110" cy="60" r="16" fill="#fff" stroke="#333" strokeWidth="2" />
                    <circle cx="110" cy="60" r="8" fill="#212121" />
                    <circle cx="114" cy="56" r="3" fill="#fff" />
                    <circle cx="190" cy="60" r="16" fill="#fff" stroke="#333" strokeWidth="2" />
                    <circle cx="190" cy="60" r="8" fill="#212121" />
                    <circle cx="194" cy="56" r="3" fill="#fff" />
                    {/* Lion nose/muzzle */}
                    <circle cx="150" cy="75" r="9" fill="#ffeb3b" stroke="#333" strokeWidth="1.5" />
                    <rect x="145" y="70" width="10" height="5" fill="#ff6d00" rx="1.5" />
                    {/* White pom-poms hanging on the sides */}
                    <path d="M 70 105 L 55 150" stroke="#333" strokeWidth="2.5" />
                    <circle cx="55" cy="150" r="10" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
                    <path d="M 230 105 L 245 150" stroke="#333" strokeWidth="2.5" />
                    <circle cx="245" cy="150" r="10" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
                </g>
            );
        case 'hair_double_gold_buns':
            return (
                <g>
                    {/* 金簪双髻 - Traditional Chinese double-updo buns, gold pins, red sashes */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Two high buns */}
                    <circle cx="95" cy="38" r="18" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    <circle cx="205" cy="38" r="18" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    {/* Gold pins bar */}
                    <line x1="75" y1="28" x2="115" y2="48" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                    <line x1="225" y1="28" x2="185" y2="48" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                    {/* Red sashes */}
                    <path d="M 95 48 Q 75 120 85 180" fill="none" stroke="#d84315" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 205 48 Q 225 120 215 180" fill="none" stroke="#d84315" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'hair_single_silver_bun':
            return (
                <g>
                    {/* 银簪发髻 - High single bun, silver hairpiece, jade bead, grey satin wrap */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* High single bun updo */}
                    <circle cx="150" cy="32" r="22" fill="#3e2723" stroke="#333" strokeWidth="2" />
                    {/* Grey satin wrap */}
                    <ellipse cx="150" cy="45" rx="20" ry="6" fill="#90a4ae" stroke="#333" strokeWidth="1.5" />
                    {/* Silver pin */}
                    <line x1="120" y1="24" x2="180" y2="24" stroke="#cfd8dc" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Jade bead */}
                    <circle cx="180" cy="24" r="6" fill="#a5d6a7" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hair_rabbit_helmet':
            return (
                <g>
                    {/* 宇航兔头盔 - White astronaut helmet with standing rabbit ears, glass visor, decals */}
                    {/* Black base hair showing slightly behind */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* White Helmet Dome */}
                    <circle cx="150" cy="110" r="75" fill="#fafafa" stroke="#cfd8dc" strokeWidth="3" />
                    {/* Holographic transparent glass visor opening for face */}
                    <circle cx="150" cy="110" r="55" fill="none" stroke="#80deea" strokeWidth="4.5" />
                    <path d="M 100 80 Q 150 60 200 80" fill="none" stroke="#80deea" strokeWidth="3" opacity="0.6" />
                    {/* Standing rabbit ears on top */}
                    <path d="M 120 40 Q 100 -20 115 -25 Q 130 -20 135 40 Z" fill="#fafafa" stroke="#cfd8dc" strokeWidth="2" />
                    <path d="M 122 35 Q 110 -10 118 -12 Q 126 -10 128 35 Z" fill="#ffcdd2" />
                    <path d="M 180 40 Q 200 -20 185 -25 Q 170 -20 165 40 Z" fill="#fafafa" stroke="#cfd8dc" strokeWidth="2" />
                    <path d="M 178 35 Q 190 -10 182 -12 Q 174 -10 172 35 Z" fill="#ffcdd2" />
                    {/* Pink Decals */}
                    <circle cx="95" cy="140" r="4" fill="#ff80ab" />
                    <circle cx="205" cy="140" r="4" fill="#ff80ab" />
                </g>
            );
        case 'hair_laser_goggles':
            return (
                <g>
                    {/* 镭射护目镜 - Dark grey headband, wrap-around reflective rainbow laser visor */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#424242" strokeWidth="25" strokeLinecap="round" />
                    {/* Headband across forehead */}
                    <path d="M 85 92 Q 150 78 215 92" fill="none" stroke="#263238" strokeWidth="12" strokeLinecap="round" />
                    {/* Visor shield */}
                    <path d="M 90 98 Q 150 82 210 98 L 205 125 Q 150 110 95 125 Z" fill="#00e5ff" opacity="0.85" stroke="#333" strokeWidth="1.5" />
                    <path d="M 95 104 Q 150 90 205 104" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
                    <path d="M 120 116 L 180 102" stroke="#ff4081" strokeWidth="2" opacity="0.9" />
                </g>
            );
        case 'hair_pearl_updo':
            return (
                <g>
                    {/* 珍珠云顶髻 - Elegant high updo, pearls, gold hairpins, right gold tassel */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* High updo bun */}
                    <ellipse cx="150" cy="32" rx="26" ry="18" fill="#4e342e" stroke="#333" strokeWidth="1.5" />
                    {/* Rows of white pearls */}
                    <path d="M 128 42 Q 150 32 172 42" fill="none" stroke="#fff" strokeWidth="4.5" strokeDasharray="4 4" />
                    {/* Gold pins */}
                    <line x1="115" y1="28" x2="135" y2="38" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                    <line x1="185" y1="28" x2="165" y2="38" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                    {/* Hanging gold tassel on the right */}
                    <path d="M 175 38 Q 200 110 190 180" fill="none" stroke="#ffd700" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="190" cy="180" r="4.5" fill="#d84315" />
                </g>
            );
        case 'hair_jade_crown':
            return (
                <g>
                    {/* 青玉束发 - Modernized traditional half-up topknot bun with light-green jade crown */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Topknot bun cylinder */}
                    <rect x="135" y="16" width="30" height="24" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="2" rx="2" />
                    <ellipse cx="150" cy="16" rx="15" ry="4" fill="#81c784" />
                    <ellipse cx="150" cy="24" rx="15" ry="4" fill="none" stroke="#ffd700" strokeWidth="2.5" />
                </g>
            );
        case 'hair_headphones_fringe':
            return (
                <g>
                    {/* 超酷碎盖 - Messy brown fringe, white over-ear headphones */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    {/* Headphones headband arch */}
                    <path d="M 82 72 Q 150 35 218 72" fill="none" stroke="#eceff1" strokeWidth="8" strokeLinecap="round" />
                    {/* Padded ear cups */}
                    <rect x="68" y="90" width="14" height="32" rx="7" fill="#ffffff" stroke="#b0bec5" strokeWidth="2" />
                    <rect x="218" y="90" width="14" height="32" rx="7" fill="#ffffff" stroke="#b0bec5" strokeWidth="2" />
                </g>
            );
        case 'hair_quirky_braids':
            return (
                <g>
                    {/* 鬼马麻花辫 - Two cute side pigtail braids, colorful pins and hair ties */}
                    {/* Side braids */}
                    <path d="M 75 135 C 50 190, 45 230, 60 270" fill="none" stroke="#5d4037" strokeWidth="12" strokeLinecap="round" strokeDasharray="15 5" />
                    <path d="M 225 135 C 250 190, 255 230, 240 270" fill="none" stroke="#5d4037" strokeWidth="12" strokeLinecap="round" strokeDasharray="15 5" />
                    {/* Ties */}
                    <circle cx="70" cy="140" r="5.5" fill="#e91e63" />
                    <circle cx="230" cy="140" r="5.5" fill="#00e5ff" />
                    {/* Main hair */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    {/* Colorful pins on bangs */}
                    <line x1="110" y1="75" x2="122" y2="70" stroke="#ff4081" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="180" y1="75" x2="168" y2="70" stroke="#ffd54f" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="125" y1="65" x2="137" y2="60" stroke="#00e5ff" strokeWidth="4.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_headband_short':
            return (
                <g>
                    {/* 活力短发 - Active dark brown short hair, bright yellow headband */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Headband across forehead */}
                    <path d="M 85 92 Q 150 78 215 92" fill="none" stroke="#ffd54f" strokeWidth="10" strokeLinecap="round" />
                    <line x1="140" y1="84" x2="160" y2="86" stroke="#f57f17" strokeWidth="2" />
                </g>
            );
        case 'hair_ruyi_buns':
            return (
                <g>
                    {/* 如意丸子 - Double high buns, thin braids hanging, white clips */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Double high buns */}
                    <circle cx="85" cy="40" r="18" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    <circle cx="215" cy="40" r="18" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    {/* Thin braids hanging */}
                    <path d="M 80 120 L 70 200" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 220 120 L 230 200" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    {/* White clips */}
                    <path d="M 105 75 L 115 70" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 195 75 L 185 70" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'hair_lemon_headwear':
            return (
                <g>
                    {/* 柠必上岸头套 - large yellow lemon costume headwear enclosing head, green leaf, lemon slice */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Lemon body */}
                    <circle cx="150" cy="110" r="75" fill="#fff59d" stroke="#fbc02d" strokeWidth="4" />
                    {/* Face cut opening */}
                    <circle cx="150" cy="115" r="54" fill="#ffe0cc" stroke="#fbc02d" strokeWidth="2.5" />
                    {/* Eyes and mouth drawn again since headwear covers original */}
                    <circle cx="120" cy="110" r="6" fill="#333" />
                    <circle cx="180" cy="110" r="6" fill="#333" />
                    <path d="M 135 130 Q 150 145 165 130" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    {/* Green leaf on top */}
                    <path d="M 150 35 C 130 15, 130 -5, 150 -10 C 170 -5, 170 15, 150 35 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="2" />
                    {/* Lemon slice */}
                    <circle cx="170" cy="15" r="16" fill="#ffd54f" stroke="#fbc02d" strokeWidth="2" />
                    <line x1="170" y1="15" x2="160" y2="15" stroke="#fff" strokeWidth="2.5" />
                    <line x1="170" y1="15" x2="180" y2="15" stroke="#fff" strokeWidth="2.5" />
                    <line x1="170" y1="15" x2="170" y2="5" stroke="#fff" strokeWidth="2.5" />
                    <line x1="170" y1="15" x2="170" y2="25" stroke="#fff" strokeWidth="2.5" />
                </g>
            );
        case 'hair_apple_headwear':
            return (
                <g>
                    {/* 拒绝躺平头套 - large red apple costume headwear, brown stems */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Apple body */}
                    <circle cx="150" cy="110" r="75" fill="#ef5350" stroke="#d32f2f" strokeWidth="4" />
                    {/* Face cut opening */}
                    <circle cx="150" cy="115" r="54" fill="#ffe0cc" stroke="#d32f2f" strokeWidth="2.5" />
                    <circle cx="120" cy="110" r="6" fill="#333" />
                    <circle cx="180" cy="110" r="6" fill="#333" />
                    <path d="M 135 130 Q 150 145 165 130" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    {/* Apple stem antennas */}
                    <path d="M 135 35 Q 120 10 115 5" fill="none" stroke="#8d6e63" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 165 35 Q 180 10 185 5" fill="none" stroke="#8d6e63" strokeWidth="5.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_interstellar_blue':
            return (
                <g>
                    {/* 星际蓝调短发 - Messy layered dark blue crop, neon tip highlights */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#0d47a1" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 95 80 L 105 105 M 125 75 L 135 105 M 175 75 L 165 105 M 205 80 L 195 105" stroke="#0d47a1" strokeWidth="14" strokeLinecap="round" />
                    {/* Glowing tip highlights */}
                    <path d="M 105 95 L 105 105" stroke="#00e5ff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 135 95 L 135 105" stroke="#00e5ff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 165 95 L 165 105" stroke="#00e5ff" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'hair_starry_braids':
            return (
                <g>
                    {/* 星蓝银辉编发 - Silver white curly hair, blue side braid wraps, blue flowers */}
                    <path d="M 75 140 Q 45 220 65 300" fill="none" stroke="#eceff1" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 Q 255 220 235 300" fill="none" stroke="#eceff1" strokeWidth="18" strokeLinecap="round" />
                    {/* Blue ribbon wraps */}
                    <path d="M 60 170 L 70 190 M 55 210 L 65 230 M 240 170 L 230 190 M 245 210 L 235 230" stroke="#1e88e5" strokeWidth="3" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#eceff1" strokeWidth="25" strokeLinecap="round" />
                    {/* Blue flower pins */}
                    <circle cx="95" cy="75" r="5" fill="#29b6f6" stroke="#0288d1" strokeWidth="1" />
                    <circle cx="205" cy="75" r="5" fill="#29b6f6" stroke="#0288d1" strokeWidth="1" />
                </g>
            );
        case 'hair_chestnut_buzz':
            return (
                <g>
                    {/* 圆寸栗子头 - Buzzcut-style neat rounded crop */}
                    <circle cx="150" cy="110" r="70.5" fill="none" stroke="#4e342e" strokeWidth="13" />
                    {/* Clean fringe curve */}
                    <path d="M 85 95 Q 150 82 215 95" fill="none" stroke="#4e342e" strokeWidth="15" strokeLinecap="round" />
                </g>
            );
        case 'hair_boxing_braids':
            return (
                <g>
                    {/* 炫酷拳击辫 - Sporty dark braids with headband */}
                    {/* Braids behind */}
                    <path d="M 85 140 L 75 320" stroke="#3e2723" strokeWidth="9" strokeLinecap="round" strokeDasharray="20 6" />
                    <path d="M 215 140 L 225 320" stroke="#3e2723" strokeWidth="9" strokeLinecap="round" strokeDasharray="20 6" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Dark grey headband */}
                    <path d="M 85 92 Q 150 78 215 92" fill="none" stroke="#37474f" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'hair_curtain_bangs':
            return (
                <g>
                    {/* 八字刘海短发 - Stylish dark brown short hair with curtain bangs */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Curtain part */}
                    <path d="M 115 70 Q 135 110 110 112" fill="none" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 185 70 Q 165 110 190 112" fill="none" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" />
                </g>
            );
        case 'hair_sakura_headdress':
            return (
                <g>
                    {/* 粉樱霞缀簪花 - Traditional updo covered in layered pink plum blossoms, gold pins */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* High updo bun */}
                    <ellipse cx="150" cy="30" rx="28" ry="18" fill="#212121" />
                    {/* Layered pink blossoms */}
                    <circle cx="120" cy="40" r="9" fill="#f8bbd0" stroke="#e91e63" strokeWidth="1" />
                    <circle cx="120" cy="40" r="3" fill="#ffeb3b" />
                    <circle cx="150" cy="22" r="10" fill="#f8bbd0" stroke="#e91e63" strokeWidth="1" />
                    <circle cx="150" cy="22" r="3" fill="#ffeb3b" />
                    <circle cx="180" cy="40" r="9" fill="#f8bbd0" stroke="#e91e63" strokeWidth="1" />
                    <circle cx="180" cy="40" r="3" fill="#ffeb3b" />
                    <circle cx="135" cy="30" r="8" fill="#ff80ab" stroke="#e91e63" strokeWidth="1" />
                    <circle cx="165" cy="30" r="8" fill="#ff80ab" stroke="#e91e63" strokeWidth="1" />
                    {/* Gold hairpins */}
                    <line x1="90" y1="20" x2="115" y2="35" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                    <line x1="210" y1="20" x2="185" y2="35" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'hair_slickback_gentleman':
            return (
                <g>
                    {/* 绅士贵风侧背头 - Slicked-back formal neat gentleman hair */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Slickback combed waves */}
                    <path d="M 95 65 Q 140 35 185 55" fill="none" stroke="#3e2723" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 105 75 Q 140 45 195 65" fill="none" stroke="#3e2723" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 115 85 Q 145 55 205 75" fill="none" stroke="#3e2723" strokeWidth="5.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_feather_topknot':
            return (
                <g>
                    {/* 翎羽流光毽子头 - shuttlecock-style messy topknot with silver highlights */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Shuttlecock topknot bundle */}
                    <path d="M 135 45 L 120 5 L 150 20 L 180 5 L 165 45 Z" fill="#4e342e" stroke="#333" strokeWidth="1.5" />
                    {/* Silver highlights */}
                    <line x1="130" y1="35" x2="123" y2="10" stroke="#cfd8dc" strokeWidth="2.5" />
                    <line x1="170" y1="35" x2="177" y2="10" stroke="#cfd8dc" strokeWidth="2.5" />
                    {/* Green tie band */}
                    <rect x="133" y="38" width="34" height="6" fill="#4caf50" rx="1.5" stroke="#333" strokeWidth="1" />
                </g>
            );
        case 'hair_silver_fringe':
            return (
                <g>
                    {/* 冬霜白银碎盖 - Winter frost silver crop fringe */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#cfd8dc" strokeWidth="25" strokeLinecap="round" />
                    {/* Spikes layered look */}
                    <path d="M 98 75 Q 120 102 110 115" fill="none" stroke="#eceff1" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 148 65 Q 160 102 150 115" fill="none" stroke="#eceff1" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 188 75 Q 180 102 190 115" fill="none" stroke="#eceff1" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_bob_moon':
            return (
                <g>
                    {/* 月盈元气短发 - Neat round dark brown short bob-cut, straight fringe */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Sides hugging cheeks */}
                    <path d="M 75 110 C 68 140, 75 160, 90 165" fill="none" stroke="#3e2723" strokeWidth="15" strokeLinecap="round" />
                    <path d="M 225 110 C 232 140, 225 160, 210 165" fill="none" stroke="#3e2723" strokeWidth="15" strokeLinecap="round" />
                    {/* Straight fringe line */}
                    <path d="M 90 98 L 210 98" stroke="#3e2723" strokeWidth="15" strokeLinecap="round" />
                </g>
            );
        case 'hair_silver_wave':
            return (
                <g>
                    {/* 银浪长发 - Long wavy ash-blonde curls, straight bangs, gold lanterns, red sashes */}
                    <path d="M 75 140 C 45 220, 35 300, 60 360" fill="none" stroke="#ffe082" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 300, 240 360" fill="none" stroke="#ffe082" strokeWidth="18" strokeLinecap="round" />
                    {/* Red hanging sashes */}
                    <path d="M 85 130 Q 55 200 65 270" fill="none" stroke="#d84315" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 215 130 Q 245 200 235 270" fill="none" stroke="#d84315" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#ffe082" strokeWidth="25" strokeLinecap="round" />
                    {/* Hanging gold lanterns */}
                    <circle cx="65" cy="180" r="7" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1" />
                    <circle cx="235" cy="180" r="7" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1" />
                </g>
            );
        case 'hair_silver_ripple':
            return (
                <g>
                    {/* 银澜短发 - Layered messy short hair in ash-grey/purple */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#b0bec5" strokeWidth="25" strokeLinecap="round" />
                    {/* Layered purple details */}
                    <path d="M 100 80 Q 130 65 145 95" fill="none" stroke="#b39ddb" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 190 80 Q 160 65 155 95" fill="none" stroke="#b39ddb" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_japanese_curls':
            return (
                <g>
                    {/* 日系卷发 - Messy short brown curls */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#6d4c41" strokeWidth="25" strokeLinecap="round" />
                    {/* Multiple small curly details */}
                    <circle cx="95" cy="75" r="10" fill="#6d4c41" />
                    <circle cx="125" cy="65" r="11" fill="#6d4c41" />
                    <circle cx="175" cy="65" r="11" fill="#6d4c41" />
                    <circle cx="205" cy="75" r="10" fill="#6d4c41" />
                </g>
            );
        case 'hair_wavy_clips':
            return (
                <g>
                    {/* 氛围感大波浪 - Voluminous long brown wavy hair, four colorful clips */}
                    <path d="M 75 140 C 40 220, 30 300, 50 360" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 260 220, 270 300, 250 360" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    {/* Four clips on bangs */}
                    <rect x="95" y="70" width="8" height="3" fill="#ff4081" transform="rotate(15 99 71)" />
                    <rect x="108" y="65" width="8" height="3" fill="#ffd54f" transform="rotate(15 112 66)" />
                    <rect x="185" y="70" width="8" height="3" fill="#ff4081" transform="rotate(-15 189 71)" />
                    <rect x="172" y="65" width="8" height="3" fill="#ffd54f" transform="rotate(-15 176 66)" />
                </g>
            );
        case 'hair_sunhat_brown':
            return (
                <g>
                    {/* 梵高浅棕发 - Short brown hair, grey sun hat, purple ribbon */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#6d4c41" strokeWidth="25" strokeLinecap="round" />
                    {/* Wide brimmed sun hat */}
                    <ellipse cx="150" cy="54" rx="72" ry="16" fill="#b0bec5" stroke="#90a4ae" strokeWidth="2" />
                    {/* Purple ribbon */}
                    <ellipse cx="150" cy="46" rx="44" ry="10" fill="#7e57c2" />
                    {/* Hat dome */}
                    <path d="M 110 44 C 110 10, 190 10, 190 44 Z" fill="#b0bec5" stroke="#90a4ae" strokeWidth="2" />
                </g>
            );
        case 'hair_pearl_headscarf':
            return (
                <g>
                    {/* 珍珠束发 - Long ash brown hair, wide blue headscarf, white pearl earrings */}
                    <path d="M 75 140 C 45 220, 35 300, 50 360" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 300, 250 360" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    {/* Blue headscarf */}
                    <path d="M 82 82 Q 150 58 218 82" fill="none" stroke="#1976d2" strokeWidth="12" strokeLinecap="round" />
                    {/* White pearl earrings */}
                    <circle cx="72" cy="130" r="5.5" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
                    <circle cx="228" cy="130" r="5.5" fill="#fff" stroke="#ccc" strokeWidth="1.5" />
                </g>
            );
        case 'hair_pirate_bandanna':
            return (
                <g>
                    {/* 探险棕发 - Messy brown hair, red pirate bandanna, silver bead braid */}
                    {/* Silver bead braid on side */}
                    <path d="M 82 135 L 75 220" stroke="#cfd8dc" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 3" />
                    <circle cx="75" cy="220" r="4.5" fill="#ffb74d" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                    {/* Red pirate bandanna skullcap wrap */}
                    <path d="M 78 95 C 68 60, 95 32, 150 32 C 205 32, 232 60, 222 95 C 210 110, 90 110, 78 95 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="2.5" />
                    {/* Bandanna side knot sashes */}
                    <path d="M 218 90 Q 240 100 245 120" fill="none" stroke="#e53935" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 218 90 Q 235 75 240 85" fill="none" stroke="#e53935" strokeWidth="5" strokeLinecap="round" />
                </g>
            );
        case 'hair_red_anthem':
            return (
                <g>
                    {/* 自由赞歌红发 - Enormous flowing voluminous orange-red locks */}
                    {/* Huge background hair curves */}
                    <path d="M 60 120 C 0 180, -20 280, 20 350" fill="none" stroke="#e64a19" strokeWidth="32" strokeLinecap="round" />
                    <path d="M 240 120 C 300 180, 320 280, 280 350" fill="none" stroke="#e64a19" strokeWidth="32" strokeLinecap="round" />
                    {/* Main hair body */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#e64a19" strokeWidth="30" strokeLinecap="round" />
                    {/* Voluminous waves details */}
                    <path d="M 90 90 C 70 140, 50 200, 75 250" fill="none" stroke="#ff5722" strokeWidth="15" strokeLinecap="round" />
                    <path d="M 210 90 C 230 140, 250 200, 225 250" fill="none" stroke="#ff5722" strokeWidth="15" strokeLinecap="round" />
                </g>
            );
        case 'hair_greenish_perm':
            return (
                <g>
                    {/* 闷青纹理烫发 - Light ash-green messy textured perm crop */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#81c784" strokeWidth="25" strokeLinecap="round" />
                    {/* Perm textures */}
                    <circle cx="100" cy="70" r="10" fill="#81c784" />
                    <circle cx="120" cy="60" r="12" fill="#81c784" />
                    <circle cx="150" cy="55" r="12" fill="#81c784" />
                    <circle cx="180" cy="60" r="12" fill="#81c784" />
                    <circle cx="200" cy="70" r="10" fill="#81c784" />
                    <circle cx="120" cy="60" r="6" fill="#a5d6a7" />
                    <circle cx="180" cy="60" r="6" fill="#a5d6a7" />
                </g>
            );
        case 'hair_flaxen_buns':
            return (
                <g>
                    {/* 亚麻花苞双辫 - Flaxen side braided buns with white floral tassels */}
                    {/* Buns behind */}
                    <circle cx="75" cy="140" r="18" fill="#d7ccc8" stroke="#333" strokeWidth="1.5" />
                    <circle cx="225" cy="140" r="18" fill="#d7ccc8" stroke="#333" strokeWidth="1.5" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#d7ccc8" strokeWidth="25" strokeLinecap="round" />
                    {/* Braids */}
                    <path d="M 75 140 Q 65 190 75 220" fill="none" stroke="#d7ccc8" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 225 140 Q 235 190 225 220" fill="none" stroke="#d7ccc8" strokeWidth="8" strokeLinecap="round" />
                    {/* White tassels hanging */}
                    <circle cx="75" cy="225" r="4.5" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <line x1="75" y1="229" x2="75" y2="242" stroke="#eceff1" strokeWidth="3.5" />
                    <circle cx="225" cy="225" r="4.5" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <line x1="225" y1="229" x2="225" y2="242" stroke="#eceff1" strokeWidth="3.5" />
                </g>
            );
        case 'hair_golden_feather':
            return (
                <g>
                    {/* 金羽束编发 - Wavy dark brown with side braids and gold forehead feather */}
                    {/* Side braids */}
                    <path d="M 82 135 L 75 220" stroke="#3e2723" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="12 4" />
                    <path d="M 218 135 L 225 220" stroke="#3e2723" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="12 4" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Gold forehead chain */}
                    <path d="M 92 88 Q 150 78 208 88" fill="none" stroke="#ffd700" strokeWidth="3" strokeDasharray="4 4" />
                    {/* Gold feather in center */}
                    <path d="M 150 70 L 146 88 L 150 92 L 154 88 Z" fill="#ffd700" stroke="#ff8f00" strokeWidth="1" />
                    <line x1="150" y1="70" x2="150" y2="92" stroke="#ff8f00" strokeWidth="1.5" />
                </g>
            );
        case 'hair_purple_veil':
            return (
                <g>
                    {/* 幻纱紫旋披发 - Long brown waves with purple sheer lace veil and gold chains */}
                    {/* Long wavy hair */}
                    <path d="M 75 140 C 45 220, 35 300, 55 350" fill="none" stroke="#4e342e" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 300, 245 350" fill="none" stroke="#4e342e" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Translucent purple lace veil */}
                    <path d="M 82 85 C 65 50, 95 20, 150 20 C 205 20, 235 50, 218 85 C 210 130, 90 130, 82 85 Z" fill="#d1c4e9" opacity="0.68" stroke="#b39ddb" strokeWidth="1.5" />
                    <path d="M 82 85 Q 150 120 218 85" fill="none" stroke="#b39ddb" strokeWidth="3" strokeDasharray="5 3" />
                    {/* Gold chains across front */}
                    <path d="M 100 68 Q 150 48 200 68" fill="none" stroke="#ffd700" strokeWidth="3" strokeDasharray="4 4" />
                    <circle cx="150" cy="58" r="4.5" fill="#f44336" />
                </g>
            );
        case 'hair_iceblue_perm':
            return (
                <g>
                    {/* 冰蓝烫发 - Wavy light-blue short hair with white highlights */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#80deea" strokeWidth="25" strokeLinecap="round" />
                    {/* White highlight details */}
                    <path d="M 98 75 Q 120 102 110 115" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 148 65 Q 160 102 150 115" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 188 75 Q 180 102 190 115" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_ice_curls':
            return (
                <g>
                    {/* 冰绡漫卷 - Soft light-blue/silver side ponytail, blue sea-star clip */}
                    {/* Low side ponytail */}
                    <path d="M 90 145 C 70 210, 50 250, 75 300" fill="none" stroke="#b2ebf2" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#b2ebf2" strokeWidth="25" strokeLinecap="round" />
                    {/* Sea-star hair clip */}
                    <path d="M 82 120 L 86 123 L 91 121 L 89 126 L 92 130 L 87 129 L 84 133 L 84 128 L 79 126 L 83 125 Z" fill="#00e5ff" stroke="#333" strokeWidth="1" />
                </g>
            );
        case 'hair_ink_spiky':
            return (
                <g>
                    {/* 青墨碎锋 - Messy layered dark olive-green spiky crop */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#2e7d32" strokeWidth="25" strokeLinecap="round" />
                    {/* Spiky layers */}
                    <path d="M 95 80 L 105 105 L 115 85 L 130 110 L 140 85 L 155 110 L 165 85 L 180 110 L 190 85 L 205 105" fill="none" stroke="#2e7d32" strokeWidth="15" strokeLinecap="round" />
                    <path d="M 120 70 Q 145 92 135 110" fill="none" stroke="#4caf50" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_playful_buns':
            return (
                <g>
                    {/* 俏皮双丸子 - Messy olive-green hair, two high buns, pink ties */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#4caf50" strokeWidth="25" strokeLinecap="round" />
                    {/* Two high buns */}
                    <circle cx="85" cy="40" r="18" fill="#4caf50" stroke="#333" strokeWidth="1.5" />
                    <circle cx="215" cy="40" r="18" fill="#4caf50" stroke="#333" strokeWidth="1.5" />
                    {/* Pink ties */}
                    <ellipse cx="85" cy="55" rx="14" ry="4" fill="#ff4081" />
                    <ellipse cx="215" cy="55" rx="14" ry="4" fill="#ff4081" />
                </g>
            );
        case 'hair_sunny_fringe':
            return (
                <g>
                    {/* 日光棕穗 - Warm light brown short crop fringe haircut */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#a1887f" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 120 60 Q 145 95 135 112" fill="none" stroke="#d7ccc8" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_strawberry_buns':
            return (
                <g>
                    {/* 绿蔓甜莓双丸子 - Cute light blonde hair, two low side buns, green vine ties */}
                    {/* Side buns */}
                    <circle cx="75" cy="140" r="18" fill="#fff9c4" stroke="#333" strokeWidth="1.5" />
                    <circle cx="225" cy="140" r="18" fill="#fff9c4" stroke="#333" strokeWidth="1.5" />
                    {/* Green vine bands wraps */}
                    <ellipse cx="75" cy="125" rx="12" ry="4" fill="#4caf50" />
                    <ellipse cx="225" cy="125" rx="12" ry="4" fill="#4caf50" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#fff9c4" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_misty_waves':
            return (
                <g>
                    {/* 青峦漫卷 - Casual long dark grey wavy hair flowing over shoulders */}
                    <path d="M 75 140 C 45 220, 35 280, 55 350" fill="none" stroke="#37474f" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 280, 245 350" fill="none" stroke="#37474f" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#37474f" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_cold_moon_updo':
            return (
                <g>
                    {/* 清冷挽月髻 - Traditional high elegant black updo, blue flower beads and sashes */}
                    {/* Dark blue hanging sashes behind shoulders */}
                    <path d="M 90 140 Q 65 220 80 320" fill="none" stroke="#0d47a1" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 210 140 Q 235 220 220 320" fill="none" stroke="#0d47a1" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* High updo bun */}
                    <ellipse cx="150" cy="32" rx="26" ry="18" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    {/* Light blue beads / flower blossom circles */}
                    <circle cx="132" cy="38" r="5" fill="#80deea" stroke="#00acc1" strokeWidth="1" />
                    <circle cx="168" cy="38" r="5" fill="#80deea" stroke="#00acc1" strokeWidth="1" />
                    <circle cx="150" cy="42" r="4.5" fill="#80deea" stroke="#00acc1" strokeWidth="1" />
                </g>
            );
        case 'hair_youthful_part':
            return (
                <g>
                    {/* 少年感微分碎盖 - Neat casual dark brown side-parted short crop fringe */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Side part line */}
                    <path d="M 130 50 Q 142 95 138 112" fill="none" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_gentle_sidebraid':
            return (
                <g>
                    {/* 温柔斜编发 - Long brown side-braid flowing over left shoulder, yellow flowers */}
                    {/* Left braid */}
                    <path d="M 90 145 C 65 210, 50 250, 75 300" fill="none" stroke="#5d4037" strokeWidth="18" strokeLinecap="round" strokeDasharray="25 6" />
                    {/* Yellow flowers */}
                    <circle cx="70" cy="180" r="4.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="1" />
                    <circle cx="60" cy="230" r="4.5" fill="#fbc02d" stroke="#f57f17" strokeWidth="1" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#5d4037" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_baseball_cap':
            return (
                <g>
                    {/* 美式棒球背头 - Cool blue backward baseball cap worn over short dark brown hair */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Blue cap dome */}
                    <circle cx="150" cy="72" r="32" fill="#1e88e5" stroke="#1565c0" strokeWidth="2.5" />
                    {/* Grey backward cap strap/buckle */}
                    <rect x="135" y="86" width="30" height="6" fill="#757575" stroke="#333" strokeWidth="1" rx="1.5" />
                    <circle cx="150" cy="89" r="4.5" fill="#ffd54f" />
                </g>
            );
        case 'hair_sporty_pigtails':
            return (
                <g>
                    {/* 运动感双麻花 - Dark brown straight hair, two long braids tied with blue ribbons */}
                    {/* Long braids */}
                    <path d="M 75 140 L 60 280" stroke="#4e342e" strokeWidth="10" strokeLinecap="round" strokeDasharray="18 5" />
                    <path d="M 225 140 L 240 280" stroke="#4e342e" strokeWidth="10" strokeLinecap="round" strokeDasharray="18 5" />
                    {/* Blue ribbon bows */}
                    <circle cx="72" cy="145" r="5" fill="#1e88e5" />
                    <circle cx="228" cy="145" r="5" fill="#1e88e5" />
                    <circle cx="62" cy="275" r="5" fill="#1e88e5" />
                    <circle cx="238" cy="275" r="5" fill="#1e88e5" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_thousand_snow':
            return (
                <g>
                    {/* 千山暮雪束发 - Ancient white flowing hair, high topknot, light-green jade crown */}
                    {/* Back long hair flowing */}
                    <path d="M 75 140 C 45 220, 35 300, 55 360" fill="none" stroke="#fafafa" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 300, 245 360" fill="none" stroke="#fafafa" strokeWidth="16" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#fafafa" strokeWidth="25" strokeLinecap="round" />
                    {/* High topknot bun */}
                    <circle cx="150" cy="28" r="20" fill="#fafafa" stroke="#cfd8dc" strokeWidth="1.5" />
                    {/* Light green jade crown ring */}
                    <rect x="136" y="24" width="28" height="14" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="1.5" rx="1.5" />
                    <ellipse cx="150" cy="24" rx="14" ry="3" fill="#81c784" />
                </g>
            );
        case 'hair_ancient_playful':
            return (
                <g>
                    {/* 古风俏皮扎发 - Chinese double high buns, golden sashes, green jade ornaments */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Buns */}
                    <circle cx="95" cy="38" r="18" fill="#3e2723" stroke="#333" strokeWidth="1.5" />
                    <circle cx="205" cy="38" r="18" fill="#3e2723" stroke="#333" strokeWidth="1.5" />
                    {/* Jade beads */}
                    <circle cx="95" cy="56" r="5.5" fill="#a5d6a7" stroke="#333" strokeWidth="1" />
                    <circle cx="205" cy="56" r="5.5" fill="#a5d6a7" stroke="#333" strokeWidth="1" />
                    {/* Gold sashes */}
                    <path d="M 95 38 Q 70 110 80 180" fill="none" stroke="#ffd700" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 205 38 Q 230 110 220 180" fill="none" stroke="#ffd700" strokeWidth="3.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_headband_fringe':
            return (
                <g>
                    {/* 清爽发带碎盖 - Dark brown fringe with grey-and-white patterned bandana headband */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Bandana across forehead */}
                    <path d="M 85 92 Q 150 78 215 92" fill="none" stroke="#b0bec5" strokeWidth="10" strokeLinecap="round" />
                    {/* Bandana zigzag patterns */}
                    <path d="M 95 90 L 105 84 L 115 90 L 125 84 L 135 90 L 145 84 L 155 90 L 165 84 L 175 90 L 185 84 L 195 90 L 205 84" fill="none" stroke="#ffffff" strokeWidth="2" />
                </g>
            );
        case 'hair_cute_updo':
            return (
                <g>
                    {/* 花苞盘发 - Rounded high bun updo with white lace frill headband */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* High round bun updo */}
                    <circle cx="150" cy="30" r="20" fill="#4e342e" stroke="#333" strokeWidth="1.5" />
                    {/* White lace frill headband */}
                    <path d="M 120 45 Q 150 25 180 45" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
                </g>
            );
        case 'hair_korean_perm':
            return (
                <g>
                    {/* 韩系微分纹理 - Ash brown short perm crop, soft forehead wave */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#8d6e63" strokeWidth="25" strokeLinecap="round" />
                    {/* Forehead waves */}
                    <path d="M 115 80 Q 135 105 130 115" fill="none" stroke="#8d6e63" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 185 80 Q 165 105 170 115" fill="none" stroke="#8d6e63" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'hair_side_part_bun':
            return (
                <g>
                    {/* 斜刘海花苞头 - Dark brown wavy updo with gold hoop earrings */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* High round bun */}
                    <circle cx="150" cy="30" r="20" fill="#4e342e" stroke="#333" strokeWidth="1.5" />
                    {/* Gold hoop earrings near ears */}
                    <circle cx="74" cy="130" r="7" fill="none" stroke="#ffd700" strokeWidth="2" />
                    <circle cx="226" cy="130" r="7" fill="none" stroke="#ffd700" strokeWidth="2" />
                </g>
            );
        case 'hair_moxue_topknot':
            return (
                <g>
                    {/* 墨雪束发 - Ancient traditional half-up ponytail, white diamond crown */}
                    {/* Long half-up ponytail behind shoulders */}
                    <path d="M 85 140 C 70 210, 60 280, 80 340" fill="none" stroke="#37474f" strokeWidth="15" strokeLinecap="round" />
                    <path d="M 215 140 C 230 210, 240 280, 220 340" fill="none" stroke="#37474f" strokeWidth="15" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#37474f" strokeWidth="25" strokeLinecap="round" />
                    {/* High topknot bun */}
                    <circle cx="150" cy="30" r="18" fill="#37474f" stroke="#333" strokeWidth="1.5" />
                    {/* White diamond crown */}
                    <path d="M 134 30 L 138 12 L 150 22 L 162 12 L 166 30 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="1.5" />
                    <circle cx="150" cy="22" r="3.5" fill="#80deea" />
                </g>
            );
        case 'hair_cute_double_buns':
            return (
                <g>
                    {/* 灵俏双髻 - Traditional Chinese updo, double side buns, blue beads, white tassels */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#2d1d17" strokeWidth="25" strokeLinecap="round" />
                    {/* Double side buns */}
                    <circle cx="85" cy="48" r="16" fill="#2d1d17" stroke="#333" strokeWidth="1.5" />
                    <circle cx="215" cy="48" r="16" fill="#2d1d17" stroke="#333" strokeWidth="1.5" />
                    {/* Blue bead arches */}
                    <path d="M 75 60 Q 90 70 100 55" fill="none" stroke="#80deea" strokeWidth="3" strokeDasharray="3 3" />
                    <path d="M 225 60 Q 210 70 200 55" fill="none" stroke="#80deea" strokeWidth="3" strokeDasharray="3 3" />
                    {/* White tassels */}
                    <line x1="85" y1="64" x2="85" y2="82" stroke="#eceff1" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="215" y1="64" x2="215" y2="82" stroke="#eceff1" strokeWidth="3.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_redbrown_short':
            return (
                <g>
                    {/* 红棕短发 - Warm red-brown short haircut */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#a1887f" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 120 60 Q 140 100 135 116" fill="none" stroke="#8d6e63" strokeWidth="8" strokeLinecap="round" />
                </g>
            );
        case 'hair_warm_brown_curls':
            return (
                <g>
                    {/* 暖棕卷发 - Long flowing wavy milk-tea brown */}
                    <path d="M 75 140 C 45 220, 35 290, 50 350" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 225 140 C 255 220, 265 290, 250 350" fill="none" stroke="#8d6e63" strokeWidth="18" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#8d6e63" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_silverblue_perm':
            return (
                <g>
                    {/* 银蓝烫发 - Soft curly short ash silver-blue */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#b0bec5" strokeWidth="25" strokeLinecap="round" />
                    <circle cx="105" cy="72" r="10" fill="#b0bec5" />
                    <circle cx="130" cy="62" r="11" fill="#b0bec5" />
                    <circle cx="170" cy="62" r="11" fill="#b0bec5" />
                    <circle cx="195" cy="72" r="10" fill="#b0bec5" />
                    {/* Soft blue highlight lines */}
                    <path d="M 125 65 Q 145 92 135 110" fill="none" stroke="#90caf9" strokeWidth="5" strokeLinecap="round" />
                </g>
            );
        case 'hair_silver_hime':
            return (
                <g>
                    {/* 银色公主切 - Long straight silver hime-cut, over-ear blue sports headphones */}
                    {/* Long straight silver back hair */}
                    <path d="M 75 140 L 75 350 M 225 140 L 225 350" stroke="#cfd8dc" strokeWidth="18" strokeLinecap="round" />
                    {/* Hime cut bangs sides */}
                    <path d="M 85 110 L 85 160 M 215 110 L 215 160" stroke="#cfd8dc" strokeWidth="15" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#cfd8dc" strokeWidth="25" strokeLinecap="round" />
                    {/* Blue sports headphones */}
                    <path d="M 82 72 Q 150 35 218 72" fill="none" stroke="#90caf9" strokeWidth="8" strokeLinecap="round" />
                    <rect x="68" y="90" width="14" height="32" rx="7" fill="#1e88e5" stroke="#333" strokeWidth="1.5" />
                    <rect x="218" y="90" width="14" height="32" rx="7" fill="#1e88e5" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hair_golden_brown_short':
            return (
                <g>
                    {/* 金棕短发 - Short messy curls in vibrant golden-brown */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#a1887f" strokeWidth="25" strokeLinecap="round" />
                    {/* Messy curls loops */}
                    <circle cx="100" cy="72" r="10" fill="#a1887f" />
                    <circle cx="130" cy="62" r="11" fill="#a1887f" />
                    <circle cx="170" cy="62" r="11" fill="#a1887f" />
                    <circle cx="195" cy="72" r="10" fill="#a1887f" />
                </g>
            );
        case 'hair_golden_curly':
            return (
                <g>
                    {/* 金色羊毛卷 - Voluminous shoulder-length golden curls, small blue clip */}
                    <path d="M 75 140 C 45 220, 35 280, 50 340" fill="none" stroke="#ffd54f" strokeWidth="20" strokeLinecap="round" strokeDasharray="25 6" />
                    <path d="M 225 140 C 255 220, 265 280, 250 340" fill="none" stroke="#ffd54f" strokeWidth="20" strokeLinecap="round" strokeDasharray="25 6" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#ffd54f" strokeWidth="25" strokeLinecap="round" />
                    {/* Small blue clip on bangs */}
                    <rect x="98" y="72" width="10" height="3.5" fill="#29b6f6" rx="1.5" stroke="#333" strokeWidth="0.8" />
                </g>
            );
        case 'hair_orange_highlight':
            return (
                <g>
                    {/* 橘色挑染短发 - Messy short blonde hair, bright orange highlights */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#ffe082" strokeWidth="25" strokeLinecap="round" />
                    <path d="M 98 80 L 108 105 L 118 85 M 178 78 L 168 105 M 202 80 L 192 105" stroke="#ffe082" strokeWidth="15" strokeLinecap="round" />
                    {/* Bright orange highlights */}
                    <path d="M 108 95 L 108 105" stroke="#ff9800" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 168 95 L 168 105" stroke="#ff9800" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'hair_orange_soda':
            return (
                <g>
                    {/* 橘子汽水卷发 - Light blonde pigtail curls tied high with red and blue ties */}
                    {/* High side pigtails curls */}
                    <path d="M 72 70 Q 40 100 48 180" fill="none" stroke="#fff59d" strokeWidth="16" strokeLinecap="round" strokeDasharray="18 5" />
                    <path d="M 228 70 Q 260 100 252 180" fill="none" stroke="#fff59d" strokeWidth="16" strokeLinecap="round" strokeDasharray="18 5" />
                    {/* Red & Blue ties */}
                    <circle cx="72" cy="70" r="6" fill="#e53935" />
                    <circle cx="228" cy="70" r="6" fill="#1e88e5" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#fff59d" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_stylish_highlight':
            return (
                <g>
                    {/* 气质挑染碎发 - Dark brown short crop, golden/greenish highlights */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Gold and green highlights lines */}
                    <path d="M 125 65 Q 145 92 135 110" fill="none" stroke="#ffd54f" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 175 65 Q 155 92 165 110" fill="none" stroke="#c5e1a5" strokeWidth="5.5" strokeLinecap="round" />
                </g>
            );
        case 'hair_cute_twin_buns':
            return (
                <g>
                    {/* 可爱双丸子头 - Dark brown double high pigtails, blue ribbon clips, yellow star pin */}
                    {/* Buns */}
                    <circle cx="85" cy="42" r="16" fill="#3e2723" stroke="#333" strokeWidth="1.5" />
                    <circle cx="215" cy="42" r="16" fill="#3e2723" stroke="#333" strokeWidth="1.5" />
                    {/* Light-blue bows */}
                    <circle cx="85" cy="56" r="5" fill="#80deea" />
                    <circle cx="215" cy="56" r="5" fill="#80deea" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                    {/* Yellow star pin */}
                    <path d="M 105 72 L 108 77 L 113 77 L 109 80 L 111 85 L 105 82 L 99 85 L 101 80 L 97 77 L 102 77 Z" fill="#ffd54f" />
                </g>
            );
        case 'hair_chinese_side_bun':
            return (
                <g>
                    {/* 中式侧丸子头 - Chinese side bun over left shoulder, black pin sticks */}
                    {/* Long side bun draped on left */}
                    <path d="M 90 145 Q 60 210 82 300" fill="none" stroke="#3e2723" strokeWidth="20" strokeLinecap="round" />
                    {/* Chinese double pin sticks crossing on left bun */}
                    <line x1="50" y1="125" x2="100" y2="155" stroke="#212121" strokeWidth="3" strokeLinecap="round" />
                    <line x1="55" y1="150" x2="95" y2="120" stroke="#212121" strokeWidth="3" strokeLinecap="round" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_chinese_part':
            return (
                <g>
                    {/* 中式微分碎盖 - Neat casual dark grey short crop parted */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#37474f" strokeWidth="25" strokeLinecap="round" />
                    {/* Simple part details */}
                    <path d="M 125 50 Q 140 92 135 110" fill="none" stroke="#263238" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_qinxin_updo':
            return (
                <g>
                    {/* 琴心剑意髻 - Traditional high black bun with silver crown and blue-accented locks */}
                    {/* High bun */}
                    <circle cx="150" cy="30" r="18" fill="#212121" stroke="#111" strokeWidth="1.5" />
                    {/* Silver crown on bun */}
                    <path d="M 136 30 L 140 10 L 150 20 L 160 10 L 164 30 Z" fill="#e0e0e0" stroke="#9e9e9e" strokeWidth="1" />
                    <circle cx="150" cy="20" r="3" fill="#00bcd4" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#212121" strokeWidth="25" strokeLinecap="round" />
                    {/* Flowing side locks */}
                    <path d="M 80 120 Q 60 180 75 240" fill="none" stroke="#212121" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 220 120 Q 240 180 225 240" fill="none" stroke="#212121" strokeWidth="10" strokeLinecap="round" />
                </g>
            );
        case 'hair_flower_cloud_updo':
            return (
                <g>
                    {/* 花簪云髻 - Chinese cloud bun covered in light green and purple flowers with pins */}
                    {/* Cloud bun on top */}
                    <circle cx="125" cy="35" r="16" fill="#3e2723" />
                    <circle cx="175" cy="35" r="16" fill="#3e2723" />
                    <circle cx="150" cy="32" r="14" fill="#3e2723" />
                    {/* Flower hairpins */}
                    <circle cx="120" cy="30" r="5" fill="#e040fb" />
                    <circle cx="125" cy="25" r="3" fill="#b2ff59" />
                    <circle cx="180" cy="30" r="5" fill="#e040fb" />
                    <circle cx="175" cy="25" r="3" fill="#b2ff59" />
                    {/* Gold pin sticks */}
                    <line x1="105" y1="25" x2="135" y2="45" stroke="#ffd700" strokeWidth="2" />
                    <line x1="195" y1="25" x2="165" y2="45" stroke="#ffd700" strokeWidth="2" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#3e2723" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_wind_whisper_short':
            return (
                <g>
                    {/* 风吟短发 - Casual short brown hair styled with an ethnic bead forehead chain */}
                    <path d="M 80 110 Q 150 18 220 110" fill="none" stroke="#6d4c41" strokeWidth="25" strokeLinecap="round" />
                    {/* Messy bangs lines */}
                    <path d="M 100 80 L 105 105 L 115 85 M 190 80 L 185 105 L 175 85" stroke="#5d4037" strokeWidth="6" strokeLinecap="round" />
                    {/* Forehead chain with ethnic beads */}
                    <path d="M 95 85 Q 150 100 205 85" fill="none" stroke="#b0bec5" strokeWidth="1.5" />
                    <circle cx="120" cy="91" r="3" fill="#ff5722" />
                    <circle cx="135" cy="94" r="3" fill="#ffeb3b" />
                    <circle cx="150" cy="95" r="4.5" fill="#00bcd4" />
                    <circle cx="165" cy="94" r="3" fill="#ffeb3b" />
                    <circle cx="180" cy="91" r="3" fill="#ff5722" />
                </g>
            );
        case 'hair_scarlet_long':
            return (
                <g>
                    {/* 绯红长发 - Long flowing red curls draped with green drop-shaped earrings */}
                    {/* Flowing scarlet hair on shoulders */}
                    <path d="M 75 140 C 45 220, 30 280, 50 350" fill="none" stroke="#b71c1c" strokeWidth="22" strokeLinecap="round" strokeDasharray="30 5" />
                    <path d="M 225 140 C 255 220, 270 280, 250 350" fill="none" stroke="#b71c1c" strokeWidth="22" strokeLinecap="round" strokeDasharray="30 5" />
                    {/* Green drop-shaped earrings */}
                    <line x1="72" y1="130" x2="72" y2="148" stroke="#4caf50" strokeWidth="2" />
                    <circle cx="72" cy="148" r="4.5" fill="#81c784" />
                    <line x1="228" y1="130" x2="228" y2="148" stroke="#4caf50" strokeWidth="2" />
                    <circle cx="228" cy="148" r="4.5" fill="#81c784" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#b71c1c" strokeWidth="25" strokeLinecap="round" />
                </g>
            );
        case 'hair_vampire_lord':
            return (
                <g>
                    {/* 暗夜魔爵发 - Sleek medium brown hair in an elegant formal cut */}
                    {/* Base hair */}
                    <path d="M 80 110 Q 150 16 220 110" fill="none" stroke="#4e342e" strokeWidth="25" strokeLinecap="round" />
                    {/* Sleek formal bangs and sides */}
                    <path d="M 75 110 C 70 140, 75 170, 80 190" fill="none" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 225 110 C 230 140, 225 170, 220 190" fill="none" stroke="#3e2723" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 115 65 Q 140 85 130 110" fill="none" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />
                </g>
            );
        case 'hair_silver_dream':
            return (
                <g>
                    {/* 银辉绮梦发 - Elegant wavy ash grey/blonde locks styled with a beautiful golden flower crown and drop earrings */}
                    {/* Long wavy locks behind shoulders */}
                    <path d="M 75 140 C 50 210, 40 280, 55 350" fill="none" stroke="#b0bec5" strokeWidth="18" strokeLinecap="round" strokeDasharray="25 6" />
                    <path d="M 225 140 C 250 210, 260 280, 245 350" fill="none" stroke="#b0bec5" strokeWidth="18" strokeLinecap="round" strokeDasharray="25 6" />
                    {/* Gold drop earrings */}
                    <line x1="72" y1="130" x2="72" y2="148" stroke="#ffd700" strokeWidth="1.5" />
                    <circle cx="72" cy="148" r="3.5" fill="#ffb300" />
                    <line x1="228" y1="130" x2="228" y2="148" stroke="#ffd700" strokeWidth="1.5" />
                    <circle cx="228" cy="148" r="3.5" fill="#ffb300" />
                    {/* Hair base */}
                    <path d="M 80 110 Q 150 15 220 110" fill="none" stroke="#b0bec5" strokeWidth="25" strokeLinecap="round" />
                    {/* Golden flower crown wreath on top of head */}
                    <path d="M 92 65 Q 150 50 208 65" fill="none" stroke="#ffd700" strokeWidth="3" />
                    <circle cx="120" cy="58" r="4.5" fill="#ffd700" />
                    <circle cx="150" cy="54" r="5.5" fill="#ffb300" />
                    <circle cx="180" cy="58" r="4.5" fill="#ffd700" />
                    <path d="M 105 60 C 102 55, 110 50, 114 55" fill="none" stroke="#ffd700" strokeWidth="1.5" />
                    <path d="M 195 60 C 198 55, 190 50, 186 55" fill="none" stroke="#ffd700" strokeWidth="1.5" />
                </g>
            );
        default:
            // Default dark grey hair cut
            return (
                <path d="M 80 110 Q 150 20 220 110" fill="none" stroke="#424242" strokeWidth="25" strokeLinecap="round" />
            );
    }
}

function renderHat(hat: string) {
    switch (hat) {
        case 'hat_11diamond':
            return (
                <g transform="translate(0, -20)">
                    <path d="M 120 70 L 150 20 L 180 70" fill="none" stroke="#8bc34a" strokeWidth="4" />
                    <circle cx="150" cy="20" r="6" fill="#ffeb3b" />
                </g>
            );
        case 'hat_starvine':
            return (
                <path d="M 90 60 Q 150 20 210 60" fill="none" stroke="#8bc34a" strokeWidth="10" strokeLinecap="round" />
            );
        case 'hat_foxears':
            return (
                <g>
                    <path d="M 90 60 L 100 10 L 120 50 Z" fill="#fff" stroke="#e0e0e0" strokeWidth="2" />
                    <path d="M 210 60 L 200 10 L 180 50 Z" fill="#fff" stroke="#e0e0e0" strokeWidth="2" />
                </g>
            );
        case 'hat_elk_clips':
            return (
                <g>
                    {/* 麋鹿小发夹 - Pair of antlers clips, berries & green leaves */}
                    <path d="M 75 75 Q 50 60 45 40 Q 55 45 65 60 Q 55 52 50 48" fill="none" stroke="#8d6e63" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 225 75 Q 250 60 255 40 Q 245 45 235 60 Q 245 52 250 48" fill="none" stroke="#8d6e63" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="72" cy="72" r="4.5" fill="#d84315" />
                    <circle cx="78" cy="76" r="4.5" fill="#d84315" />
                    <circle cx="228" cy="72" r="4.5" fill="#d84315" />
                    <circle cx="222" cy="76" r="4.5" fill="#d84315" />
                    <path d="M 66 76 C 62 78, 62 84, 68 86 C 72 84, 72 78, 66 76 Z" fill="#2e7d32" />
                    <path d="M 234 76 C 238 78, 238 84, 232 86 C 228 84, 228 78, 234 76 Z" fill="#2e7d32" />
                </g>
            );
        case 'hat_miao_silver':
            return (
                <g>
                    {/* 苗风精致银饰 - Large elaborate Miao silver crown with chains */}
                    <path d="M 70 80 Q 150 25 230 80" fill="none" stroke="#cfd8dc" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 90 60 L 95 20 L 115 50 M 120 45 L 125 10 L 138 42 M 150 40 L 150 5 L 150 40 M 180 45 L 175 10 L 162 42 M 210 60 L 205 20 L 185 50" stroke="#eceff1" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="150" cy="5" r="3" fill="#cfd8dc" />
                    <circle cx="125" cy="10" r="2.5" fill="#cfd8dc" />
                    <circle cx="175" cy="10" r="2.5" fill="#cfd8dc" />
                    {/* Hanging chains */}
                    <line x1="75" y1="85" x2="75" y2="125" stroke="#b0bec5" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="225" y1="85" x2="225" y2="125" stroke="#b0bec5" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="75" cy="125" r="2.5" fill="#cfd8dc" />
                    <circle cx="225" cy="125" r="2.5" fill="#cfd8dc" />
                </g>
            );
        case 'hat_star_moon_cap':
            return (
                <g>
                    {/* 星月辉映 - Light blue striped nightcap, star, sleeping bear */}
                    <path d="M 85 85 Q 150 15 215 85" fill="#90caf9" stroke="#333" strokeWidth="2.5" />
                    <path d="M 115 85 Q 150 25 185 85" fill="#e3f2fd" />
                    {/* Folded tip with star */}
                    <path d="M 200 65 Q 240 70 235 95" fill="none" stroke="#90caf9" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 235 95 L 238 98 L 243 98 L 239 101 L 241 106 L 235 103 L 229 106 L 231 101 L 227 98 L 232 98 Z" fill="#ffd54f" />
                    {/* Bear face detailing on band */}
                    <rect x="125" y="72" width="50" height="20" rx="10" fill="#fff" stroke="#333" strokeWidth="2" />
                    <circle cx="135" cy="72" r="6" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="165" cy="72" r="6" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <line x1="140" y1="82" x2="146" y2="82" stroke="#333" strokeWidth="1.5" />
                    <line x1="154" y1="82" x2="160" y2="82" stroke="#333" strokeWidth="1.5" />
                    <circle cx="150" cy="86" r="2.5" fill="#ffab91" />
                </g>
            );
        case 'hat_cat_explorer':
            return (
                <g>
                    {/* 探索喵星 - Fluffy light orange cat hood */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#ffb74d" strokeWidth="32" strokeLinecap="round" />
                    {/* Cat ears */}
                    <polygon points="78,42 55,10 95,28" fill="#ffb74d" stroke="#333" strokeWidth="2" />
                    <polygon points="78,42 62,18 90,30" fill="#ff8a65" />
                    <polygon points="222,42 245,10 205,28" fill="#ffb74d" stroke="#333" strokeWidth="2" />
                    <polygon points="222,42 238,18 210,30" fill="#ff8a65" />
                    {/* Cheek blush and cute eyes on hood */}
                    <circle cx="110" cy="55" r="4.5" fill="#e57373" opacity="0.6" />
                    <circle cx="190" cy="55" r="4.5" fill="#e57373" opacity="0.6" />
                </g>
            );
        case 'hat_sprout_panda':
            return (
                <g>
                    {/* 萌丫丫帽子 - White panda cap with green sprout leaf */}
                    <path d="M 80 100 Q 150 16 220 100" fill="#ffffff" stroke="#333" strokeWidth="3.5" />
                    {/* Black panda ears */}
                    <ellipse cx="90" cy="40" rx="14" ry="12" fill="#212121" stroke="#333" strokeWidth="2" />
                    <ellipse cx="210" cy="40" rx="14" ry="12" fill="#212121" stroke="#333" strokeWidth="2" />
                    {/* Panda eyes patch */}
                    <ellipse cx="124" cy="74" rx="9" ry="7" fill="#212121" />
                    <ellipse cx="176" cy="74" rx="9" ry="7" fill="#212121" />
                    <circle cx="124" cy="74" r="3" fill="#fff" />
                    <circle cx="176" cy="74" r="3" fill="#fff" />
                    <ellipse cx="150" cy="85" rx="4" ry="2.5" fill="#212121" />
                    {/* Sprout leaf */}
                    <path d="M 150 18 Q 150 2 158 2 Q 166 2 152 14" fill="#8bc34a" stroke="#333" strokeWidth="1" />
                    <path d="M 150 18 Q 150 5 142 5 Q 134 5 148 15" fill="#8bc34a" stroke="#333" strokeWidth="1" />
                    <line x1="150" y1="18" x2="150" y2="28" stroke="#333" strokeWidth="2" />
                </g>
            );
        case 'hat_green_bandana':
            return (
                <g>
                    {/* 青苹果絮语头巾 - Green & white checkered bandana, green apple clip */}
                    <path d="M 80 85 C 80 35, 220 35, 220 85" fill="#a5d6a7" stroke="#333" strokeWidth="2" />
                    <path d="M 100 85 Q 150 45 200 85" fill="#e8f5e9" opacity="0.7" />
                    {/* Checkered pattern lines */}
                    <path d="M 115 48 Q 130 85 130 85 M 150 42 Q 150 85 150 85 M 185 48 Q 170 85 170 85" stroke="#81c784" strokeWidth="2.5" />
                    <path d="M 90 70 Q 150 50 210 70 M 95 60 Q 150 40 205 60" stroke="#81c784" strokeWidth="2.5" fill="none" />
                    {/* Green apple clip on left */}
                    <circle cx="95" cy="75" r="6" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 95 69 Q 97 65 99 66" stroke="#5d4037" strokeWidth="1.5" fill="none" />
                </g>
            );
        case 'hat_y2k_sunglasses':
            return (
                <g>
                    {/* 千禧风浅边眼镜 - White/silver rimmed athletic sunglasses resting on head */}
                    <path d="M 95 72 Q 150 54 205 72" fill="none" stroke="#f5f5f5" strokeWidth="7" strokeLinecap="round" />
                    <path d="M 104 74 C 114 74, 136 70, 142 78 C 138 84, 114 86, 104 78 Z" fill="#29b6f6" stroke="#e0e0e0" strokeWidth="1.5" />
                    <path d="M 196 74 C 186 74, 164 70, 158 78 C 162 84, 186 86, 196 78 Z" fill="#29b6f6" stroke="#e0e0e0" strokeWidth="1.5" />
                </g>
            );
        case 'hat_lace_straw_hat':
            return (
                <g>
                    {/* 恬静花边草帽 - Beige straw hat with white lace ribbon & flowers */}
                    {/* Straw dome */}
                    <path d="M 90 85 Q 150 35 210 85 Z" fill="#ffe082" stroke="#333" strokeWidth="2.5" />
                    {/* Wide brim */}
                    <ellipse cx="150" cy="85" rx="80" ry="12" fill="#ffd54f" stroke="#333" strokeWidth="2" />
                    {/* White lace band */}
                    <rect x="90" y="80" width="120" height="6" fill="#fff" opacity="0.9" />
                    <ellipse cx="150" cy="83" rx="60" ry="2.5" fill="none" stroke="#eceff1" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Flowers on left */}
                    <circle cx="102" cy="80" r="4.5" fill="#f48fb1" />
                    <circle cx="110" cy="81" r="3.5" fill="#ffffff" />
                </g>
            );
        case 'hat_meow_snow_hood':
            return (
                <g>
                    {/* 喵喵雪帽 - Fluffy yellow cat hood topped with red ski goggles */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#ffd54f" strokeWidth="32" strokeLinecap="round" />
                    {/* Cat ears */}
                    <polygon points="76,40 50,8 92,26" fill="#ffd54f" stroke="#333" strokeWidth="2" />
                    <polygon points="224,40 250,8 208,26" fill="#ffd54f" stroke="#333" strokeWidth="2" />
                    {/* Red goggles */}
                    <rect x="98" y="44" width="104" height="24" rx="12" fill="#e53935" stroke="#333" strokeWidth="2" />
                    <rect x="104" y="48" width="42" height="16" rx="8" fill="#80deea" opacity="0.8" />
                    <rect x="154" y="48" width="42" height="16" rx="8" fill="#80deea" opacity="0.8" />
                    <line x1="146" y1="56" x2="154" y2="56" stroke="#e53935" strokeWidth="4" />
                </g>
            );
        case 'hat_xmas_top_hat':
            return (
                <g>
                    {/* 圣诞礼帽 - Tall dark grey top hat with red ribbon & holly */}
                    <rect x="105" y="15" width="90" height="60" rx="3" fill="#37474f" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="75" rx="65" ry="8" fill="#37474f" stroke="#333" strokeWidth="2" />
                    {/* Red ribbon band */}
                    <rect x="105" y="62" width="90" height="12" fill="#e53935" />
                    {/* Holly leaves and berries */}
                    <path d="M 150 62 Q 142 54 138 60 Q 144 64 150 62 Z" fill="#2e7d32" />
                    <path d="M 150 62 Q 158 54 162 60 Q 156 64 150 62 Z" fill="#2e7d32" />
                    <circle cx="150" cy="62" r="3.5" fill="#f44336" />
                </g>
            );
        case 'hat_xmas_red_beret':
            return (
                <g>
                    {/* 圣诞红的贝雷帽 - Red beret with Christmas tree & holly berries */}
                    <path d="M 85 85 C 80 40, 220 40, 215 85" fill="#d32f2f" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="68" ry="7" fill="#c62828" />
                    {/* Small Green Tree ornament */}
                    <polygon points="120,70 128,52 136,70" fill="#388e3c" stroke="#2e7d32" strokeWidth="1" />
                    <polygon points="122,60 128,45 134,60" fill="#388e3c" stroke="#2e7d32" strokeWidth="1" />
                    <rect x="126" y="70" width="4" height="4" fill="#5d4037" />
                    {/* White star */}
                    <circle cx="172" cy="58" r="2.5" fill="#fff" />
                    <circle cx="178" cy="64" r="1.5" fill="#fff" />
                </g>
            );
        case 'hat_plush_knitted_beanie':
            return (
                <g>
                    {/* 毛绒针织帽 - Cozy beige & brown striped winter beanie, pom-pom */}
                    <path d="M 85 90 Q 150 15 215 90 Z" fill="#d7ccc8" stroke="#333" strokeWidth="2.5" />
                    <path d="M 115 85 Q 150 25 185 85 Z" fill="#8d6e63" />
                    {/* Ribbed roll-up cuff */}
                    <rect x="80" y="80" width="140" height="15" rx="5" fill="#ffe0b2" stroke="#333" strokeWidth="2" />
                    <line x1="100" y1="80" x2="100" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="120" y1="80" x2="120" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="140" y1="80" x2="140" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="160" y1="80" x2="160" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="180" y1="80" x2="180" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="200" y1="80" x2="200" y2="95" stroke="#333" strokeWidth="1" />
                    {/* Pom-pom on top */}
                    <circle cx="150" cy="18" r="12" fill="#d7ccc8" stroke="#333" strokeWidth="1.5" />
                    <circle cx="150" cy="18" r="9" fill="#cfd8dc" strokeDasharray="3 3" />
                </g>
            );
        case 'hat_feather_veil_mini':
            return (
                <g>
                    {/* 羽毛网纱小礼帽 - White tilted mini hat, feather, black/white netting veil */}
                    <g transform="translate(18, 5) rotate(15, 150, 75)">
                        <rect x="115" y="30" width="70" height="40" rx="2" fill="#fff" stroke="#333" strokeWidth="2" />
                        <ellipse cx="150" cy="70" rx="50" ry="7" fill="#fff" stroke="#333" strokeWidth="1.5" />
                        {/* Feather */}
                        <path d="M 115 35 Q 90 5 95 20 Q 105 25 120 32" fill="#eceff1" stroke="#ccc" strokeWidth="1" />
                    </g>
                    {/* Delicate netting veil over forehead */}
                    <path d="M 95 90 Q 150 125 205 90" fill="none" stroke="#37474f" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 105 95 Q 150 135 195 95" fill="none" stroke="#37474f" strokeWidth="1" strokeDasharray="4 4" />
                </g>
            );
        case 'hat_fluffy_cat_beanie':
            return (
                <g>
                    {/* 猫咪毛绒帽 - Pastel blue fluffy cat beanie, pom-pom string beads */}
                    <path d="M 85 90 Q 150 20 215 90" fill="none" stroke="#b3e5fc" strokeWidth="25" strokeLinecap="round" />
                    {/* Cat ears */}
                    <polygon points="85,62 65,40 100,52" fill="#b3e5fc" stroke="#333" strokeWidth="1.5" />
                    <polygon points="215,62 235,40 200,52" fill="#b3e5fc" stroke="#333" strokeWidth="1.5" />
                    <polygon points="85,62 72,48 95,54" fill="#ff8a65" />
                    <polygon points="215,62 228,48 205,54" fill="#ff8a65" />
                    {/* Bead string */}
                    <path d="M 95 76 Q 150 86 205 76" fill="none" stroke="#ffeb3b" strokeWidth="2.5" strokeDasharray="5 5" />
                </g>
            );
        case 'hat_fluffy_dog_beanie':
            return (
                <g>
                    {/* 狗勾毛绒帽 - Light blue dog hood with floppy ears & bone decoration */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#81d4fa" strokeWidth="32" strokeLinecap="round" />
                    {/* Floppy ears */}
                    <path d="M 62 70 C 42 75, 42 145, 60 140 C 72 135, 72 75, 62 70 Z" fill="#81d4fa" stroke="#333" strokeWidth="1.5" />
                    <path d="M 238 70 C 258 75, 258 145, 240 140 C 228 135, 228 75, 238 70 Z" fill="#81d4fa" stroke="#333" strokeWidth="1.5" />
                    {/* Bone decoration */}
                    <rect x="88" y="45" width="22" height="8" rx="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="88" cy="45" r="4.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="88" cy="53" r="4.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="110" cy="45" r="4.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="110" cy="53" r="4.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hat_cute_snowman_hood':
            return (
                <g>
                    {/* 可爱雪人帽 - Red snowman hood, green ribbon, holly berries */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#e53935" strokeWidth="32" strokeLinecap="round" />
                    {/* White trim cuff */}
                    <rect x="75" y="85" width="150" height="15" rx="7.5" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* Green ribbon with berries on top */}
                    <rect x="135" y="16" width="30" height="6" fill="#4caf50" />
                    <circle cx="150" cy="19" r="4" fill="#ffeb3b" />
                </g>
            );
        case 'hat_sleep_mask_panda':
            return (
                <g>
                    {/* 晚安秘境 - Panda sleeping mask on forehead */}
                    <rect x="100" y="65" width="100" height="32" rx="16" fill="#fff" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="120" cy="81" rx="14" ry="11" fill="#212121" />
                    <ellipse cx="180" cy="81" rx="14" ry="11" fill="#212121" />
                    <circle cx="120" cy="81" r="3.5" fill="#fff" />
                    <circle cx="180" cy="81" r="3.5" fill="#fff" />
                    <ellipse cx="150" cy="88" rx="4" ry="2.5" fill="#ffab91" />
                    {/* Elastic strap */}
                    <path d="M 100 81 Q 80 81 72 85" fill="none" stroke="#333" strokeWidth="2" />
                    <path d="M 200 81 Q 220 81 228 85" fill="none" stroke="#333" strokeWidth="2" />
                </g>
            );
        case 'hat_spooky_monster':
            return (
                <g>
                    {/* 搞怪一下 - Purple alien monster headband with springy googly antennae */}
                    <path d="M 90 75 Q 150 50 210 75" fill="none" stroke="#ba68c8" strokeWidth="6" strokeLinecap="round" />
                    {/* Springy antennae */}
                    <path d="M 120 54 Q 110 32 122 15" fill="none" stroke="#7b1fa2" strokeWidth="2" />
                    <circle cx="122" cy="15" r="7.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="122" cy="15" r="3" fill="#212121" />
                    
                    <path d="M 180 54 Q 190 32 178 15" fill="none" stroke="#7b1fa2" strokeWidth="2" />
                    <circle cx="178" cy="15" r="7.5" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="178" cy="15" r="3" fill="#212121" />
                </g>
            );
        case 'hat_retro_octagonal':
            return (
                <g>
                    {/* 复古八角帽 - Brown corduroy newsboy cap with brooch */}
                    <path d="M 80 85 C 75 35, 225 35, 220 85 Z" fill="#8d6e63" stroke="#333" strokeWidth="2.5" />
                    <path d="M 90 85 Q 150 40 210 85" fill="#a1887f" />
                    {/* Visor brim */}
                    <path d="M 90 83 Q 150 96 210 83 Z" fill="#5d4037" stroke="#333" strokeWidth="1.5" />
                    {/* Tiny brooch on left */}
                    <circle cx="108" cy="74" r="4.5" fill="#e91e63" stroke="#ffd700" strokeWidth="1" />
                    <circle cx="114" cy="76" r="3" fill="#ffd700" />
                </g>
            );
        case 'hat_top_ranking_cap':
            return (
                <g>
                    {/* 名列前"帽" - Dark brown athletic baseball cap with "B" gold badge */}
                    <path d="M 90 85 Q 150 32 210 85 Z" fill="#4e342e" stroke="#333" strokeWidth="2.5" />
                    {/* Visor cap brim */}
                    <path d="M 90 83 Q 150 97 210 83 Z" fill="#3e2723" stroke="#333" strokeWidth="2" />
                    {/* Golden badge with B */}
                    <circle cx="150" cy="62" r="9" fill="#ffd700" stroke="#333" strokeWidth="1.5" />
                    <path d="M 148 57 L 152 57 Q 155 57 155 60 Q 155 62 152 62 L 148 62 L 148 67 M 148 62 L 152 62 Q 155 62 155 65 Q 155 67 152 67 L 148 67" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Yellow line decoration */}
                    <path d="M 98 80 Q 150 56 202 80" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                </g>
            );
        case 'hat_pirate_captain':
            return (
                <g>
                    {/* 海风之影帽 - Pirate captain dark blue tricorn hat with white feather */}
                    <path d="M 70 80 L 150 30 L 230 80 Q 150 95 70 80 Z" fill="#1a237e" stroke="#333" strokeWidth="2.5" />
                    <path d="M 75 75 Q 150 42 225 75" fill="none" stroke="#ffd700" strokeWidth="2.5" />
                    {/* Red strap and gem */}
                    <rect x="144" y="65" width="12" height="15" fill="#c62828" stroke="#333" strokeWidth="1" />
                    <circle cx="150" cy="78" r="4" fill="#0288d1" stroke="#fff" strokeWidth="1" />
                    {/* White feather drifting left */}
                    <path d="M 100 50 Q 75 25 55 42 Q 78 38 95 52" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
                </g>
            );
        case 'hat_scholar_confucian':
            return (
                <g>
                    {/* 雅士儒巾 - Black Confucian scholar hat with rounded back-cuff */}
                    <path d="M 95 85 L 95 40 Q 150 18 205 40 L 205 85 Z" fill="#212121" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="40" rx="55" ry="12" fill="#37474f" />
                    {/* Hanging back panel drapes */}
                    <path d="M 90 85 L 72 170 L 88 170 Z" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    <path d="M 210 85 L 228 170 L 212 170 Z" fill="#212121" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hat_green_leaf_crown':
            return (
                <g>
                    {/* 翠叶王冠 - Royal crown of gold & dark green leaves with jade gems */}
                    <path d="M 85 80 L 92 48 L 112 65 L 132 40 L 150 58 L 168 40 L 188 65 L 208 48 L 215 80 Z" fill="#ffd700" stroke="#333" strokeWidth="2" />
                    {/* Dark green leaves overlays */}
                    <path d="M 90 74 C 95 62, 105 62, 110 74" fill="#2e7d32" />
                    <path d="M 130 74 C 135 60, 145 60, 150 74" fill="#2e7d32" />
                    <path d="M 190 74 C 195 62, 205 62, 210 74" fill="#2e7d32" />
                    {/* Jade gems */}
                    <circle cx="150" cy="58" r="4.5" fill="#4db6ac" stroke="#00796b" strokeWidth="1.5" />
                    <circle cx="112" cy="65" r="3.5" fill="#4db6ac" stroke="#00796b" strokeWidth="1.5" />
                    <circle cx="188" cy="65" r="3.5" fill="#4db6ac" stroke="#00796b" strokeWidth="1.5" />
                </g>
            );
        case 'hat_picnic_bandana':
            return (
                <g>
                    {/* 野餐头巾 - Bright yellow checkered bandana with pink/yellow flower clips */}
                    <path d="M 80 85 C 80 35, 220 35, 220 85" fill="#fff59d" stroke="#333" strokeWidth="2" />
                    <path d="M 100 85 Q 150 45 200 85" fill="#fffde7" opacity="0.8" />
                    {/* Checkered lines */}
                    <path d="M 115 48 Q 130 85 130 85 M 150 42 Q 150 85 150 85 M 185 48 Q 170 85 170 85" stroke="#fbc02d" strokeWidth="2.5" />
                    <path d="M 90 70 Q 150 50 210 70 M 95 60 Q 150 40 205 60" stroke="#fbc02d" strokeWidth="2.5" fill="none" />
                    {/* Flower hair clips on left */}
                    <circle cx="96" cy="74" r="5" fill="#f48fb1" />
                    <circle cx="96" cy="74" r="1.5" fill="#fff" />
                    <circle cx="106" cy="80" r="4.5" fill="#ffe082" />
                    <circle cx="106" cy="80" r="1.5" fill="#fff" />
                </g>
            );
        case 'hat_cycling_silver':
            return (
                <g>
                    {/* 银色骑行头盔 - Silver-and-grey aerodynamic cycling helmet */}
                    <path d="M 85 85 Q 150 20 215 85 Z" fill="#cfd8dc" stroke="#333" strokeWidth="2.5" />
                    {/* Vent patterns */}
                    <path d="M 110 55 Q 130 75 140 85" fill="none" stroke="#78909c" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 190 55 Q 170 75 160 85" fill="none" stroke="#78909c" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 150 35 L 150 72" fill="none" stroke="#78909c" strokeWidth="5.5" strokeLinecap="round" />
                </g>
            );
        case 'hat_cycling_pink':
            return (
                <g>
                    {/* 粉色骑行头盔 - Pink-and-black aerodynamic cycling helmet */}
                    <path d="M 85 85 Q 150 20 215 85 Z" fill="#f8bbd0" stroke="#333" strokeWidth="2.5" />
                    {/* Vent patterns */}
                    <path d="M 110 55 Q 130 75 140 85" fill="none" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 190 55 Q 170 75 160 85" fill="none" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 150 35 L 150 72" fill="none" stroke="#212121" strokeWidth="5.5" strokeLinecap="round" />
                </g>
            );
        case 'hat_warm_red_beanie':
            return (
                <g>
                    {/* 锦绒毛线帽 - White knit beanie, red cuff, red fluffy pom-pom */}
                    <path d="M 85 90 Q 150 20 215 90 Z" fill="#ffffff" stroke="#333" strokeWidth="2.5" />
                    {/* Thick red roll-up cuff */}
                    <rect x="80" y="80" width="140" height="15" rx="5" fill="#e53935" stroke="#333" strokeWidth="2" />
                    {/* Red pom-pom on top */}
                    <circle cx="150" cy="20" r="11" fill="#e53935" stroke="#333" strokeWidth="1.5" />
                    <circle cx="150" cy="20" r="8" fill="#d32f2f" strokeDasharray="2 2" />
                </g>
            );
        case 'hat_doggy_snow_hood':
            return (
                <g>
                    {/* 汪汪雪帽 - Beige dog winter hood topped with red ski goggles */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#d7ccc8" strokeWidth="32" strokeLinecap="round" />
                    {/* Floppy ears */}
                    <path d="M 62 70 C 44 75, 44 140, 60 135 Z" fill="#d7ccc8" stroke="#333" strokeWidth="1.5" />
                    <path d="M 238 70 C 256 75, 256 140, 240 135 Z" fill="#d7ccc8" stroke="#333" strokeWidth="1.5" />
                    {/* Red goggles */}
                    <rect x="98" y="44" width="104" height="24" rx="12" fill="#e53935" stroke="#333" strokeWidth="2" />
                    <rect x="104" y="48" width="42" height="16" rx="8" fill="#80deea" opacity="0.8" />
                    <rect x="154" y="48" width="42" height="16" rx="8" fill="#80deea" opacity="0.8" />
                    <line x1="146" y1="56" x2="154" y2="56" stroke="#e53935" strokeWidth="4" />
                </g>
            );
        case 'hat_flower_sun_hat':
            return (
                <g>
                    {/* 花语云端遮阳帽 - White wide-brimmed ladies' sun hat with a light blue rose */}
                    <path d="M 90 85 Q 150 35 210 85 Z" fill="#ffffff" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="78" ry="10" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* Ribbon wrap */}
                    <rect x="91" y="80" width="118" height="5" fill="#80deea" />
                    {/* Light blue rose on left */}
                    <circle cx="108" cy="78" r="6" fill="#80d8ff" stroke="#00b0ff" strokeWidth="1" />
                    <circle cx="103" cy="80" r="4.5" fill="#e0f7fa" />
                    <circle cx="113" cy="80" r="4.5" fill="#e0f7fa" />
                </g>
            );
        case 'hat_cowboy_wind':
            return (
                <g>
                    {/* 逐风行者帽 - Rugged classic brown leather cowboy hat */}
                    <path d="M 85 85 Q 150 25 215 85 Z" fill="#8d6e63" stroke="#333" strokeWidth="2.5" />
                    {/* Curled brim */}
                    <path d="M 65 85 Q 150 102 235 85 Q 150 78 65 85" fill="#5d4037" stroke="#333" strokeWidth="2" />
                    {/* Woven strap */}
                    <rect x="86" y="80" width="128" height="5" fill="#ffe082" stroke="#333" strokeWidth="1" />
                </g>
            );
        case 'hat_ranger_star':
            return (
                <g>
                    {/* 拾光宽檐帽 - Brown ranger hat with sheriff star badge */}
                    <path d="M 90 85 L 105 45 Q 150 38 195 45 L 210 85 Z" fill="#a1887f" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="74" ry="9" fill="#8d6e63" stroke="#333" strokeWidth="2" />
                    {/* Blue & white strap */}
                    <rect x="91" y="78" width="118" height="7" fill="#1565c0" />
                    {/* Gold sheriff star */}
                    <path d="M 150 56 L 152 61 L 157 61 L 153 64 L 155 69 L 150 66 L 145 69 L 147 64 L 143 61 L 148 61 Z" fill="#ffd700" stroke="#ffb300" strokeWidth="1" />
                </g>
            );
        case 'hat_night_butterfly':
            return (
                <g>
                    {/* 贵气夜蝶礼帽 - Black-and-white dress hat with blue morpho butterfly */}
                    <path d="M 90 85 Q 150 35 210 85 Z" fill="#212121" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="72" ry="9" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* White lace/band */}
                    <rect x="91" y="79" width="118" height="6" fill="#f5f5f5" />
                    {/* Blue Morpho butterfly ornament on left */}
                    <g transform="translate(100, 72) scale(0.8)">
                        <path d="M 0 0 C -10 -15, -15 -10, -5 -2 Q -12 8, 0 4 Q 12 8, 5 -2 C 15 -10, 10 -15, 0 0" fill="#00e5ff" stroke="#00b0ff" strokeWidth="1" />
                        <circle cx="0" cy="0" r="1.5" fill="#fff" />
                    </g>
                </g>
            );
        case 'hat_fairy_crown':
            return (
                <g>
                    {/* 童话王冠 - Elegant fairytale shiny golden crown, rubies */}
                    <path d="M 95 80 L 105 45 L 125 65 L 150 35 L 175 65 L 195 45 L 205 80 Z" fill="#ffd700" stroke="#333" strokeWidth="2" />
                    {/* Red rubies */}
                    <circle cx="150" cy="35" r="4" fill="#d32f2f" stroke="#fff" strokeWidth="1" />
                    <circle cx="105" cy="45" r="3" fill="#d32f2f" stroke="#fff" strokeWidth="1" />
                    <circle cx="195" cy="45" r="3" fill="#d32f2f" stroke="#fff" strokeWidth="1" />
                    <circle cx="125" cy="65" r="2.5" fill="#d32f2f" />
                    <circle cx="175" cy="65" r="2.5" fill="#d32f2f" />
                </g>
            );
        case 'hat_dreamy_tiara':
            return (
                <g>
                    {/* 梦幻花帽 - Gold & red tiara set with pearls */}
                    <path d="M 95 80 Q 150 50 205 80" fill="none" stroke="#ffd700" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 110 77 Q 150 42 190 77" fill="none" stroke="#d32f2f" strokeWidth="3" />
                    {/* Pearls on points */}
                    <circle cx="150" cy="42" r="4.5" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <circle cx="130" cy="52" r="3.5" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <circle cx="170" cy="52" r="3.5" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <circle cx="112" cy="65" r="3" fill="#fff" stroke="#ccc" strokeWidth="1" />
                    <circle cx="188" cy="65" r="3" fill="#fff" stroke="#ccc" strokeWidth="1" />
                </g>
            );
        case 'hat_sunset_beret':
            return (
                <g>
                    {/* 落日贝雷帽 - Retro orange-brown newsboy/beret cap */}
                    <path d="M 85 85 C 80 40, 220 40, 215 85 Z" fill="#d84315" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="68" ry="7" fill="#bf360c" />
                    <path d="M 95 83 Q 150 94 205 83 Z" fill="#3e2723" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hat_capybara_bucket':
            return (
                <g>
                    {/* 卡皮巴拉渔夫帽 - Beige bucket hat with capybara patch */}
                    <path d="M 92 85 L 104 50 Q 150 44 196 50 L 208 85 Z" fill="#d7ccc8" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="62" ry="7" fill="#b0bec5" stroke="#333" strokeWidth="2" />
                    {/* Capybara face patch */}
                    <rect x="135" y="56" width="30" height="22" rx="6" fill="#8d6e63" stroke="#333" strokeWidth="1.5" />
                    <circle cx="142" cy="63" r="1.5" fill="#fff" />
                    <circle cx="158" cy="63" r="1.5" fill="#fff" />
                    <ellipse cx="150" cy="68" rx="3" ry="1.5" fill="#5d4037" />
                </g>
            );
        case 'hat_farm_sun_hat':
            return (
                <g>
                    {/* 耕耘阳光帽 - Straw hat with distressed raw edges */}
                    <path d="M 92 85 Q 150 35 208 85 Z" fill="#ffe082" stroke="#333" strokeWidth="2.5" />
                    {/* Brim with frayed endpoints */}
                    <ellipse cx="150" cy="85" rx="74" ry="10" fill="#ffd54f" stroke="#333" strokeWidth="2" />
                    <line x1="74" y1="85" x2="68" y2="85" stroke="#333" strokeWidth="1.5" />
                    <line x1="226" y1="85" x2="232" y2="85" stroke="#333" strokeWidth="1.5" />
                    <line x1="100" y1="92" x2="96" y2="96" stroke="#333" strokeWidth="1.5" />
                    <line x1="200" y1="92" x2="204" y2="96" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hat_elf_laurel':
            return (
                <g>
                    {/* 精灵桂冠 - Elven branch tiara, teardrop crystal */}
                    <path d="M 90 80 Q 150 48 210 80" fill="none" stroke="#cfd8dc" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 102 74 Q 150 38 198 74" fill="none" stroke="#b0bec5" strokeWidth="1.5" />
                    {/* Delicate silver branches */}
                    <path d="M 125 61 L 115 48 M 175 61 L 185 48" stroke="#cfd8dc" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Glowing light-blue teardrop crystal center */}
                    <path d="M 150 36 C 146 45, 146 54, 150 54 C 154 54, 154 45, 150 36 Z" fill="#80deea" stroke="#00b0ff" strokeWidth="1" />
                    <circle cx="150" cy="48" r="1.5" fill="#fff" />
                </g>
            );
        case 'hat_forest_wreath':
            return (
                <g>
                    {/* 密林花冠 - Forest leaf wreath with white/yellow flowers */}
                    <path d="M 88 80 Q 150 42 212 80" fill="none" stroke="#4caf50" strokeWidth="7" strokeLinecap="round" strokeDasharray="14 3" />
                    <path d="M 95 72 Q 150 36 205 72" fill="none" stroke="#81c784" strokeWidth="3" />
                    {/* Small yellow & white flowers */}
                    <circle cx="112" cy="62" r="4.5" fill="#fff" />
                    <circle cx="112" cy="62" r="1.5" fill="#ffd54f" />
                    
                    <circle cx="150" cy="46" r="5.5" fill="#ffd54f" />
                    <circle cx="150" cy="46" r="1.5" fill="#fff" />
                    
                    <circle cx="188" cy="62" r="4.5" fill="#fff" />
                    <circle cx="188" cy="62" r="1.5" fill="#ffd54f" />
                </g>
            );
        case 'hat_waltz_mask':
            return (
                <g>
                    {/* 圆舞曲面具 - Black bat masquerade mask worn slanted on face/forehead */}
                    <g transform="translate(10, 20) rotate(-12, 150, 110)">
                        <path d="M 104 100 Q 130 92 150 108 Q 170 92 196 100 Q 204 122 150 118 Q 96 122 104 100 Z" fill="#212121" stroke="#111" strokeWidth="2" />
                        <ellipse cx="126" cy="106" rx="9" ry="5" fill="#fff" />
                        <ellipse cx="174" cy="106" rx="9" ry="5" fill="#fff" />
                        <circle cx="126" cy="106" r="4.5" fill="#212121" />
                        <circle cx="174" cy="106" r="4.5" fill="#212121" />
                        {/* Red rose decoration */}
                        <circle cx="100" cy="100" r="6" fill="#e53935" />
                        <circle cx="96" cy="102" r="4" fill="#b71c1c" />
                    </g>
                </g>
            );
        case 'hat_devil_horns':
            return (
                <g>
                    {/* 小恶魔发箍 - Headband, red glowing horns */}
                    <path d="M 90 75 Q 150 50 210 75" fill="none" stroke="#212121" strokeWidth="6" strokeLinecap="round" />
                    {/* Red horns */}
                    <path d="M 96 66 Q 80 50 78 32 Q 92 42 104 58" fill="#e53935" stroke="#b71c1c" strokeWidth="1.5" />
                    <path d="M 204 66 Q 220 50 222 32 Q 208 42 196 58" fill="#e53935" stroke="#b71c1c" strokeWidth="1.5" />
                </g>
            );
        case 'hat_galaxy_wizard':
            return (
                <g>
                    {/* 星空魔法帽 - Dark blue wizard hat with white stars & yellow crescent moon */}
                    <path d="M 92 85 L 132 20 L 152 2 Q 166 22 168 40 L 208 85 Z" fill="#0d47a1" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="72" ry="9" fill="#0d47a1" stroke="#333" strokeWidth="2" />
                    {/* Yellow crescent moon */}
                    <path d="M 152 14 Q 164 12 164 22 Q 154 26 150 18 Z" fill="#ffd54f" />
                    {/* Small stars */}
                    <circle cx="124" cy="56" r="2" fill="#fff" />
                    <circle cx="180" cy="62" r="1.5" fill="#fff" />
                </g>
            );
        case 'hat_gem_wizard':
            return (
                <g>
                    {/* 宝石魔法帽 - Purple wizard hat with a glowing purple gemstone */}
                    <path d="M 92 85 L 132 20 L 152 2 Q 166 22 168 40 L 208 85 Z" fill="#6a1b9a" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="72" ry="9" fill="#6a1b9a" stroke="#333" strokeWidth="2" />
                    {/* Purple gemstone brooch */}
                    <circle cx="150" cy="74" r="8" fill="#ab47bc" stroke="#e1bee7" strokeWidth="1.5" />
                    <polygon points="150,68 155,74 150,80 145,74" fill="#e1bee7" />
                    <circle cx="124" cy="56" r="1.5" fill="#fff" />
                    <circle cx="180" cy="62" r="2" fill="#fff" />
                </g>
            );
        case 'hat_rabbit_ears_hat':
            return (
                <g>
                    {/* 兔耳礼帽 - White & red striped hatter top hat, rabbit ears */}
                    {/* Rabbit ears popping out */}
                    <path d="M 125 22 Q 110 -15 118 -20 Q 134 -15 132 22 Z" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <path d="M 125 12 Q 118 -8 122 -12 Q 130 -8 128 12 Z" fill="#ffab91" />
                    <path d="M 175 22 Q 190 -15 182 -20 Q 166 -15 168 22 Z" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <path d="M 175 12 Q 182 -8 178 -12 Q 170 -8 172 12 Z" fill="#ffab91" />
                    {/* The Hat */}
                    <rect x="105" y="20" width="90" height="55" rx="2" fill="#fff" stroke="#333" strokeWidth="2.5" />
                    <path d="M 105 32 H 195 M 105 44 H 195 M 105 56 H 195 M 105 68 H 195" stroke="#d32f2f" strokeWidth="4" />
                    <ellipse cx="150" cy="75" rx="65" ry="8" fill="#d32f2f" stroke="#333" strokeWidth="2" />
                </g>
            );
        case 'hat_witch_hat':
            return (
                <g>
                    {/* 巫师帽 - Crooked dark brown witch hat decorated with golden leaves */}
                    <path d="M 92 85 L 122 35 Q 118 10 135 15 Q 148 20 152 42 L 208 85 Z" fill="#3e2723" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="76" ry="10" fill="#3e2723" stroke="#333" strokeWidth="2" />
                    {/* Golden leaves ornament band */}
                    <rect x="98" y="77" width="104" height="6" fill="#ffd700" />
                    <path d="M 150 77 L 156 68 L 162 77" fill="#ffb300" />
                </g>
            );
        case 'hat_golden_laurel':
            return (
                <g>
                    {/* 金色羽毛发饰 - Golden leaf crown / laurel wreath resting over hair */}
                    <path d="M 90 75 Q 150 48 210 75" fill="none" stroke="#ffd700" strokeWidth="3" />
                    <path d="M 92 70 C 85 64, 88 56, 96 62" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                    <path d="M 112 62 C 105 56, 108 48, 116 54" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                    <path d="M 132 58 C 125 52, 128 44, 136 50" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                    <path d="M 208 70 C 215 64, 212 56, 204 62" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                    <path d="M 188 62 C 195 56, 192 48, 184 54" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                    <path d="M 168 58 C 175 52, 172 44, 164 50" fill="#ffb300" stroke="#333" strokeWidth="0.8" />
                </g>
            );
        case 'hat_lightblue_beret':
            return (
                <g>
                    {/* 浅蓝贝雷帽 - Cozy light blue beret with a smiley face badge */}
                    <path d="M 85 85 C 80 40, 220 40, 215 85 Z" fill="#b3e5fc" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="68" ry="7" fill="#81d4fa" />
                    {/* Smiley face badge */}
                    <circle cx="115" cy="68" r="6" fill="#ffeb3b" stroke="#333" strokeWidth="1" />
                    <circle cx="113" cy="66" r="0.8" fill="#333" />
                    <circle cx="117" cy="66" r="0.8" fill="#333" />
                    <path d="M 112 69 Q 115 71 118 69" fill="none" stroke="#333" strokeWidth="0.8" />
                </g>
            );
        case 'hat_lion_dance_hat':
            return (
                <g>
                    {/* 暖冬纳福醒狮帽 - Traditional Chinese lion dance head winter hat */}
                    <path d="M 75 110 Q 150 10 225 110" fill="none" stroke="#d32f2f" strokeWidth="32" strokeLinecap="round" />
                    {/* Fluffy white rim */}
                    <rect x="75" y="85" width="150" height="15" rx="7.5" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* Lion eyes */}
                    <circle cx="114" cy="56" r="14" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="114" cy="56" r="7" fill="#ffb300" />
                    <circle cx="114" cy="56" r="3.5" fill="#212121" />
                    
                    <circle cx="186" cy="56" r="14" fill="#fff" stroke="#333" strokeWidth="1.5" />
                    <circle cx="186" cy="56" r="7" fill="#ffb300" />
                    <circle cx="186" cy="56" r="3.5" fill="#212121" />
                    {/* Lion horn in center */}
                    <path d="M 144 32 L 150 15 L 156 32 Z" fill="#ffb300" stroke="#333" strokeWidth="1.5" />
                </g>
            );
        case 'hat_nomad_ushanka':
            return (
                <g>
                    {/* 毛绒游牧帽 - Nomadic ushanka ear-flap hat */}
                    <path d="M 82 85 Q 150 20 218 85 Z" fill="#8d6e63" stroke="#333" strokeWidth="2.5" />
                    {/* Soft fur ear flaps */}
                    <rect x="70" y="80" width="16" height="42" rx="8" fill="#f5f5f5" stroke="#333" strokeWidth="1.5" />
                    <rect x="214" y="80" width="16" height="42" rx="8" fill="#f5f5f5" stroke="#333" strokeWidth="1.5" />
                    {/* Front folded cuff with patterns */}
                    <path d="M 82 80 H 218 V 95 H 82 Z" fill="#d7ccc8" stroke="#333" strokeWidth="2" />
                    <path d="M 90 87 L 150 87 L 210 87" fill="none" stroke="#d32f2f" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>
            );
        case 'hat_cowboy_wild':
            return (
                <g>
                    {/* 野性牛仔帽 - Rugged dark brown leather cowboy hat, silver bead band */}
                    <path d="M 85 85 Q 150 25 215 85 Z" fill="#4e342e" stroke="#333" strokeWidth="2.5" />
                    {/* Curled brim */}
                    <path d="M 65 85 Q 150 102 235 85 Q 150 78 65 85" fill="#3e2723" stroke="#333" strokeWidth="2" />
                    {/* Silver bead band */}
                    <path d="M 86 82 Q 150 86 214 82" fill="none" stroke="#cfd8dc" strokeWidth="2" strokeDasharray="3 3" />
                </g>
            );
        case 'hat_elegant_butterfly':
            return (
                <g>
                    {/* 典雅蝴蝶帽 - Blue-and-white dress hat, blue morpho butterfly */}
                    <path d="M 90 85 Q 150 35 210 85 Z" fill="#1565c0" stroke="#333" strokeWidth="2.5" />
                    <ellipse cx="150" cy="85" rx="72" ry="9" fill="#ffffff" stroke="#333" strokeWidth="2" />
                    {/* Ribbon wrap */}
                    <rect x="91" y="80" width="118" height="5" fill="#ffffff" />
                    {/* Blue butterfly on left */}
                    <g transform="translate(100, 72) scale(0.8)">
                        <path d="M 0 0 C -10 -15, -15 -10, -5 -2 Q -12 8, 0 4 Q 12 8, 5 -2 C 15 -10, 10 -15, 0 0" fill="#29b6f6" stroke="#0288d1" strokeWidth="1" />
                        <circle cx="0" cy="0" r="1.5" fill="#fff" />
                    </g>
                </g>
            );
        default:
            return null;
    }
}

function renderDeskAcc(deskAcc: string) {
    switch (deskAcc) {
        case 'desk_crystal':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="80" rx="40" ry="15" fill="#f5f5f5" stroke="#ccc" strokeWidth="2" />
                    <path d="M 60 70 L 65 30 L 70 70 Z" fill="#e1bee7" opacity="0.8" />
                    <path d="M 75 75 L 80 20 L 85 75 Z" fill="#ce93d8" opacity="0.8" />
                    <path d="M 90 70 L 95 40 L 100 70 Z" fill="#e1bee7" opacity="0.8" />
                    <circle cx="80" cy="70" r="15" fill="#fff" />
                    <circle cx="75" cy="68" r="2" fill="#333" />
                    <circle cx="85" cy="68" r="2" fill="#333" />
                    <path d="M 78 72 Q 80 75 82 72" fill="none" stroke="#333" strokeWidth="1" />
                </g>
            );
        case 'desk_mech_fox':
            return (
                <g transform="translate(-10, 360)">
                    {/* Shadow / Base */}
                    <ellipse cx="80" cy="82" rx="30" ry="10" fill="#37474f" fillOpacity="0.2" />
                    {/* Fox Legs & Body */}
                    <rect x="70" y="55" width="20" height="22" rx="6" fill="#cfd8dc" stroke="#455a64" strokeWidth="1.5" />
                    <circle cx="68" cy="70" r="6" fill="#90a4ae" stroke="#455a64" strokeWidth="1.5" />
                    <circle cx="92" cy="70" r="6" fill="#90a4ae" stroke="#455a64" strokeWidth="1.5" />
                    {/* Chest glowing core */}
                    <polygon points="80,60 84,56 80,52 76,56" fill="#00e676" stroke="#00c853" strokeWidth="0.8" />
                    {/* Head */}
                    <circle cx="80" cy="42" r="13" fill="#cfd8dc" stroke="#455a64" strokeWidth="1.5" />
                    <polygon points="69,38 62,28 73,34" fill="#90a4ae" stroke="#455a64" strokeWidth="1" />
                    <polygon points="91,38 98,28 87,34" fill="#90a4ae" stroke="#455a64" strokeWidth="1" />
                    {/* Eyes & nose */}
                    <circle cx="76" cy="42" r="1.5" fill="#00e676" />
                    <circle cx="84" cy="42" r="1.5" fill="#00e676" />
                    <polygon points="80,45 82,47 78,47" fill="#37474f" />
                    {/* Cyan headphones */}
                    <path d="M 66 42 Q 80 26 94 42" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
                    <rect x="63" y="38" width="6" height="9" rx="2" fill="#00b0ff" />
                    <rect x="91" y="38" width="6" height="9" rx="2" fill="#00b0ff" />
                    {/* Metallic tail */}
                    <path d="M 90 68 Q 106 58 102 74 Q 92 78 90 68 Z" fill="#cfd8dc" stroke="#455a64" strokeWidth="1.2" />
                </g>
            );
        case 'desk_leather_balloon':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="10" fill="#37474f" fillOpacity="0.2" />
                    {/* Left wire stand & balloon */}
                    <line x1="68" y1="80" x2="68" y2="45" stroke="#78909c" strokeWidth="1.5" />
                    <path d="M 68 45 C 56 45, 54 20, 68 15 C 82 20, 80 45, 68 45 Z" fill="#a1887f" stroke="#5d4037" strokeWidth="1.2" />
                    <line x1="61" y1="20" x2="75" y2="40" stroke="#8d6e63" strokeWidth="0.8" />
                    <line x1="75" y1="20" x2="61" y2="40" stroke="#8d6e63" strokeWidth="0.8" />
                    {/* Right wire stand & balloon (smaller/tilted) */}
                    <line x1="90" y1="80" x2="90" y2="52" stroke="#78909c" strokeWidth="1.2" />
                    <path d="M 90 52 C 80 52, 78 30, 90 26 C 102 30, 100 52, 90 52 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1" />
                </g>
            );
        case 'desk_alpaca':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="8" fill="#37474f" fillOpacity="0.15" />
                    {/* Fluffy body */}
                    <rect x="66" y="52" width="28" height="22" rx="10" fill="#f5f5f5" stroke="#b0bec5" strokeWidth="1.5" />
                    <circle cx="68" cy="72" r="5" fill="#f5f5f5" stroke="#b0bec5" strokeWidth="1.2" />
                    <circle cx="92" cy="72" r="5" fill="#f5f5f5" stroke="#b0bec5" strokeWidth="1.2" />
                    {/* Neck & Head */}
                    <rect x="66" y="38" width="10" height="18" rx="4" fill="#f5f5f5" stroke="#b0bec5" strokeWidth="1.5" />
                    <circle cx="71" cy="34" r="7.5" fill="#f5f5f5" stroke="#b0bec5" strokeWidth="1.5" />
                    {/* Snout & ears */}
                    <ellipse cx="71" cy="36" rx="4" ry="3" fill="#ffe0b2" />
                    <circle cx="71" cy="36" r="0.8" fill="#333" />
                    <path d="M 66 28 L 68 33" stroke="#b0bec5" strokeWidth="1.5" />
                    <path d="M 76 28 L 74 33" stroke="#b0bec5" strokeWidth="1.5" />
                    {/* Party Hat */}
                    <polygon points="71,16 67,27 75,27" fill="#ff8a80" />
                    <circle cx="71" cy="15" r="1.5" fill="#ffb74d" />
                    {/* Colorful Bead Necklace */}
                    <circle cx="71" cy="50" r="5" fill="none" stroke="#ba68c8" strokeWidth="2.2" strokeDasharray="3 3" />
                </g>
            );
        case 'desk_mint_icecream':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Tall sundae glass */}
                    <path d="M 72 80 L 88 80 L 83 72 L 77 72 Z" fill="#e0f7fa" stroke="#80deea" strokeWidth="1" />
                    <line x1="80" y1="72" x2="80" y2="52" stroke="#80deea" strokeWidth="2" />
                    <path d="M 68 28 L 92 28 L 86 52 L 74 52 Z" fill="#e0f7fa" fillOpacity="0.4" stroke="#80deea" strokeWidth="1.2" />
                    {/* Mint ice cream scoops */}
                    <circle cx="76" cy="32" r="9" fill="#a7ffeb" stroke="#64ffda" strokeWidth="1" />
                    <circle cx="84" cy="32" r="9" fill="#a7ffeb" stroke="#64ffda" strokeWidth="1" />
                    <circle cx="80" cy="24" r="8" fill="#ffffff" />
                    {/* Cherry on top */}
                    <circle cx="80" cy="16" r="3.5" fill="#ff1744" />
                    <path d="M 80 13 Q 84 5 88 8" fill="none" stroke="#d50000" strokeWidth="1" />
                    {/* Wafer stick */}
                    <line x1="62" y1="16" x2="74" y2="34" stroke="#8d6e63" strokeWidth="2.5" strokeDasharray="2 2" />
                </g>
            );
        case 'desk_brush_holder':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="8" fill="#37474f" fillOpacity="0.15" />
                    {/* Porcelain Jar */}
                    <rect x="68" y="44" width="24" height="34" rx="4" fill="#fafafa" stroke="#1e88e5" strokeWidth="1.5" />
                    {/* Blue floral pattern */}
                    <circle cx="80" cy="61" r="5" fill="none" stroke="#1565c0" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 75 61 H 85" stroke="#1565c0" strokeWidth="1" />
                    {/* Calligraphy Brushes inside */}
                    <line x1="74" y1="44" x2="68" y2="18" stroke="#3e2723" strokeWidth="2" />
                    <path d="M 68 18 L 65 10 L 71 18 Z" fill="#cfd8dc" stroke="#37474f" strokeWidth="0.8" />
                    <line x1="86" y1="44" x2="92" y2="15" stroke="#3e2723" strokeWidth="2" />
                    <path d="M 92 15 L 95 6 L 89 15 Z" fill="#cfd8dc" stroke="#37474f" strokeWidth="0.8" />
                    {/* Resting brush in front */}
                    <path d="M 60 76 L 68 76 L 64 71 Z" fill="#90a4ae" stroke="#37474f" strokeWidth="0.8" />
                    <line x1="52" y1="74" x2="88" y2="74" stroke="#3e2723" strokeWidth="1.8" />
                    <path d="M 88 74 L 96 74 L 88 71 Z" fill="#333" />
                    {/* Sakura petals scattered */}
                    <circle cx="56" cy="80" r="1.5" fill="#f8bbd0" />
                    <circle cx="94" cy="78" r="1.5" fill="#f8bbd0" />
                </g>
            );
        case 'desk_persimmon_tea':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Pumpkin styled Latte Mug */}
                    <path d="M 70 42 L 90 42 L 86 78 L 74 78 Z" fill="#ffb74d" stroke="#e65100" strokeWidth="1.5" />
                    {/* Mug handle */}
                    <path d="M 90 48 Q 98 56 90 64" fill="none" stroke="#e65100" strokeWidth="2" />
                    {/* "Latte" text tag */}
                    <rect x="72" y="52" width="16" height="10" rx="1" fill="#fffde7" stroke="#e65100" strokeWidth="0.5" />
                    <text x="80" y="59" fontSize="6" fill="#e65100" textAnchor="middle" fontWeight="bold">Latte</text>
                    {/* Frothy whipped cream */}
                    <path d="M 69 42 Q 80 34 91 42" fill="#fffdf7" stroke="#ffb74d" strokeWidth="1.2" />
                    <circle cx="76" cy="38" r="4.5" fill="#fffdf7" />
                    <circle cx="84" cy="38" r="4.5" fill="#fffdf7" />
                    <circle cx="80" cy="34" r="5" fill="#fffdf7" />
                    {/* Cinnamon / straw sticks */}
                    <line x1="82" y1="36" x2="88" y2="18" stroke="#8d6e63" strokeWidth="2.5" />
                    {/* Tiny cute persimmons near base */}
                    <circle cx="64" cy="76" r="4.5" fill="#ff7043" stroke="#d84315" strokeWidth="0.8" />
                    <path d="M 64 71.5 H 66" stroke="#4caf50" strokeWidth="1" />
                    <circle cx="60" cy="78" r="2" fill="#d7ccc8" />
                    <circle cx="62" cy="79" r="1.5" fill="#d7ccc8" />
                </g>
            );
        case 'desk_halloween_house':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Haunted house stone body */}
                    <rect x="66" y="44" width="28" height="32" rx="3" fill="#78909c" stroke="#37474f" strokeWidth="1.5" />
                    {/* Spooky windows & door */}
                    <rect x="71" y="48" width="6" height="8" rx="1" fill="#ffd54f" />
                    <rect x="83" y="48" width="6" height="8" rx="1" fill="#ffd54f" />
                    <path d="M 76 76 L 76 66 Q 80 62 84 66 L 84 76 Z" fill="#3e2723" stroke="#37474f" strokeWidth="1" />
                    {/* Purple cone roof */}
                    <polygon points="80,18 62,45 98,45" fill="#ab47bc" stroke="#4a148c" strokeWidth="1.5" />
                    {/* Pumpkin lantern */}
                    <circle cx="56" cy="74" r="6.5" fill="#ff7043" stroke="#d84315" strokeWidth="1" />
                    <polygon points="54,72 55,75 53,75" fill="#212121" />
                    <polygon points="58,72 59,75 57,75" fill="#212121" />
                    <path d="M 54 77 Q 56 79 58 77" fill="none" stroke="#212121" strokeWidth="1.2" />
                    {/* Ghost floating on top right */}
                    <g transform="translate(94, 25) scale(0.7)">
                        <path d="M -5 10 L -5 0 Q 0 -8 5 0 L 5 10 Q 2 8 0 10 Q -2 8 -5 10 Z" fill="#ffffff" stroke="#ccc" strokeWidth="1" />
                        <circle cx="-1.5" cy="0" r="0.7" fill="#333" />
                        <circle cx="1.5" cy="0" r="0.7" fill="#333" />
                    </g>
                </g>
            );
        case 'desk_magic_potion':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Glass bottle */}
                    <path d="M 74 38 L 86 38 L 86 46 L 94 62 L 94 76 L 66 76 L 66 62 L 74 46 Z" fill="#e0f7fa" fillOpacity="0.3" stroke="#80deea" strokeWidth="1.5" />
                    {/* Swirling Blue liquid inside */}
                    <path d="M 68 62 Q 80 58 92 62 L 92 75 L 68 75 Z" fill="#29b6f6" fillOpacity="0.8" />
                    <circle cx="76" cy="67" r="1.5" fill="#ffffff" opacity="0.6" />
                    <circle cx="84" cy="71" r="1" fill="#ffffff" opacity="0.6" />
                    {/* Cork */}
                    <rect x="76" y="32" width="8" height="6" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    {/* Gold Star Pendant Tag */}
                    <path d="M 80 44 L 88 52" stroke="#ffeb3b" strokeWidth="1.2" />
                    <polygon points="88,52 90,49 92,52 95,52 93,54 94,57 91,55 88,57 89,54 87,52" fill="#ffd700" stroke="#ffb300" strokeWidth="0.5" />
                </g>
            );
        case 'desk_palace_tissue':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="36" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Red Palace Box Body */}
                    <rect x="64" y="50" width="32" height="26" rx="2" fill="#d32f2f" stroke="#7f0000" strokeWidth="1.5" />
                    {/* Gold pillar accents */}
                    <rect x="67" y="52" width="2.5" height="22" fill="#ffca28" />
                    <rect x="90.5" y="52" width="2.5" height="22" fill="#ffca28" />
                    {/* Traditional Gold Roof */}
                    <polygon points="80,34 58,50 102,50" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1.5" />
                    {/* White Tissue peaking out of roof slit */}
                    <path d="M 76 34 C 74 24, 82 20, 80 24 C 82 28, 85 28, 84 34 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                </g>
            );
        case 'desk_golden_teacup':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="38" ry="10" fill="#37474f" fillOpacity="0.15" />
                    {/* Gilded serving tray */}
                    <ellipse cx="80" cy="76" rx="34" ry="8" fill="#fffde7" stroke="#ffd700" strokeWidth="1.8" />
                    {/* White Porcelain Teapot */}
                    <g transform="translate(68, 42)">
                        <rect x="0" y="8" width="16" height="20" rx="6" fill="#fafafa" stroke="#ffd700" strokeWidth="1" />
                        <path d="M 16 12 Q 22 8 20 18" fill="none" stroke="#ffd700" strokeWidth="1.2" />
                        <path d="M 0 16 Q -6 12 -4 8" fill="none" stroke="#ffd700" strokeWidth="1.2" />
                        <circle cx="8" cy="5" r="3.5" fill="#fafafa" stroke="#ffd700" strokeWidth="1" />
                    </g>
                    {/* Small tea cup with golden tea pouring in */}
                    <path d="M 90 66 L 98 66 L 96 73 L 92 73 Z" fill="#fafafa" stroke="#ffd700" strokeWidth="0.8" />
                    <path d="M 66 50 Q 82 48 93 67" fill="none" stroke="#ffa000" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 1" />
                </g>
            );
        case 'desk_apple_glasses_case':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Apple shaped open glass dome */}
                    <path d="M 64 62 C 60 40, 70 30, 80 32 C 90 30, 100 40, 96 62 C 94 78, 66 78, 64 62 Z" fill="#e0f2f1" fillOpacity="0.35" stroke="#ef5350" strokeWidth="2" />
                    <path d="M 79 32 Q 81 24 84 26" fill="none" stroke="#8d6e63" strokeWidth="1.5" />
                    <path d="M 81 25 Q 86 21 85 24 Z" fill="#4caf50" />
                    {/* Miniature Christmas snowman and tree inside */}
                    <g transform="translate(80, 58)">
                        <circle cx="-6" cy="12" r="4.5" fill="#fff" />
                        <circle cx="-6" cy="6" r="3" fill="#fff" />
                        <circle cx="-6" cy="6" r="0.6" fill="#333" />
                        <polygon points="-6,6 -2,6 -6,8" fill="#ff7043" />
                        <polygon points="6,2 2,12 10,12" fill="#2e7d32" />
                        <polygon points="6,-2 3,6 9,6" fill="#2e7d32" />
                        <rect x="5.2" y="12" width="1.6" height="4" fill="#5d4037" />
                    </g>
                </g>
            );
        case 'desk_modern_calendar':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="8" fill="#37474f" fillOpacity="0.2" />
                    {/* Wooden stand */}
                    <rect x="76" y="56" width="8" height="22" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.2" />
                    <rect x="68" y="74" width="24" height="4" fill="#5d4037" />
                    {/* Circular dial disk */}
                    <circle cx="80" cy="45" r="18" fill="#ffe0b2" stroke="#8d6e63" strokeWidth="2.2" />
                    <circle cx="80" cy="45" r="15" fill="#fff" stroke="#ffb74d" strokeWidth="1" />
                    <line x1="80" y1="30" x2="80" y2="33" stroke="#8d6e63" strokeWidth="1" />
                    <line x1="80" y1="60" x2="80" y2="57" stroke="#8d6e63" strokeWidth="1" />
                    <line x1="65" y1="45" x2="68" y2="45" stroke="#8d6e63" strokeWidth="1" />
                    <line x1="95" y1="45" x2="92" y2="45" stroke="#8d6e63" strokeWidth="1" />
                    <circle cx="80" cy="45" r="2.5" fill="#ffb300" />
                </g>
            );
        case 'desk_lantern_lamp':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="36" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Cherry blossom stand branch */}
                    <path d="M 94 78 Q 94 38 78 30 Q 70 26 74 34" fill="none" stroke="#5d4037" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="86" cy="32" r="2.5" fill="#f8bbd0" stroke="#f48fb1" strokeWidth="0.5" />
                    <circle cx="76" cy="27" r="2" fill="#f8bbd0" stroke="#f48fb1" strokeWidth="0.5" />
                    {/* Hanging red festival lantern */}
                    <line x1="77" y1="31" x2="77" y2="40" stroke="#ffd700" strokeWidth="1.2" />
                    <rect x="71" y="40" width="12" height="16" rx="4" fill="#e53935" stroke="#ffd700" strokeWidth="1.2" />
                    <line x1="77" y1="56" x2="77" y2="62" stroke="#ffd700" strokeWidth="1" />
                    <circle cx="77" cy="62" r="1.5" fill="#e53935" />
                    {/* Dumplings bowl at base */}
                    <ellipse cx="64" cy="74" rx="11" ry="5.5" fill="#fafafa" stroke="#b0bec5" strokeWidth="1" />
                    <circle cx="60" cy="72" r="2" fill="#fff" />
                    <circle cx="64" cy="73" r="2" fill="#fff" />
                    <circle cx="68" cy="72" r="2" fill="#fff" />
                </g>
            );
        case 'desk_lucky_candy':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Red candy bowl */}
                    <path d="M 64 62 Q 80 54 96 62 Q 98 76 80 80 Q 62 76 64 62 Z" fill="#d32f2f" stroke="#ffd700" strokeWidth="1.5" />
                    {/* Mandarins/Tangerines inside */}
                    <circle cx="72" cy="59" r="6" fill="#ff9100" stroke="#e65100" strokeWidth="0.8" />
                    <circle cx="82" cy="58" r="5.5" fill="#ff9100" stroke="#e65100" strokeWidth="0.8" />
                    <circle cx="78" cy="53" r="5" fill="#ff9100" stroke="#e65100" strokeWidth="0.8" />
                    <path d="M 76 48 Q 74 44 71 46 Z" fill="#4caf50" />
                    {/* Wrapped candies */}
                    <polygon points="56,72 52,70 52,74" fill="#ffd54f" />
                    <polygon points="56,72 60,70 60,74" fill="#ffd54f" />
                    <circle cx="56" cy="72" r="2" fill="#ff1744" />
                </g>
            );
        case 'desk_rocking_horse':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="8" fill="#37474f" fillOpacity="0.2" />
                    {/* Red rockers stand */}
                    <path d="M 62 73 Q 80 82 98 73" fill="none" stroke="#d50000" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="70" y1="64" x2="68" y2="76" stroke="#5d4037" strokeWidth="1.5" />
                    <line x1="90" y1="64" x2="92" y2="76" stroke="#5d4037" strokeWidth="1.5" />
                    {/* Wooden horse body */}
                    <rect x="68" y="52" width="24" height="12" rx="3" fill="#fafafa" stroke="#ff9100" strokeWidth="1.5" />
                    {/* Neck & Head */}
                    <rect x="82" y="38" width="8" height="16" rx="2" fill="#fafafa" stroke="#ff9100" strokeWidth="1.5" transform="rotate(-15, 86, 46)" />
                    <path d="M 88 40 Q 94 48 88 56" fill="none" stroke="#ff6f00" strokeWidth="2.2" />
                    <path d="M 68 56 Q 60 52 58 60" fill="none" stroke="#ff6f00" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="74" y="52" width="10" height="8" rx="1" fill="#29b6f6" />
                </g>
            );
        case 'desk_clay_vase':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Grey textured vase */}
                    <path d="M 74 52 L 86 52 Q 94 66 84 78 L 76 78 Q 66 66 74 52 Z" fill="#90a4ae" stroke="#37474f" strokeWidth="1.5" />
                    <circle cx="80" cy="65" r="4" fill="#78909c" />
                    {/* Dried wheat & flowers */}
                    <line x1="76" y1="52" x2="68" y2="24" stroke="#ffb74d" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="84" y1="52" x2="92" y2="22" stroke="#ffb74d" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="74" cy="34" r="4.5" fill="#ffe082" stroke="#ffb300" strokeWidth="0.5" />
                    <circle cx="86" cy="32" r="4.5" fill="#ffe082" stroke="#ffb300" strokeWidth="0.5" />
                    <circle cx="80" cy="26" r="3.5" fill="#fafafa" stroke="#ffb300" strokeWidth="0.5" />
                </g>
            );
        case 'desk_fox_crystal_bowl':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="36" ry="10" fill="#37474f" fillOpacity="0.2" />
                    {/* Quartz Crystal Cluster Dish */}
                    <ellipse cx="80" cy="74" rx="32" ry="8" fill="#e1bee7" stroke="#8e24aa" strokeWidth="1.8" />
                    <polygon points="56,72 51,52 61,70" fill="#ce93d8" stroke="#8e24aa" strokeWidth="1" />
                    <polygon points="104,72 109,52 99,70" fill="#ce93d8" stroke="#8e24aa" strokeWidth="1" />
                    <polygon points="80,74 80,48 85,72" fill="#ba68c8" stroke="#8e24aa" strokeWidth="1" opacity="0.8" />
                    {/* Tiny sleeping white nine-tail fox */}
                    <g transform="translate(68, 62)">
                        <rect x="4" y="6" width="16" height="10" rx="5" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                        <circle cx="16" cy="8" r="4.5" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                        <line x1="15" y1="9" x2="17" y2="9" stroke="#333" strokeWidth="0.8" />
                        <path d="M 4 12 Q -2 4 4 8" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                        <path d="M 4 12 Q -4 12 2 10" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                    </g>
                </g>
            );
        case 'desk_cloud_dessert':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="9" fill="#37474f" fillOpacity="0.2" />
                    {/* Glass stand center pillar */}
                    <line x1="80" y1="80" x2="80" y2="30" stroke="#80deea" strokeWidth="2.2" />
                    {/* Tier 1 */}
                    <ellipse cx="80" cy="74" rx="28" ry="7" fill="#fafafa" fillOpacity="0.8" stroke="#80deea" strokeWidth="1.2" />
                    <circle cx="62" cy="70" r="3.5" fill="#e8eaed" />
                    <circle cx="98" cy="70" r="3.5" fill="#a7ffeb" />
                    {/* Tier 2 */}
                    <ellipse cx="80" cy="54" rx="20" ry="5" fill="#fafafa" fillOpacity="0.8" stroke="#80deea" strokeWidth="1" />
                    <circle cx="70" cy="50" r="3" fill="#ff8a80" />
                    <circle cx="90" cy="50" r="3" fill="#ffd54f" />
                    {/* Tier 3 */}
                    <ellipse cx="80" cy="34" rx="12" ry="3.5" fill="#fafafa" fillOpacity="0.8" stroke="#80deea" strokeWidth="0.8" />
                    <circle cx="80" cy="30" r="2.2" fill="#ff1744" />
                </g>
            );
        case 'desk_cowboy_flask':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Chubby Cowboy Flask Body */}
                    <rect x="68" y="44" width="24" height="34" rx="8" fill="#fafafa" stroke="#3e2723" strokeWidth="1.8" />
                    {/* Cow Print Patches */}
                    <path d="M 69 48 Q 74 52 70 56 Z" fill="#3e2723" />
                    <path d="M 88 56 Q 84 60 89 64 Z" fill="#3e2723" />
                    <path d="M 72 68 Q 78 72 74 76 Z" fill="#3e2723" />
                    {/* Blue flask handle */}
                    <path d="M 68 50 Q 60 56 68 64" fill="none" stroke="#29b6f6" strokeWidth="2.2" />
                    {/* Cowboy Hat Cap */}
                    <ellipse cx="80" cy="42" rx="16" ry="4" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    <rect x="74" y="34" width="12" height="8" rx="2" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    <line x1="74" y1="39" x2="86" y2="39" stroke="#e53935" strokeWidth="1.2" />
                </g>
            );
        case 'desk_dream_crystal':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Tripod Stand */}
                    <line x1="80" y1="62" x2="68" y2="78" stroke="#b0bec5" strokeWidth="2" />
                    <line x1="80" y1="62" x2="92" y2="78" stroke="#b0bec5" strokeWidth="2" />
                    <line x1="80" y1="62" x2="80" y2="80" stroke="#cfd8dc" strokeWidth="2" />
                    <ellipse cx="80" cy="62" rx="14" ry="4.5" fill="none" stroke="#b0bec5" strokeWidth="1.8" />
                    {/* Swirling Holographic Galaxy Crystal Ball */}
                    <circle cx="80" cy="45" r="16" fill="#e1f5fe" fillOpacity="0.5" stroke="#b0bec5" strokeWidth="1.2" />
                    <path d="M 68 45 Q 80 32 92 45 Q 80 58 68 45" fill="#e1bee7" fillOpacity="0.6" />
                    <path d="M 72 41 Q 80 48 88 41" fill="none" stroke="#80deea" strokeWidth="1.2" opacity="0.8" />
                    <circle cx="76" cy="39" r="1" fill="#fff" />
                    <circle cx="84" cy="49" r="0.8" fill="#fff" />
                </g>
            );
        case 'desk_bamboo_bonsai':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Ceramic pot */}
                    <rect x="70" y="65" width="20" height="15" rx="3" fill="#a5d6a7" stroke="#388e3c" strokeWidth="1.5" />
                    {/* Left bamboo shoot */}
                    <rect x="74" y="45" width="4" height="20" rx="1" fill="#4caf50" />
                    <rect x="74" y="25" width="4" height="19" rx="1" fill="#81c784" />
                    <line x1="74" y1="45" x2="78" y2="45" stroke="#1b5e20" strokeWidth="1" />
                    <path d="M 74 35 Q 68 30 72 26 Z" fill="#2e7d32" />
                    {/* Right bamboo shoot */}
                    <rect x="82" y="38" width="4" height="27" rx="1" fill="#388e3c" />
                    <rect x="82" y="15" width="4" height="22" rx="1" fill="#66bb6a" />
                    <line x1="82" y1="38" x2="86" y2="38" stroke="#1b5e20" strokeWidth="1" />
                    <path d="M 86 28 Q 92 24 88 20 Z" fill="#2e7d32" />
                    <path d="M 82 22 Q 76 18 80 14 Z" fill="#2e7d32" />
                </g>
            );
        case 'desk_apple_sweet_cup':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Cup */}
                    <path d="M 72 45 L 88 45 L 85 78 L 75 78 Z" fill="#e8f5e9" stroke="#81c784" strokeWidth="1.5" />
                    {/* Apple logo design */}
                    <circle cx="79" cy="62" r="3" fill="#e53935" />
                    <path d="M 79 59 Q 81 57 80 58 Z" fill="#4caf50" />
                    {/* Lid */}
                    <ellipse cx="80" cy="45" rx="9" ry="3" fill="#81c784" />
                    {/* Straw */}
                    <line x1="80" y1="45" x2="85" y2="28" stroke="#ffe082" strokeWidth="2.5" />
                </g>
            );
        case 'desk_illusion_moon_pearl':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Wooden stand */}
                    <path d="M 72 78 L 88 78 L 84 66 L 76 66 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
                    <ellipse cx="80" cy="66" rx="6" ry="2" fill="#5d4037" />
                    {/* Pearl Glow & Sparkles */}
                    <circle cx="80" cy="50" r="16" fill="#b2ebf2" opacity="0.3" />
                    <circle cx="80" cy="50" r="13" fill="#e0f7fa" stroke="#00e5ff" strokeWidth="1.2" />
                    <circle cx="80" cy="50" r="10" fill="#ffffff" opacity="0.7" />
                    <circle cx="76" cy="46" r="2.5" fill="#ffffff" />
                    {/* Magic Sparkle stars */}
                    <polygon points="63,40 65,42 63,44 61,42" fill="#ffd700" />
                    <polygon points="97,42 99,44 97,46 95,44" fill="#ffd700" />
                </g>
            );
        case 'desk_beach_shell_jar':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Sand inside */}
                    <path d="M 69 70 Q 80 72 91 70 L 91 78 L 69 78 Z" fill="#ffe082" />
                    {/* Glass jar */}
                    <rect x="68" y="46" width="24" height="32" rx="6" fill="#e0f7fa" fillOpacity="0.35" stroke="#80deea" strokeWidth="1.5" />
                    {/* Starfish */}
                    <polygon points="76,68 78,63 80,68 83,66 80,71 82,75 78,73 74,75 76,71 73,66" fill="#ff7043" />
                    {/* Shell */}
                    <circle cx="83" cy="73" r="2.5" fill="#f8bbd0" stroke="#f48fb1" strokeWidth="0.5" />
                    {/* Cork */}
                    <rect x="74" y="40" width="12" height="6" fill="#a1887f" stroke="#5d4037" />
                </g>
            );
        case 'desk_matisse_goldfish':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Glass bowl */}
                    <rect x="66" y="38" width="24" height="40" rx="4" fill="#e0f7fa" fillOpacity="0.4" stroke="#80deea" strokeWidth="1.8" />
                    {/* Water surface line */}
                    <ellipse cx="78" cy="45" rx="12" ry="3" fill="#b2ebf2" fillOpacity="0.6" />
                    {/* Red swimming goldfish */}
                    <path d="M 72 58 Q 78 54 84 58 L 84 56 Q 78 52 72 58 Z" fill="#ff3d00" />
                    <polygon points="84,57 88,54 88,60" fill="#ff3d00" />
                    {/* Plant pot next to it */}
                    <rect x="91" y="60" width="10" height="18" rx="2" fill="#ffe082" stroke="#ffb300" />
                    <path d="M 91 60 Q 94 48 93 52" fill="#4caf50" />
                    <path d="M 97 60 Q 102 46 99 50" fill="#4caf50" />
                </g>
            );
        case 'desk_mermaid_shell':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Shell bottom */}
                    <path d="M 62 76 Q 80 82 98 76 Q 96 66 80 66 Q 64 66 62 76 Z" fill="#ffecb3" stroke="#ffa000" strokeWidth="1.5" />
                    {/* Shell top open */}
                    <path d="M 64 66 Q 80 44 96 66" fill="none" stroke="#ffa000" strokeWidth="1.5" />
                    {/* Pearl inside */}
                    <circle cx="80" cy="72" r="6" fill="#fff" stroke="#ffb300" strokeWidth="1" />
                    {/* Mermaid seated */}
                    <circle cx="80" cy="62" r="4" fill="#ffe0b2" />
                    <path d="M 80 64 Q 85 70 88 66" stroke="#00d8d6" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            );
        case 'desk_pumpkin_cake':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Paper cupcake base */}
                    <path d="M 70 64 L 90 64 L 86 78 L 74 78 Z" fill="#ffe082" stroke="#ffa000" strokeWidth="1" />
                    {/* Taro purple frosting */}
                    <path d="M 68 64 Q 80 50 92 64" fill="#b39ddb" />
                    <circle cx="73" cy="58" r="5" fill="#9575cd" />
                    <circle cx="87" cy="58" r="5" fill="#9575cd" />
                    <circle cx="80" cy="54" r="6" fill="#b39ddb" />
                    {/* Pumpkin topper */}
                    <circle cx="80" cy="46" r="3.5" fill="#ff7043" />
                    <line x1="80" y1="42.5" x2="80" y2="40" stroke="#4caf50" strokeWidth="1" />
                    {/* Cute ghost on side */}
                    <path d="M 91 76 L 91 68 Q 94 62 97 68 L 97 76 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                    <circle cx="93" cy="68" r="0.5" fill="#000" />
                    <circle cx="95" cy="68" r="0.5" fill="#000" />
                </g>
            );
        case 'desk_wilderness_lute':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Guqin miniature dark wooden stand */}
                    <rect x="66" y="70" width="28" height="8" rx="2" fill="#5d4037" stroke="#3e2723" />
                    {/* Guqin body */}
                    <rect x="60" y="65" width="40" height="5" rx="1.5" fill="#3e2723" />
                    {/* Guqin strings */}
                    <line x1="62" y1="67" x2="98" y2="67" stroke="#eeeeee" strokeWidth="0.5" strokeDasharray="3 1" />
                </g>
            );
        case 'desk_surplus_foodbox':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="8" fill="#37474f" fillOpacity="0.2" />
                    {/* Red berries on left */}
                    <path d="M 66 52 Q 60 44 56 48" stroke="#3e2723" strokeWidth="1.2" />
                    <circle cx="56" cy="46" r="2.2" fill="#e53935" />
                    <circle cx="59" cy="45" r="1.8" fill="#e53935" />
                    {/* Double-layered wooden basket foodbox */}
                    <rect x="68" y="52" width="24" height="26" rx="3" fill="#a1887f" stroke="#5d4037" strokeWidth="1.5" />
                    <line x1="68" y1="65" x2="92" y2="65" stroke="#5d4037" strokeWidth="1" />
                    {/* Golden carry arch */}
                    <path d="M 68 56 Q 80 34 92 56" fill="none" stroke="#ffd700" strokeWidth="2" />
                </g>
            );
        case 'desk_snow_globe':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.2" />
                    {/* Base */}
                    <rect x="70" y="70" width="20" height="10" rx="3" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
                    {/* Glass dome sphere */}
                    <circle cx="80" cy="54" r="17" fill="#e0f2f1" fillOpacity="0.3" stroke="#80deea" strokeWidth="1.8" />
                    {/* Snowman inside */}
                    <circle cx="76" cy="62" r="3" fill="#fff" />
                    <circle cx="76" cy="58" r="2" fill="#fff" />
                    {/* Green tree inside */}
                    <polygon points="84,52 81,64 87,64" fill="#2e7d32" />
                </g>
            );
        case 'desk_permanent_snowman':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Snowman */}
                    <circle cx="80" cy="74" r="7.5" fill="#ffffff" stroke="#ccc" strokeWidth="1.2" />
                    <circle cx="80" cy="62" r="5" fill="#ffffff" stroke="#ccc" strokeWidth="1.2" />
                    {/* Scarf */}
                    <rect x="76" y="66" width="8" height="2.5" rx="1" fill="#e53935" />
                    <path d="M 81 68 L 83 72" stroke="#e53935" strokeWidth="1.5" />
                    {/* Hat */}
                    <polygon points="80,50 76,58 84,58" fill="#e53935" />
                    {/* Details */}
                    <circle cx="78" cy="60" r="0.5" fill="#000" />
                    <circle cx="82" cy="60" r="0.5" fill="#000" />
                    <polygon points="80,61 83,61 80,63" fill="#ff7043" />
                </g>
            );
        case 'desk_thermometer':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Stand base */}
                    <rect x="70" y="76" width="20" height="4" fill="#cfd8dc" />
                    {/* Body */}
                    <rect x="72" y="44" width="16" height="32" rx="4" fill="#e0f7fa" stroke="#80deea" strokeWidth="1.5" />
                    {/* Screen showing 0°C */}
                    <rect x="74" y="48" width="12" height="24" rx="2" fill="#ffffff" stroke="#b2ebf2" />
                    <circle cx="80" cy="55" r="2" fill="#29b6f6" />
                    <line x1="80" y1="58" x2="80" y2="68" stroke="#29b6f6" strokeWidth="1" />
                    <text x="80" y="54" fontSize="4.5" fill="#00c853" textAnchor="middle" fontWeight="bold">0°</text>
                </g>
            );
        case 'desk_inkstone':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Stone base */}
                    <ellipse cx="80" cy="78" rx="24" ry="7" fill="#424242" stroke="#212121" strokeWidth="1.5" />
                    {/* Wet Ink pool */}
                    <ellipse cx="80" cy="77" rx="16" ry="4" fill="#111111" />
                    <circle cx="75" cy="76" r="1.2" fill="#ffffff" opacity="0.6" />
                </g>
            );
        case 'desk_brush_rack':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Rack Stand */}
                    <path d="M 62 78 L 98 78 L 94 76 L 80 44 L 66 76 Z" fill="none" stroke="#5d4037" strokeWidth="2" />
                    {/* Left brush hanging */}
                    <line x1="72" y1="48" x2="72" y2="70" stroke="#3e2723" strokeWidth="1.5" />
                    <polygon points="70,70 72,76 74,70" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
                    {/* Right brush hanging */}
                    <line x1="88" y1="48" x2="88" y2="72" stroke="#3e2723" strokeWidth="1.5" />
                    <polygon points="86,72 88,78 90,72" fill="#333333" />
                </g>
            );
        case 'desk_toy_bicycle':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Bicycle wheels */}
                    <circle cx="68" cy="74" r="7" fill="none" stroke="#e91e63" strokeWidth="1.5" />
                    <circle cx="92" cy="74" r="7" fill="none" stroke="#e91e63" strokeWidth="1.5" />
                    {/* Frame */}
                    <line x1="68" y1="74" x2="80" y2="74" stroke="#ff4081" strokeWidth="1.5" />
                    <line x1="92" y1="74" x2="80" y2="60" stroke="#ff4081" strokeWidth="1.5" />
                    {/* Riding girl figure */}
                    <circle cx="80" cy="50" r="5.5" fill="#ffe0b2" />
                    <path d="M 80 44.5 Q 74 44 80 39" fill="none" stroke="#9c27b0" strokeWidth="2" />
                    <rect x="76" y="55" width="8" height="12" rx="2" fill="#e040fb" />
                </g>
            );
        case 'desk_chinese_pastry':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="8" fill="#37474f" fillOpacity="0.15" />
                    {/* Bamboo tray plate */}
                    <ellipse cx="80" cy="78" rx="28" ry="8" fill="#ffe082" stroke="#ffb300" strokeWidth="1.5" />
                    {/* Pastel lotus pink pastry */}
                    <path d="M 68 76 Q 72 70 76 76" fill="#f48fb1" stroke="#f48fb1" strokeWidth="2" strokeLinecap="round" />
                    {/* Yellow round pastry */}
                    <circle cx="80" cy="74" r="4.5" fill="#fff59d" />
                    {/* Pandan green square pastry */}
                    <rect x="85" y="72" width="7" height="4" rx="1.5" fill="#a5d6a7" />
                </g>
            );
        case 'desk_sporty_plush':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Dumbbell weight left */}
                    <circle cx="66" cy="62" r="10" fill="#64b5f6" stroke="#1976d2" strokeWidth="1.8" />
                    {/* Dumbbell weight right */}
                    <circle cx="94" cy="62" r="10" fill="#64b5f6" stroke="#1976d2" strokeWidth="1.8" />
                    {/* Dumbbell bar */}
                    <rect x="70" y="58" width="20" height="8" fill="#90caf9" stroke="#1976d2" strokeWidth="1.5" />
                    {/* "7KG" Display text */}
                    <rect x="74" y="60" width="12" height="4" fill="#ffffff" />
                    <text x="80" y="64" fontSize="4.5" fill="#1976d2" textAnchor="middle" fontWeight="bold">7KG</text>
                </g>
            );
        case 'desk_zongzi_steamer':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="8" fill="#37474f" fillOpacity="0.15" />
                    {/* Bamboo steamer walls */}
                    <ellipse cx="80" cy="78" rx="24" ry="7" fill="#ffe082" stroke="#ffa000" strokeWidth="1.5" />
                    <rect x="56" y="64" width="48" height="12" fill="none" stroke="#ffa000" strokeWidth="1.8" />
                    {/* Wrapped Zongzi rice dumplings inside */}
                    <polygon points="70,70 76,58 82,70" fill="#4caf50" stroke="#2e7d32" strokeWidth="0.8" />
                    <polygon points="80,72 86,60 92,72" fill="#4caf50" stroke="#2e7d32" strokeWidth="0.8" />
                </g>
            );
        case 'desk_dopamine_fragrance':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Glass fragrance bottle */}
                    <path d="M 72 58 L 88 58 L 86 78 L 74 78 Z" fill="#bbdefb" stroke="#1e88e5" strokeWidth="1.5" />
                    {/* Dopamine bright pink liquid inside */}
                    <path d="M 74 66 L 86 66 L 85 77 L 75 77 Z" fill="#ff4081" fillOpacity="0.8" />
                    {/* Wooden diffuser reeds */}
                    <line x1="80" y1="58" x2="68" y2="34" stroke="#8d6e63" strokeWidth="1.5" />
                    <line x1="80" y1="58" x2="88" y2="30" stroke="#8d6e63" strokeWidth="1.5" />
                    <line x1="80" y1="58" x2="78" y2="28" stroke="#8d6e63" strokeWidth="1.5" />
                </g>
            );
        case 'desk_canele_dessert':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Porcelain dish plate */}
                    <ellipse cx="80" cy="79" rx="26" ry="6.5" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1.5" />
                    {/* Glazed Canelé dessert body */}
                    <path d="M 73 54 L 87 54 L 89 74 L 71 74 Z" fill="#4e342e" stroke="#3e2723" strokeWidth="1.5" />
                    <line x1="77" y1="54" x2="75" y2="74" stroke="#3e2723" strokeWidth="1.2" />
                    <line x1="83" y1="54" x2="85" y2="74" stroke="#3e2723" strokeWidth="1.2" />
                    {/* Blueberry whipped cream on top */}
                    <ellipse cx="80" cy="54" rx="6" ry="2.2" fill="#ffffff" />
                    <circle cx="80" cy="51" r="2.5" fill="#5c6bc0" />
                </g>
            );
        case 'desk_spring_letter':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Tulips blooming */}
                    <circle cx="72" cy="50" r="5" fill="#ff4081" />
                    <circle cx="88" cy="50" r="5" fill="#ff4081" />
                    <circle cx="80" cy="44" r="6" fill="#f50057" />
                    <path d="M 76 52 Q 80 42 84 52" fill="none" stroke="#4caf50" strokeWidth="1.8" />
                    {/* Blue envelope letter */}
                    <path d="M 62 62 L 98 62 L 80 78 Z" fill="#bbdefb" stroke="#1e88e5" strokeWidth="1.2" />
                    <rect x="62" y="62" width="36" height="16" fill="#90caf9" stroke="#1e88e5" strokeWidth="1.2" />
                </g>
            );
        case 'desk_fairy_doll':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Translucent Wings */}
                    <ellipse cx="70" cy="52" rx="7" ry="12" fill="#e0f7fa" fillOpacity="0.6" transform="rotate(-30, 70, 52)" />
                    <ellipse cx="90" cy="52" rx="7" ry="12" fill="#e0f7fa" fillOpacity="0.6" transform="rotate(30, 90, 52)" />
                    {/* Doll Dress */}
                    <polygon points="80,54 74,68 86,68" fill="#b39ddb" stroke="#673ab7" strokeWidth="1" />
                    {/* Face & Hair */}
                    <circle cx="80" cy="48" r="6" fill="#ffe0b2" />
                    <path d="M 72 48 Q 80 34 88 48" fill="#ffd54f" />
                </g>
            );
        case 'desk_sweet_dumplings':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Ceramic Orange Bowl */}
                    <path d="M 64 62 Q 80 52 96 62 Q 98 76 80 80 Q 62 76 64 62 Z" fill="#ff7043" stroke="#d84315" strokeWidth="1.5" />
                    {/* Dumplings inside */}
                    <circle cx="72" cy="62" r="5.5" fill="#ffffff" />
                    <circle cx="84" cy="62" r="5.5" fill="#ffffff" />
                    <circle cx="78" cy="57" r="6.2" fill="#ffffff" />
                    {/* Wooden spoon */}
                    <line x1="86" y1="56" x2="94" y2="44" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
                </g>
            );
        case 'desk_dragon_lion':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Red Body Base */}
                    <rect x="66" y="50" width="28" height="28" rx="2" fill="#e53935" stroke="#ffb300" strokeWidth="1.5" />
                    {/* Large Yellow Eyes */}
                    <circle cx="73" cy="56" r="5.5" fill="#ffd54f" />
                    <circle cx="73" cy="56" r="2.2" fill="#212121" />
                    <circle cx="87" cy="56" r="5.5" fill="#ffd54f" />
                    <circle cx="87" cy="56" r="2.2" fill="#212121" />
                    {/* Red Festive Banner */}
                    <rect x="76" y="60" width="8" height="18" fill="#d32f2f" />
                    <line x1="80" y1="62" x2="80" y2="76" stroke="#ffd700" strokeWidth="1" strokeDasharray="2 2" />
                </g>
            );
        case 'desk_tomato_basket':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Red Tomatoes Overflowing */}
                    <circle cx="70" cy="56" r="6.5" fill="#ff1744" />
                    <circle cx="80" cy="54" r="7" fill="#ff1744" />
                    <circle cx="90" cy="56" r="6.5" fill="#ff1744" />
                    <circle cx="76" cy="48" r="6" fill="#d50000" />
                    <circle cx="84" cy="48" r="6" fill="#d50000" />
                    {/* Basket */}
                    <path d="M 62 62 Q 80 52 98 62 Q 94 80 80 80 Q 66 80 62 62 Z" fill="#b0bec5" stroke="#37474f" strokeWidth="1" />
                    <line x1="62" y1="68" x2="98" y2="68" stroke="#90a4ae" strokeWidth="0.8" />
                    <line x1="65" y1="74" x2="95" y2="74" stroke="#90a4ae" strokeWidth="0.8" />
                </g>
            );
        case 'desk_plum_dumplings':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Clay teapot */}
                    <circle cx="68" cy="68" r="8" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
                    <path d="M 60 68 Q 56 64 58 68" fill="none" stroke="#5d4037" strokeWidth="1.5" />
                    {/* Blue plate & Qingtuan dumplings */}
                    <ellipse cx="84" cy="78" rx="15" ry="4" fill="#90caf9" stroke="#1565c0" strokeWidth="1" />
                    <circle cx="80" cy="74" r="4.5" fill="#4caf50" />
                    <circle cx="88" cy="74" r="4.5" fill="#4caf50" />
                </g>
            );
        case 'desk_opera_panda':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Opera Flags behind */}
                    <polygon points="68,64 60,52 68,56" fill="#f50057" />
                    <polygon points="92,64 100,52 92,56" fill="#f50057" />
                    {/* Panda Body & Face */}
                    <circle cx="80" cy="72" r="9" fill="#ffffff" stroke="#333333" strokeWidth="1.2" />
                    <circle cx="80" cy="56" r="7" fill="#ffffff" stroke="#333333" strokeWidth="1.2" />
                    <circle cx="74" cy="50" r="2.2" fill="#212121" />
                    <circle cx="86" cy="50" r="2.2" fill="#212121" />
                    <circle cx="77" cy="56" r="1.5" fill="#212121" />
                    <circle cx="83" cy="56" r="1.5" fill="#212121" />
                    {/* Opera Headdress */}
                    <path d="M 72 50 Q 80 40 88 50" fill="none" stroke="#ff4081" strokeWidth="2.5" strokeDasharray="3 3" />
                </g>
            );
        case 'desk_film_camera':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Camera Body */}
                    <rect x="66" y="58" width="28" height="20" fill="#2e7d32" stroke="#37474f" strokeWidth="1.5" />
                    <rect x="66" y="52" width="28" height="6" fill="#cfd8dc" stroke="#37474f" />
                    {/* Camera Lens */}
                    <circle cx="80" cy="68" r="8.5" fill="#212121" stroke="#cfd8dc" strokeWidth="2" />
                    <circle cx="80" cy="68" r="4.5" fill="#111111" />
                    {/* Flash bulb */}
                    <circle cx="88" cy="48" r="3" fill="#ffd54f" />
                </g>
            );
        case 'desk_fortune_box':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="8" fill="#37474f" fillOpacity="0.2" />
                    {/* Carry arch wooden handle */}
                    <path d="M 68 56 Q 80 30 92 56" fill="none" stroke="#e65100" strokeWidth="2.2" />
                    {/* Three-tiered Red lacquer gift foodbox */}
                    <rect x="68" y="50" width="24" height="28" rx="2" fill="#d32f2f" stroke="#ffb300" strokeWidth="1.5" />
                    <line x1="68" y1="60" x2="92" y2="60" stroke="#ffb300" strokeWidth="1" />
                    <line x1="68" y1="69" x2="92" y2="69" stroke="#ffb300" strokeWidth="1" />
                    {/* Green hanging tassels */}
                    <line x1="68" y1="62" x2="68" y2="76" stroke="#4caf50" strokeWidth="1.5" />
                </g>
            );
        case 'desk_reading_fox':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Smart Fox Body */}
                    <rect x="74" y="60" width="12" height="18" fill="#ffe0b2" />
                    <polygon points="80,38 72,46 88,46" fill="#ff7043" />
                    <path d="M 72 38 L 74 44 M 88 38 L 86 44" stroke="#ff7043" strokeWidth="1.5" />
                    {/* Open white newspaper */}
                    <rect x="68" y="50" width="24" height="15" fill="#ffffff" stroke="#90a4ae" strokeWidth="0.8" />
                    <line x1="70" y1="54" x2="76" y2="54" stroke="#90a4ae" strokeWidth="0.6" />
                    <line x1="70" y1="58" x2="78" y2="58" stroke="#90a4ae" strokeWidth="0.6" />
                    <line x1="82" y1="54" x2="90" y2="54" stroke="#90a4ae" strokeWidth="0.6" />
                    <line x1="82" y1="58" x2="88" y2="58" stroke="#90a4ae" strokeWidth="0.6" />
                </g>
            );
        case 'desk_timer_rabbit':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Golden Pocket watch */}
                    <circle cx="88" cy="68" r="10" fill="#ffffff" stroke="#ffd700" strokeWidth="2.2" />
                    <line x1="88" y1="68" x2="88" y2="62" stroke="#212121" strokeWidth="1" />
                    {/* Rabbit in red suit */}
                    <path d="M 68 38 Q 66 22 70 38 M 74 38 Q 76 22 72 38" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                    <circle cx="71" cy="46" r="6" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
                    <rect x="66" y="52" width="10" height="14" rx="2" fill="#d32f2f" />
                </g>
            );
        case 'desk_capybara_burger':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Hamburger stack with cute Capybara */}
                    <path d="M 66 74 Q 80 82 94 74 Z" fill="#ffb74d" />
                    <rect x="64" y="70" width="32" height="4" fill="#ffd54f" />
                    <path d="M 64 68 Q 80 72 96 68 Z" fill="#4caf50" />
                    {/* Capybara Body & Face */}
                    <rect x="68" y="54" width="24" height="15" rx="5" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    <circle cx="80" cy="50" r="7.5" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    <circle cx="77" cy="48" r="0.6" fill="#000" />
                    <circle cx="83" cy="48" r="0.6" fill="#000" />
                    <path d="M 66 44 Q 80 34 94 44 Z" fill="#ffb74d" />
                </g>
            );
        case 'desk_badminton_toy':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Racket held in hand */}
                    <circle cx="60" cy="52" r="5" fill="none" stroke="#29b6f6" strokeWidth="1.2" />
                    <line x1="60" y1="57" x2="68" y2="66" stroke="#29b6f6" strokeWidth="1.2" />
                    {/* Shuttlecock body & feathers */}
                    <polygon points="72,74 70,44 80,42 90,44 88,74" fill="#ffffff" stroke="#b0bec5" strokeWidth="1" />
                    <path d="M 72 74 Q 80 80 88 74 Z" fill="#29b6f6" stroke="#0288d1" strokeWidth="1" />
                    {/* Face */}
                    <circle cx="77" cy="62" r="0.8" fill="#333" />
                    <circle cx="83" cy="62" r="0.8" fill="#333" />
                </g>
            );
        case 'desk_football_toy':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Flame Torch */}
                    <polygon points="94,62 98,62 96,72" fill="#ffe082" />
                    <path d="M 96 62 Q 100 48 96 52 Q 92 48 96 62" fill="#ff7043" />
                    {/* Soccer Ball character */}
                    <circle cx="80" cy="62" r="13" fill="#ffffff" stroke="#37474f" strokeWidth="1.5" />
                    <polygon points="80,56 84,59 83,64 77,64 76,59" fill="#212121" />
                    <polygon points="80,68 84,65 83,60 77,60 76,65" fill="#212121" />
                    {/* Red cap */}
                    <path d="M 70 54 Q 80 44 90 54" fill="#e53935" />
                </g>
            );
        case 'desk_banana_cat':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Yellow banana suit */}
                    <path d="M 60 76 Q 80 86 100 76 Q 90 52 80 50 Q 70 52 60 76 Z" fill="#ffd54f" stroke="#ffb300" strokeWidth="1.5" />
                    <path d="M 70 56 Q 64 64 68 74" fill="none" stroke="#ffb300" strokeWidth="1.5" />
                    <path d="M 90 56 Q 96 64 92 74" fill="none" stroke="#ffb300" strokeWidth="1.5" />
                    {/* Cat Face peaking out */}
                    <circle cx="80" cy="56" r="6" fill="#fafafa" stroke="#ccc" strokeWidth="1" />
                    <circle cx="78" cy="55" r="0.8" fill="#333" />
                    <circle cx="82" cy="55" r="0.8" fill="#333" />
                </g>
            );
        case 'desk_starry_nightlight':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.2" />
                    {/* Brass base stand */}
                    <rect x="72" y="74" width="16" height="6" rx="2" fill="#ffb300" stroke="#ffa000" strokeWidth="1.2" />
                    {/* Light sphere globe */}
                    <circle cx="80" cy="56" r="16" fill="#e1f5fe" fillOpacity="0.4" stroke="#80deea" strokeWidth="1.5" />
                    {/* Golden star inside */}
                    <polygon points="80,48 82,53 87,53 83,56 85,61 80,58 75,61 77,56 73,53 78,53" fill="#ffd700" />
                    {/* Revolving Orbit Ring */}
                    <ellipse cx="80" cy="56" rx="22" ry="5" fill="none" stroke="#ffb300" strokeWidth="1.8" transform="rotate(-20, 80, 56)" />
                </g>
            );
        case 'desk_lucky_fan':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Yellow portable fan stand */}
                    <rect x="77" y="65" width="6" height="15" fill="#fdd835" stroke="#fbc02d" strokeWidth="1" />
                    <circle cx="80" cy="78" r="4.5" fill="#fbc02d" />
                    {/* Fan Head & Blades */}
                    <circle cx="80" cy="50" r="14" fill="#ffee58" stroke="#fbc02d" strokeWidth="1.8" />
                    <line x1="80" y1="36" x2="80" y2="64" stroke="#fbc02d" strokeWidth="0.8" />
                    <line x1="66" y1="50" x2="94" y2="50" stroke="#fbc02d" strokeWidth="0.8" />
                </g>
            );
        case 'desk_lucky_coffee':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Red coffee cup */}
                    <path d="M 72 45 L 88 45 L 84 78 L 76 78 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="1.5" />
                    {/* Lid */}
                    <ellipse cx="80" cy="45" rx="9" ry="3" fill="#fafafa" stroke="#b71c1c" strokeWidth="1" />
                    {/* Emblem warrior badge */}
                    <circle cx="80" cy="62" r="5" fill="#212121" />
                    <circle cx="80" cy="62" r="2.5" fill="#ffffff" />
                </g>
            );
        case 'desk_retro_brickphone':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.2" />
                    {/* Pink brick phone body */}
                    <rect x="70" y="42" width="20" height="38" rx="2" fill="#f48fb1" stroke="#d81b60" strokeWidth="1.5" />
                    <line x1="72" y1="42" x2="72" y2="24" stroke="#e91e63" strokeWidth="1.5" />
                    {/* Black screen */}
                    <rect x="74" y="46" width="12" height="10" fill="#212121" />
                    {/* Keypad dots */}
                    <circle cx="76" cy="62" r="1" fill="#fff" />
                    <circle cx="80" cy="62" r="1" fill="#fff" />
                    <circle cx="84" cy="62" r="1" fill="#fff" />
                    <circle cx="76" cy="68" r="1" fill="#fff" />
                    <circle cx="80" cy="68" r="1" fill="#fff" />
                    <circle cx="84" cy="68" r="1" fill="#fff" />
                </g>
            );
        case 'desk_autumn_milktea':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6.5" fill="#37474f" fillOpacity="0.15" />
                    {/* Wooden Coaster base */}
                    <ellipse cx="80" cy="78" rx="16" ry="4" fill="#a1887f" stroke="#5d4037" strokeWidth="1" />
                    {/* Clear green cup */}
                    <path d="M 72 48 L 88 48 L 84 76 L 76 76 Z" fill="#e8f5e9" fillOpacity="0.5" stroke="#4caf50" strokeWidth="1.2" />
                    {/* Tapioca bubbles */}
                    <circle cx="78" cy="72" r="1.5" fill="#212121" />
                    <circle cx="82" cy="73" r="1.5" fill="#212121" />
                    <circle cx="79" cy="75" r="1.5" fill="#212121" />
                    {/* Straw */}
                    <line x1="80" y1="52" x2="84" y2="34" stroke="#ffb74d" strokeWidth="2" />
                </g>
            );
        case 'desk_singing_xmas_tree':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Stand base */}
                    <rect x="74" y="74" width="12" height="6" fill="#8d6e63" />
                    {/* Gift box */}
                    <rect x="64" y="72" width="10" height="10" fill="#e53935" stroke="#b71c1c" strokeWidth="1" />
                    <line x1="69" y1="72" x2="69" y2="82" stroke="#ffd700" strokeWidth="1" />
                    <line x1="64" y1="77" x2="74" y2="77" stroke="#ffd700" strokeWidth="1" />
                    {/* Tree layers */}
                    <polygon points="54,72 80,54 106,72" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.2" />
                    <polygon points="58,58 80,42 102,58" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.2" />
                    <polygon points="64,44 80,30 96,44" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.2" />
                    {/* Golden Star */}
                    <polygon points="80,24 82,27 86,27 83,29 84,32 80,30 76,32 77,29 74,27 78,27" fill="#ffd700" />
                </g>
            );
        case 'desk_retro_mug':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="26" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Mug body */}
                    <rect x="68" y="48" width="24" height="32" rx="4" fill="#ffffff" stroke="#1565c0" strokeWidth="1.8" />
                    {/* Handle */}
                    <path d="M 92 54 Q 98 64 92 74" fill="none" stroke="#1565c0" strokeWidth="2.5" />
                    {/* Print graphic box */}
                    <rect x="72" y="58" width="16" height="14" fill="#ffffff" stroke="#e53935" strokeWidth="0.8" />
                    <line x1="74" y1="62" x2="86" y2="62" stroke="#e53935" strokeWidth="1" />
                    <line x1="74" y1="68" x2="82" y2="68" stroke="#1565c0" strokeWidth="1" />
                    {/* Steam */}
                    <path d="M 76 42 Q 78 36 76 32" fill="none" stroke="#cfd8dc" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M 84 42 Q 86 36 84 32" fill="none" stroke="#cfd8dc" strokeWidth="1.2" strokeLinecap="round" />
                </g>
            );
        case 'desk_delicious_toast':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Blue Pillow */}
                    <rect x="62" y="66" width="36" height="14" rx="4" fill="#90caf9" stroke="#1e88e5" strokeWidth="1.2" />
                    {/* Toast */}
                    <path d="M 68 54 C 68 46, 74 44, 80 46 C 86 44, 92 46, 92 54 L 92 72 C 92 76, 68 76, 68 72 Z" fill="#fff9c4" stroke="#ffb74d" strokeWidth="1.5" />
                    <path d="M 68 54 C 68 46, 74 44, 80 46 C 86 44, 92 46, 92 54 L 92 72 C 92 76, 68 76, 68 72 Z" fill="none" stroke="#8d6e63" strokeWidth="1.2" />
                    {/* Sleeping cap */}
                    <path d="M 72 46 Q 66 38 60 48" fill="none" stroke="#29b6f6" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="58" cy="48" r="2" fill="#ffffff" />
                    {/* Closed eyes */}
                    <line x1="74" y1="58" x2="77" y2="58" stroke="#333" strokeWidth="1" />
                    <line x1="83" y1="58" x2="86" y2="58" stroke="#333" strokeWidth="1" />
                    <circle cx="72" cy="62" r="1.5" fill="#ffab91" />
                    <circle cx="88" cy="62" r="1.5" fill="#ffab91" />
                </g>
            );
        case 'desk_bunny_cart':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Yellow bunny */}
                    <circle cx="80" cy="50" r="7.5" fill="#fff59d" />
                    <path d="M 76 43 Q 73 30 76 43 Z" fill="#fff59d" stroke="#fbc02d" strokeWidth="0.8" />
                    <path d="M 84 43 Q 87 30 84 43 Z" fill="#fff59d" stroke="#fbc02d" strokeWidth="0.8" />
                    <circle cx="77" cy="50" r="0.8" fill="#333" />
                    <circle cx="83" cy="50" r="0.8" fill="#333" />
                    {/* Shopping cart grid */}
                    <rect x="66" y="56" width="28" height="18" rx="2" fill="none" stroke="#0288d1" strokeWidth="1.5" />
                    <line x1="73" y1="56" x2="73" y2="74" stroke="#0288d1" strokeWidth="1" />
                    <line x1="80" y1="56" x2="80" y2="74" stroke="#0288d1" strokeWidth="1" />
                    <line x1="87" y1="56" x2="87" y2="74" stroke="#0288d1" strokeWidth="1" />
                    <line x1="66" y1="65" x2="94" y2="65" stroke="#0288d1" strokeWidth="1" />
                    {/* Wheels */}
                    <circle cx="70" cy="76" r="4.5" fill="#37474f" />
                    <circle cx="90" cy="76" r="4.5" fill="#37474f" />
                </g>
            );
        case 'desk_pumpkin_candy_box':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Lollipops inside */}
                    <circle cx="72" cy="52" r="5" fill="#f48fb1" />
                    <line x1="72" y1="52" x2="72" y2="60" stroke="#ccc" strokeWidth="1.2" />
                    <circle cx="84" cy="50" r="4" fill="#a5d6a7" />
                    <line x1="84" y1="50" x2="84" y2="60" stroke="#ccc" strokeWidth="1.2" />
                    {/* Pumpkin body */}
                    <path d="M 62 62 Q 80 50 98 62 Q 98 78 80 80 Q 62 78 62 62 Z" fill="#ff7043" stroke="#d84315" strokeWidth="1.5" />
                    {/* Spooky carvings */}
                    <polygon points="72,64 74,68 70,68" fill="#212121" />
                    <polygon points="88,64 90,68 86,68" fill="#212121" />
                    <path d="M 74 72 Q 80 76 86 72" fill="none" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
        case 'desk_magic_globe':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Golden stand with wing decoration */}
                    <path d="M 72 78 L 88 78 L 84 68 L 76 68 Z" fill="#ffd700" stroke="#ffb300" strokeWidth="1" />
                    <path d="M 68 68 C 62 62, 60 52, 72 58 Z" fill="#ffd700" stroke="#ffb300" strokeWidth="0.8" />
                    <path d="M 92 68 C 98 62, 100 52, 88 58 Z" fill="#ffd700" stroke="#ffb300" strokeWidth="0.8" />
                    {/* Magic Cyan Ball */}
                    <circle cx="80" cy="52" r="15" fill="#e0f7fa" fillOpacity="0.4" stroke="#00e5ff" strokeWidth="1.5" />
                    <circle cx="80" cy="52" r="11" fill="#00e5ff" opacity="0.6" />
                    <circle cx="76" cy="48" r="3" fill="#ffffff" opacity="0.8" />
                </g>
            );
        case 'desk_rabbit_astronaut':
            return (
                <g transform="translate(-10, 360)">
                    {/* Glowing teleportation pad */}
                    <ellipse cx="80" cy="78" rx="22" ry="5.5" fill="#e0f7fa" fillOpacity="0.6" stroke="#00e5ff" strokeWidth="1.5" />
                    <ellipse cx="80" cy="78" rx="16" ry="4" fill="none" stroke="#00e5ff" strokeWidth="0.8" strokeDasharray="3 3" />
                    {/* Astronaut suit */}
                    <rect x="74" y="58" width="12" height="16" rx="4" fill="#ffffff" stroke="#ccc" strokeWidth="1.2" />
                    {/* Visor & Helmet showing Pink Bunny Ears */}
                    <circle cx="80" cy="46" r="8" fill="#e0f7fa" fillOpacity="0.5" stroke="#ccc" strokeWidth="1.2" />
                    <path d="M 76 38 Q 74 24 78 38 Z" fill="#f8bbd0" />
                    <path d="M 84 38 Q 86 24 82 38 Z" fill="#f8bbd0" />
                    <circle cx="78" cy="46" r="0.6" fill="#333" />
                    <circle cx="82" cy="46" r="0.6" fill="#333" />
                </g>
            );
        case 'desk_bamboo_fan':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Fan Wooden stand */}
                    <rect x="72" y="74" width="16" height="6" rx="1.5" fill="#5d4037" stroke="#3e2723" strokeWidth="1" />
                    {/* Fan open */}
                    <path d="M 80 74 L 56 46 A 28 28 0 0 1 104 46 Z" fill="#fff8e1" stroke="#ffe082" strokeWidth="1.5" />
                    {/* Bamboo paintings */}
                    <path d="M 72 62 Q 66 52 64 56" fill="none" stroke="#212121" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M 76 60 Q 84 48 88 52" fill="none" stroke="#212121" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Hanging green jade tassel */}
                    <circle cx="80" cy="78" r="2.2" fill="#4caf50" />
                    <line x1="80" y1="78" x2="80" y2="83" stroke="#4caf50" strokeWidth="1.2" />
                </g>
            );
        case 'desk_study_motorcycle':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="30" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Motorcycle wheels */}
                    <circle cx="68" cy="74" r="7.5" fill="#212121" stroke="#cfd8dc" strokeWidth="2" />
                    <circle cx="92" cy="74" r="7.5" fill="#212121" stroke="#cfd8dc" strokeWidth="2" />
                    {/* Body fuel tank */}
                    <path d="M 68 74 L 74 62 L 90 62 L 92 74 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="1.5" />
                    {/* Windshield */}
                    <path d="M 72 62 Q 74 54 78 58" fill="none" stroke="#90caf9" strokeWidth="2.2" />
                    {/* Checkered racing flag at back */}
                    <line x1="92" y1="74" x2="98" y2="48" stroke="#333333" strokeWidth="1.2" />
                    <rect x="98" y="48" width="8" height="6" fill="#ffffff" stroke="#333" strokeWidth="0.8" />
                    <line x1="102" y1="48" x2="102" y2="54" stroke="#333" strokeWidth="0.8" />
                </g>
            );
        case 'desk_singing_panda':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Synthesizer keyboard */}
                    <rect x="62" y="68" width="36" height="8" fill="#ffffff" stroke="#333333" strokeWidth="1.2" />
                    <line x1="68" y1="68" x2="68" y2="76" stroke="#333" strokeWidth="1" />
                    <line x1="74" y1="68" x2="74" y2="76" stroke="#333" strokeWidth="1" />
                    <line x1="80" y1="68" x2="80" y2="76" stroke="#333" strokeWidth="1" />
                    <line x1="86" y1="68" x2="86" y2="76" stroke="#333" strokeWidth="1" />
                    <line x1="92" y1="68" x2="92" y2="76" stroke="#333" strokeWidth="1" />
                    {/* Panda playing */}
                    <circle cx="80" cy="52" r="10" fill="#ffffff" stroke="#ccc" strokeWidth="1" />
                    <circle cx="73" cy="44" r="2.5" fill="#212121" />
                    <circle cx="87" cy="44" r="2.5" fill="#212121" />
                    <circle cx="76" cy="51" r="1.5" fill="#212121" />
                    <circle cx="84" cy="51" r="1.5" fill="#212121" />
                    {/* Headphones arch */}
                    <path d="M 70 52 Q 80 38 90 52" fill="none" stroke="#ff7043" strokeWidth="2.2" />
                </g>
            );
        case 'desk_singing_lion':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Podium base */}
                    <ellipse cx="80" cy="78" rx="20" ry="5.5" fill="#29b6f6" stroke="#0288d1" strokeWidth="1.2" />
                    {/* Orange Lion body & mane */}
                    <circle cx="80" cy="54" r="13" fill="#ff7043" opacity="0.85" />
                    <circle cx="80" cy="54" r="9.5" fill="#ffb74d" />
                    {/* Face details */}
                    <circle cx="76" cy="53" r="0.8" fill="#333" />
                    <circle cx="84" cy="53" r="0.8" fill="#333" />
                    <path d="M 78 57 Q 80 59 82 57" fill="none" stroke="#333" strokeWidth="1" />
                    {/* Microphone stand */}
                    <line x1="68" y1="74" x2="72" y2="60" stroke="#37474f" strokeWidth="1.5" />
                    <circle cx="72" cy="60" r="2.2" fill="#cfd8dc" />
                </g>
            );
        case 'desk_trio_blobs':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="32" ry="7" fill="#37474f" fillOpacity="0.2" />
                    {/* Three blobs */}
                    <circle cx="68" cy="74" r="6" fill="#ff7043" />
                    <circle cx="80" cy="72" r="7" fill="#29b6f6" />
                    <circle cx="92" cy="74" r="6" fill="#ba68c8" />
                    {/* Banner */}
                    <rect x="62" y="50" width="36" height="12" fill="#ffffff" stroke="#37474f" strokeWidth="0.8" />
                    <text x="80" y="58" fontSize="6.5" fill="#e53935" textAnchor="middle" fontWeight="bold">卷倒隔壁桌</text>
                </g>
            );
        case 'desk_blue_reading_monster':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Blue Monster */}
                    <path d="M 72 78 Q 80 50 88 78 Z" fill="#81d4fa" stroke="#0288d1" strokeWidth="1.5" />
                    <polygon points="80,48 78,54 82,54" fill="#e0f7fa" />
                    <circle cx="76" cy="58" r="0.8" fill="#333" />
                    <circle cx="84" cy="58" r="0.8" fill="#333" />
                    {/* Yellow book */}
                    <path d="M 74 72 L 80 68 L 86 72 L 80 74 Z" fill="#ffe082" stroke="#ffa000" strokeWidth="1" />
                </g>
            );
        case 'desk_green_shaved_ice':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="24" ry="6" fill="#37474f" fillOpacity="0.15" />
                    {/* Glass cup */}
                    <path d="M 72 58 L 88 58 L 84 78 L 76 78 Z" fill="#e0f2f1" fillOpacity="0.4" stroke="#009688" strokeWidth="1.2" />
                    {/* Shaved ice green swirls */}
                    <circle cx="76" cy="50" r="7" fill="#a5d6a7" />
                    <circle cx="84" cy="50" r="7" fill="#a5d6a7" />
                    <circle cx="80" cy="44" r="7" fill="#c8e6c9" />
                    {/* Leaves on top */}
                    <path d="M 80 44 Q 84 28 82 32 Z" fill="#2e7d32" />
                </g>
            );
        case 'desk_peach_matcha_cake':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="28" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Pedestal stand */}
                    <path d="M 70 78 L 90 78 L 84 72 L 76 72 Z" fill="#f8bbd0" stroke="#f48fb1" strokeWidth="1" />
                    {/* Stacked green cakes with pink frosting */}
                    <rect x="68" y="60" width="24" height="12" fill="#c8e6c9" stroke="#81c784" strokeWidth="1" />
                    <rect x="68" y="58" width="24" height="2" fill="#f8bbd0" />
                    <circle cx="80" cy="54" r="2" fill="#ff1744" />
                </g>
            );
        case 'desk_bj_calligraphy_brushes':
            return (
                <g transform="translate(-10, 360)">
                    <ellipse cx="80" cy="82" rx="34" ry="7" fill="#37474f" fillOpacity="0.15" />
                    {/* Calligraphy brush stand */}
                    <path d="M 62 78 L 98 78 L 94 76 L 94 48 Q 80 44 66 48 L 66 76 Z" fill="none" stroke="#8d6e63" strokeWidth="2.5" />
                    {/* Brushes */}
                    <line x1="72" y1="48" x2="72" y2="70" stroke="#5d4037" strokeWidth="1.8" />
                    <polygon points="70,70 72,77 74,70" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="88" y1="48" x2="88" y2="70" stroke="#5d4037" strokeWidth="1.8" />
                    <polygon points="86,70 88,77 90,70" fill="#212121" />
                </g>
            );
        default:
            return null;
    }
}

function renderFace(face: string) {
    switch (face) {
        case 'face_smart_glasses':
            return (
                <g>
                    {/* 高智感眼镜 - Sleek modern round thin-wire glasses */}
                    <circle cx="120" cy="110" r="18" fill="none" stroke="#37474f" strokeWidth="2.2" />
                    <circle cx="180" cy="110" r="18" fill="none" stroke="#37474f" strokeWidth="2.2" />
                    <path d="M 138 110 Q 150 106 162 110" fill="none" stroke="#37474f" strokeWidth="2.2" />
                    <path d="M 102 110 Q 94 106 90 108 M 198 110 Q 206 106 210 108" fill="none" stroke="#37474f" strokeWidth="2" />
                </g>
            );
        case 'face_veil':
            return (
                <g>
                    {/* 流苏面纱 - Light purple fringed bead veil */}
                    <path d="M 90 120 Q 150 160 210 120 L 210 155 Q 150 180 90 155 Z" fill="#e1bee7" fillOpacity="0.6" stroke="#ba68c8" strokeWidth="1.5" />
                    {/* Golden fringed beads */}
                    <line x1="120" y1="140" x2="120" y2="165" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="120" cy="165" r="2.5" fill="#ffb300" />
                    <line x1="150" y1="145" x2="150" y2="175" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="150" cy="175" r="3" fill="#ffb300" />
                    <line x1="180" y1="140" x2="180" y2="165" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="180" cy="165" r="2.5" fill="#ffb300" />
                </g>
            );
        case 'face_cool_paint':
            return (
                <g>
                    {/* 清凉感彩绘 - summer popsicle paint, stars highlights, rosy blush */}
                    <circle cx="108" cy="125" r="9" fill="#ffab91" fillOpacity="0.35" />
                    <circle cx="192" cy="125" r="9" fill="#ffab91" fillOpacity="0.35" />
                    {/* Popsicle on right cheek */}
                    <g transform="translate(186, 120)">
                        <rect x="0" y="0" width="10" height="14" rx="3" fill="#80deea" />
                        <rect x="1" y="2" width="3.5" height="10" fill="#e0f7fa" opacity="0.6" />
                        <rect x="4" y="14" width="2" height="5" rx="1" fill="#ffe082" />
                    </g>
                    {/* Sparkles on left cheek */}
                    <g transform="translate(108, 122)">
                        <polygon points="0,-4 2,0 0,4 -2,0" fill="#f48fb1" />
                        <polygon points="6,-6 7.5,-4 6,-2 4.5,-4" fill="#80deea" />
                        <circle cx="-5" cy="2" r="1.5" fill="#fff" />
                    </g>
                </g>
            );
        case 'face_heart_sunglasses':
            return (
                <g>
                    {/* 爱心墨镜 - White heart-shaped frame sunglasses with dark lenses */}
                    <path d="M 120 120 C 104 114, 100 100, 112 96 C 120 94, 120 104, 120 104 C 120 104, 120 94, 128 96 C 140 100, 136 114, 120 120 Z" fill="#212121" stroke="#ffffff" strokeWidth="3" />
                    <path d="M 180 120 C 164 114, 160 100, 172 96 C 180 94, 180 104, 180 104 C 180 104, 180 94, 188 96 C 200 100, 196 114, 180 120 Z" fill="#212121" stroke="#ffffff" strokeWidth="3" />
                    <path d="M 135 108 Q 150 104 165 108" fill="none" stroke="#ffffff" strokeWidth="3" />
                    <path d="M 103 105 Q 94 102 90 104 M 197 105 Q 206 102 210 104" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                </g>
            );
        case 'face_cycling_shades':
            return (
                <g>
                    {/* 骑行墨镜 - Sporty silver wrap-around shield */}
                    <path d="M 94 102 Q 150 94 206 102 Q 212 118 196 122 Q 150 128 104 122 Q 88 118 94 102 Z" fill="#78909c" fillOpacity="0.85" stroke="#cfd8dc" strokeWidth="2" />
                    <path d="M 105 108 Q 150 102 195 108" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                    <path d="M 92 101 Q 150 90 208 101" fill="none" stroke="#37474f" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'face_sunglasses':
            return (
                <g>
                    {/* 摩登猫眼墨镜 - Dark black cat-eye sunglasses */}
                    <path d="M 98 108 C 98 96, 138 98, 142 108 C 138 122, 114 124, 102 118 Z" fill="#212121" stroke="#424242" strokeWidth="1.5" />
                    <path d="M 202 108 C 202 96, 162 98, 158 108 C 162 122, 186 124, 198 118 Z" fill="#212121" stroke="#424242" strokeWidth="1.5" />
                    <path d="M 142 106 Q 150 102 158 106" fill="none" stroke="#212121" strokeWidth="2.5" />
                    <ellipse cx="106" cy="126" rx="8" ry="5" fill="#ffab91" fillOpacity="0.4" />
                    <ellipse cx="194" cy="126" rx="8" ry="5" fill="#ffab91" fillOpacity="0.4" />
                </g>
            );
        case 'face_xmas':
            return (
                <g>
                    {/* 圣诞七彩妆 - Rosy cheeks, red nose tip blush, green and orange sparkle dots */}
                    <circle cx="110" cy="125" r="10" fill="#f48fb1" fillOpacity="0.6" />
                    <circle cx="190" cy="125" r="10" fill="#f48fb1" fillOpacity="0.6" />
                    <circle cx="150" cy="120" r="5" fill="#ef5350" fillOpacity="0.6" />
                    {/* Colorful green and orange dots */}
                    <circle cx="100" cy="122" r="2" fill="#4caf50" />
                    <circle cx="118" cy="130" r="1.5" fill="#4caf50" />
                    <circle cx="106" cy="132" r="2" fill="#ff9800" />
                    <circle cx="114" cy="118" r="1.2" fill="#ff9800" />
                    
                    <circle cx="200" cy="122" r="2" fill="#4caf50" />
                    <circle cx="182" cy="130" r="1.5" fill="#4caf50" />
                    <circle cx="194" cy="132" r="2" fill="#ff9800" />
                    <circle cx="186" cy="118" r="1.2" fill="#ff9800" />
                    
                    <circle cx="106" cy="122" r="1.5" fill="#ffffff" />
                    <circle cx="194" cy="122" r="1.5" fill="#ffffff" />
                </g>
            );
        case 'face_bear_glasses':
            return (
                <g>
                    {/* 小熊黑框眼镜 - Rectangular black frame glasses with small bear ornament */}
                    <rect x="100" y="94" width="36" height="28" rx="6" fill="none" stroke="#212121" strokeWidth="3" />
                    <rect x="164" y="94" width="36" height="28" rx="6" fill="none" stroke="#212121" strokeWidth="3" />
                    <path d="M 136 106 H 164" stroke="#212121" strokeWidth="3" />
                    <path d="M 100 104 H 90 M 200 104 H 210" stroke="#212121" strokeWidth="3" />
                    {/* Bear ornament on right frame corner */}
                    <g transform="translate(196, 88)">
                        <circle cx="4" cy="4" r="5.5" fill="#a1887f" stroke="#333" strokeWidth="1" />
                        <circle cx="0" cy="0" r="2" fill="#a1887f" stroke="#333" strokeWidth="1" />
                        <circle cx="8" cy="0" r="2" fill="#a1887f" stroke="#333" strokeWidth="1" />
                        <ellipse cx="4" cy="5.2" rx="2" ry="1.5" fill="#ffffff" />
                        <circle cx="4" cy="4.5" r="0.7" fill="#333" />
                    </g>
                </g>
            );
        case 'face_pearl_makeup':
            return (
                <g>
                    {/* 凝露珍珠妆 - Forehead bindi pearls, rosy cheek blush */}
                    <circle cx="150" cy="78" r="4.5" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1" />
                    <circle cx="150" cy="85" r="2.5" fill="#ffffff" stroke="#cfd8dc" strokeWidth="1" />
                    <circle cx="150" cy="91" r="1.5" fill="#ffffff" />
                    <circle cx="110" cy="126" r="9" fill="#f48fb1" fillOpacity="0.45" />
                    <circle cx="190" cy="126" r="9" fill="#f48fb1" fillOpacity="0.45" />
                </g>
            );
        case 'face_joker_makeup':
            return (
                <g>
                    {/* 可爱joker妆 - Joker makeup, red eye triangles, red nose tip, blue star cheeks */}
                    <polygon points="120,94 115,102 125,102" fill="#e53935" />
                    <polygon points="120,126 115,118 125,118" fill="#e53935" />
                    <polygon points="180,94 175,102 185,102" fill="#e53935" />
                    <polygon points="180,126 175,118 185,118" fill="#e53935" />
                    <circle cx="150" cy="120" r="5" fill="#e53935" />
                    <polygon points="106,122 108,125 111,125 109,127 110,130 106,128 102,130 103,127 101,125 104,125" fill="#29b6f6" />
                    <polygon points="194,122 196,125 199,125 197,127 198,130 194,128 190,130 191,127 189,125 192,125" fill="#29b6f6" />
                </g>
            );
        case 'face_scouter':
            return (
                <g>
                    {/* 数据读取眼镜 - Sci-fi holographic cybernetic visor */}
                    <path d="M 94 100 Q 150 90 206 100 L 206 118 Q 150 126 94 118 Z" fill="#00e5ff" fillOpacity="0.25" stroke="#00b0ff" strokeWidth="2.2" />
                    <path d="M 100 104 Q 150 96 200 104" fill="none" stroke="#00b0ff" strokeWidth="1.2" />
                    <line x1="110" y1="108" x2="118" y2="108" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="110" y1="112" x2="114" y2="112" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="180" y="106" width="12" height="8" fill="none" stroke="#ffffff" strokeWidth="1" />
                    <line x1="184" y1="110" x2="188" y2="110" stroke="#ffffff" strokeWidth="1" />
                </g>
            );
        case 'face_blue_cat_shades':
            return (
                <g>
                    {/* 冰蓝猫眼墨镜 - Light blue tinted cat-eye sunglasses, silver frames */}
                    <path d="M 98 108 C 98 96, 138 98, 142 108 C 138 122, 114 124, 102 118 Z" fill="#80deea" fillOpacity="0.65" stroke="#b0bec5" strokeWidth="1.5" />
                    <path d="M 202 108 C 202 96, 162 98, 158 108 C 162 122, 186 124, 198 118 Z" fill="#80deea" fillOpacity="0.65" stroke="#b0bec5" strokeWidth="1.5" />
                    <path d="M 142 106 Q 150 102 158 106" fill="none" stroke="#b0bec5" strokeWidth="2" />
                    <line x1="106" y1="104" x2="114" y2="110" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="186" y1="104" x2="194" y2="110" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
        case 'face_reddot':
            return (
                <g>
                    {/* 素珠点额妆 - Forehead traditional red bindi/flower makeup */}
                    <circle cx="150" cy="80" r="3.5" fill="#d32f2f" />
                    <circle cx="150" cy="74" r="1.5" fill="#d32f2f" />
                    <circle cx="150" cy="86" r="1.5" fill="#d32f2f" />
                    <circle cx="144" cy="80" r="1.5" fill="#d32f2f" />
                    <circle cx="156" cy="80" r="1.5" fill="#d32f2f" />
                </g>
            );
        case 'face_monocle':
            return (
                <g>
                    {/* 单眼神秘眼镜 - Classic gold monocle on left eye */}
                    <circle cx="120" cy="110" r="18" fill="#e0f7fa" fillOpacity="0.3" stroke="#ffd700" strokeWidth="2.5" />
                    <circle cx="120" cy="110" r="16.2" fill="none" stroke="#00b0ff" strokeWidth="1.2" />
                    <path d="M 102 110 Q 95 125 90 145" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
        case 'face_xmas_cheeks':
            return (
                <g>
                    {/* 圣诞彩绘 - Cheek painted green Xmas tree & red holly berries */}
                    <g transform="translate(100, 122)">
                        <polygon points="6,0 0,8 12,8" fill="#2e7d32" />
                        <polygon points="6,-4 2,2 10,2" fill="#2e7d32" />
                        <rect x="5" y="8" width="2" height="3" fill="#8d6e63" />
                        <circle cx="6" cy="-4" r="1.5" fill="#ffd54f" />
                    </g>
                    <g transform="translate(186, 122)">
                        <circle cx="4" cy="4" r="3.5" fill="#d50000" />
                        <circle cx="10" cy="6" r="3.5" fill="#d50000" />
                        <path d="M 4 2 Q 0 -6 -6 -4 Q -4 2 4 2 Z" fill="#388e3c" />
                        <path d="M 10 4 Q 14 -4 20 -2 Q 18 4 10 4 Z" fill="#388e3c" />
                    </g>
                </g>
            );
        case 'face_rimless_glasses':
            return (
                <g>
                    {/* 贵气无框眼镜 - Elegant rectangular rimless glasses with gold tint */}
                    <rect x="100" y="96" width="36" height="26" rx="4" fill="#fffde7" fillOpacity="0.2" stroke="#ffeb3b" strokeWidth="0.8" />
                    <rect x="164" y="96" width="36" height="26" rx="4" fill="#fffde7" fillOpacity="0.2" stroke="#ffeb3b" strokeWidth="0.8" />
                    <path d="M 136 106 Q 150 102 164 106" fill="none" stroke="#ffd700" strokeWidth="2.5" />
                    <circle cx="103" cy="99" r="1.2" fill="#ffd700" />
                    <circle cx="197" cy="99" r="1.2" fill="#ffd700" />
                    <path d="M 100 105 H 90 M 200 105 H 210" stroke="#ffd700" strokeWidth="1.5" />
                </g>
            );
        case 'face_glasses':
            return (
                <g>
                    {/* 书卷气眼镜 - Neat dark wire spectacles */}
                    <circle cx="120" cy="110" r="18" fill="none" stroke="#333" strokeWidth="2" />
                    <circle cx="180" cy="110" r="18" fill="none" stroke="#333" strokeWidth="2" />
                    <path d="M 138 110 Q 150 105 162 110" fill="none" stroke="#333" strokeWidth="2" />
                    <path d="M 102 110 H 90 M 198 110 H 210" stroke="#333" strokeWidth="2" />
                </g>
            );
        case 'face_shadow_dance':
            return (
                <g>
                    {/* 暗影之舞 - Mysterious black lace masquerade mask with a small red jewel */}
                    <path d="M 86 102 C 100 88, 138 98, 150 106 C 162 98, 200 88, 214 102 C 218 120, 186 130, 150 126 C 114 130, 82 120, 86 102 Z" fill="#212121" stroke="#e91e63" strokeWidth="1.5" />
                    <ellipse cx="120" cy="110" rx="10" ry="6" fill="#ffe0cc" stroke="#ffd700" strokeWidth="1.2" />
                    <ellipse cx="180" cy="110" rx="10" ry="6" fill="#ffe0cc" stroke="#ffd700" strokeWidth="1.2" />
                    <circle cx="150" cy="98" r="4.5" fill="#d50000" stroke="#ffd700" strokeWidth="1" />
                    <circle cx="150" cy="98" r="1.5" fill="#ffffff" />
                </g>
            );
        case 'face_ethnic_paint':
            return (
                <g>
                    {/* 民族彩绘 - Traditional ethnic red/orange paint markings on cheeks */}
                    <circle cx="108" cy="128" r="9" fill="#ff8f00" fillOpacity="0.2" />
                    <circle cx="192" cy="128" r="9" fill="#ff8f00" fillOpacity="0.2" />
                    <path d="M 98 120 L 108 126" stroke="#d84315" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 102 125 L 112 131" stroke="#ff8f00" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 96 130 L 106 136" stroke="#d84315" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 202 120 L 192 126" stroke="#d84315" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 198 125 L 188 131" stroke="#ff8f00" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 204 130 L 194 136" stroke="#d84315" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        case 'face_coolest_shades':
            return (
                <g>
                    {/* 全场最酷墨镜 - Black retro pixel sunglasses / thug-life shades */}
                    <rect x="94" y="102" width="46" height="15" fill="#111" stroke="#fff" strokeWidth="0.8" />
                    <rect x="160" y="102" width="46" height="15" fill="#111" stroke="#fff" strokeWidth="0.8" />
                    <rect x="140" y="105" width="20" height="4" fill="#111" />
                    <rect x="88" y="102" width="6" height="6" fill="#111" />
                    <rect x="206" y="102" width="6" height="6" fill="#111" />
                    <rect x="98" y="104" width="4" height="4" fill="#fff" />
                    <rect x="104" y="108" width="4" height="4" fill="#fff" />
                    <rect x="164" y="104" width="4" height="4" fill="#fff" />
                    <rect x="170" y="108" width="4" height="4" fill="#fff" />
                </g>
            );
        case 'face_pineapple_sunglasses':
            return (
                <g>
                    {/* 菠萝墨镜 - Fun round yellow-frame sunglasses with green pineapple leaves */}
                    <circle cx="120" cy="112" r="16" fill="#fbc02d" fillOpacity="0.2" stroke="#fbc02d" strokeWidth="3.5" />
                    <circle cx="180" cy="112" r="16" fill="#fbc02d" fillOpacity="0.2" stroke="#fbc02d" strokeWidth="3.5" />
                    <circle cx="120" cy="112" r="13" fill="#ffe082" fillOpacity="0.75" />
                    <circle cx="180" cy="112" r="13" fill="#ffe082" fillOpacity="0.75" />
                    <path d="M 136 112 Q 150 108 164 112" fill="none" stroke="#fbc02d" strokeWidth="3" />
                    {/* Pineapple crowns */}
                    <path d="M 120 96 Q 110 82 108 84 Q 120 88 120 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 120 96 Q 120 78 122 80 Q 124 84 120 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 120 96 Q 130 82 132 84 Q 120 88 120 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 180 96 Q 170 82 168 84 Q 180 88 180 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 180 96 Q 180 78 182 80 Q 184 84 180 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 180 96 Q 190 82 192 84 Q 180 88 180 96" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
                    {/* Grid texture overlay */}
                    <path d="M 112 108 L 128 120 M 112 116 L 124 104" stroke="#ffb300" strokeWidth="1" opacity="0.6" />
                    <path d="M 172 108 L 188 120 M 172 116 L 184 104" stroke="#ffb300" strokeWidth="1" opacity="0.6" />
                </g>
            );
        case 'face_vacation_shades':
            return (
                <g>
                    {/* 出游墨镜 - Retro white frame rectangular sunglasses with transparent lenses */}
                    <rect x="96" y="98" width="44" height="24" rx="8" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                    <rect x="160" y="98" width="44" height="24" rx="8" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                    <rect x="99" y="101" width="38" height="18" rx="5" fill="#37474f" fillOpacity="0.75" />
                    <rect x="163" y="101" width="38" height="18" rx="5" fill="#37474f" fillOpacity="0.75" />
                    <rect x="140" y="107" width="20" height="4" fill="#ffffff" />
                    <line x1="110" y1="102" x2="125" y2="118" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
                    <line x1="174" y1="102" x2="189" y2="118" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
                </g>
            );
        case 'face_cool_expression':
            return (
                <g>
                    {/* 酷酷表情 - Cool sunglasses with a smirk mouth expression combined */}
                    <path d="M 94 103 Q 150 96 206 103 L 198 120 Q 150 125 102 120 Z" fill="#212121" stroke="#333" strokeWidth="1.5" />
                    <path d="M 138 107 H 162" stroke="#ffd700" strokeWidth="2" />
                    <path d="M 106 108 Q 150 102 194 108" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                    <ellipse cx="106" cy="126" rx="8" ry="4" fill="#ffab91" fillOpacity="0.4" />
                    <ellipse cx="194" cy="126" rx="8" ry="4" fill="#ffab91" fillOpacity="0.4" />
                    <path d="M 144 140 Q 158 138 164 135" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 162 133 L 166 136" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
                </g>
            );
        case 'face_snot_bubble':
            return (
                <g>
                    {/* 鼻涕泡表情 - Sleepy expression with a closed winking eye and a snot bubble */}
                    <circle cx="120" cy="110" r="10" fill="#ffe0cc" />
                    <circle cx="180" cy="110" r="10" fill="#ffe0cc" />
                    <path d="M 110 110 Q 120 115 130 110" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 170 110 Q 180 115 190 110" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
                    <rect x="140" y="128" width="20" height="8" fill="#ffe0cc" />
                    <path d="M 144 132 Q 150 135 156 132" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="108" cy="125" r="9" fill="#ffab91" fillOpacity="0.4" />
                    <circle cx="192" cy="125" r="9" fill="#ffab91" fillOpacity="0.4" />
                    <g transform="translate(142, 122)">
                        <circle cx="0" cy="0" r="8" fill="#80deea" fillOpacity="0.65" stroke="#4dd0e1" strokeWidth="1.2" />
                        <circle cx="-3" cy="-3" r="2.2" fill="#ffffff" fillOpacity="0.8" />
                    </g>
                </g>
            );
        case 'face_sunflower_paint':
            return (
                <g>
                    {/* 向日葵彩绘 - Cute sunflower on right cheek */}
                    <circle cx="108" cy="125" r="9" fill="#ffab91" fillOpacity="0.4" />
                    <g transform="translate(192, 125)">
                        <circle cx="0" cy="0" r="11" fill="#fbc02d" />
                        <polygon points="0,-12 4,-4 12,0 4,4 0,12 -4,4 -12,0 -4,-4" fill="#ffd54f" />
                        <polygon points="-8,-8 0,-5 8,-8 5,0 8,8 0,5 -8,8 -5,0" fill="#ffd54f" />
                        <circle cx="0" cy="0" r="5.5" fill="#5d4037" stroke="#3e2723" strokeWidth="0.8" />
                        <path d="M -10 6 Q -18 12 -12 18 Q -4 14 -10 6 Z" fill="#81c784" stroke="#388e3c" strokeWidth="0.8" />
                    </g>
                </g>
            );
        case 'face_literary_beard':
            return (
                <g>
                    {/* 文艺络腮胡 - Stylish brown stubble beard framing chin and mouth */}
                    <path d="M 125 128 Q 150 125 175 128 Q 170 148 150 152 Q 130 148 125 128 Z" fill="#8d6e63" fillOpacity="0.55" stroke="#5d4037" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 136 128 Q 150 124 164 128 Q 150 134 136 128 Z" fill="#5d4037" fillOpacity="0.75" />
                </g>
            );
        case 'face_pirate_eyepatch':
            return (
                <g>
                    {/* 海盗眼罩 - Classic black pirate eyepatch on right eye */}
                    <line x1="90" y1="92" x2="210" y2="122" stroke="#212121" strokeWidth="3" />
                    <ellipse cx="180" cy="110" rx="16" ry="13" fill="#212121" stroke="#37474f" strokeWidth="1.2" />
                    <circle cx="180" cy="110" r="4.5" fill="#ffd700" />
                    <rect x="178.5" y="112.5" width="3" height="3" fill="#ffd700" />
                    <line x1="175" y1="105" x2="185" y2="115" stroke="#ffd700" strokeWidth="1" />
                    <line x1="175" y1="115" x2="185" y2="105" stroke="#ffd700" strokeWidth="1" />
                </g>
            );
        case 'face_dark_bat_mask':
            return (
                <g>
                    {/* 暗夜蝠影 - Bat superhero mask covering both eyes */}
                    <path d="M 90 102 L 115 90 L 132 108 L 150 96 L 168 108 L 185 90 L 210 102 Q 212 118 190 126 L 150 114 L 110 126 Q 88 118 90 102 Z" fill="#311b92" stroke="#ffab00" strokeWidth="1.5" />
                    <ellipse cx="120" cy="110" rx="9" ry="5.5" fill="#ffe0cc" stroke="#ffab00" strokeWidth="1" />
                    <ellipse cx="180" cy="110" rx="9" ry="5.5" fill="#ffe0cc" stroke="#ffab00" strokeWidth="1" />
                </g>
            );
        default:
            return null;
    }
}

// Simple Helper function for text label styling
function textx(content: string, x: number, y: number, size: number = 10) {
    return (
        <text x={x} y={y} fontSize={size} fill="#ffffff" fontWeight="black" textAnchor="middle" letterSpacing="1" stroke="#333" strokeWidth="1">
            {content.toUpperCase()}
        </text>
    );
}

function renderDeskOrnament(item: string) {
    if (!item) return null;

    return (
        <g transform="translate(150, 380)">
            {(() => {
                switch (item) {
                    case 'orn_fox':
                        return (
                            <g transform="scale(0.8)">
                                {/* Tails Background layer */}
                                <path d="M 60 70 Q 20 0 70 20 Q 90 0 100 20" fill="#fce4ec" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 80 80 Q 40 -10 90 10 Q 110 -10 120 10" fill="#f8bbd0" stroke="#f06292" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 100 90 Q 70 -20 120 0 Q 140 -20 150 10" fill="#fce4ec" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 120 90 Q 100 -20 150 -10 Q 170 -20 170 10" fill="#f8bbd0" stroke="#f06292" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 130 90 Q 140 -10 180 0 Q 190 10 180 30" fill="#fce4ec" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 140 100 Q 170 10 200 30 Q 210 40 190 60" fill="#f8bbd0" stroke="#f06292" strokeWidth="2" strokeLinejoin="round" />
                                {/* Tails Foreground layer */}
                                <path d="M 50 80 Q 0 30 50 50 Q 70 40 80 60" fill="#fff0f5" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 70 90 Q 30 20 80 40 Q 100 20 110 50" fill="#fce4ec" stroke="#f06292" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 90 90 Q 60 10 110 30 Q 130 10 140 40" fill="#fff0f5" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                {/* Fox Body Curled Up */}
                                <path d="M 50 100 Q 40 70 80 70 Q 150 70 150 100 Q 150 130 100 130 Q 50 130 50 100 Z" fill="#fff" stroke="#f48fb1" strokeWidth="2" />
                                <path d="M 60 100 Q 60 80 90 80 Q 140 80 140 100 Q 140 120 90 120 Q 60 120 60 100 Z" fill="#fce4ec" opacity="0.8" />
                                {/* Fox Head & Ears */}
                                <path d="M 50 110 Q 40 90 65 90 Q 90 90 80 115 Q 75 125 50 110 Z" fill="#fff" stroke="#f48fb1" strokeWidth="2" />
                                <path d="M 55 90 L 45 70 L 65 85 Z" fill="#fff" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 52 87 L 48 75 L 60 84 Z" fill="#f48fb1" />
                                <path d="M 75 92 L 85 75 L 85 92 Z" fill="#fff" stroke="#f48fb1" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 77 90 L 82 80 L 82 90 Z" fill="#f48fb1" />
                                {/* Sleeping face */}
                                <path d="M 50 105 Q 55 110 60 105" fill="none" stroke="#d81b60" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M 70 105 Q 75 110 80 105" fill="none" stroke="#d81b60" strokeWidth="1.5" strokeLinecap="round" />
                                {/* Blush */}
                                <ellipse cx="45" cy="110" rx="4" ry="2" fill="#ff8a80" opacity="0.6" />
                                <ellipse cx="85" cy="110" rx="4" ry="2" fill="#ff8a80" opacity="0.6" />
                                {/* Paws */}
                                <path d="M 60 125 Q 70 120 80 125 Q 85 135 60 135 Z" fill="#fff" stroke="#f48fb1" strokeWidth="1.5" />
                            </g>
                        );
                    case 'orn_blue_diffuser':
                        return (
                            <g transform="translate(0, 0)">
                                <ellipse cx="60" cy="120" rx="50" ry="15" fill="#1e3a8a" opacity="0.3" />
                                <path d="M 40 60 C 20 60, 20 120, 40 120 L 80 120 C 100 120, 100 60, 80 60 Z" fill="#93c5fd" stroke="#60a5fa" strokeWidth="2" />
                                <path d="M 50 40 L 40 60 L 80 60 L 70 40 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" />
                                <rect x="55" y="20" width="10" height="20" fill="#d1d5db" />
                                <path d="M 40 100 C 45 80, 75 80, 80 100 Z" fill="#3b82f6" opacity="0.6" />
                                {/* Reeds */}
                                <line x1="50" y1="30" x2="30" y2="-10" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                                <line x1="55" y1="20" x2="50" y2="-20" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                                <line x1="65" y1="20" x2="70" y2="-15" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_glass_lantern':
                        return (
                            <g transform="translate(20, -10)">
                                <ellipse cx="40" cy="130" rx="40" ry="10" fill="#312e81" opacity="0.4" />
                                <path d="M 20 30 L 60 30 L 70 120 L 10 120 Z" fill="#c4b5fd" opacity="0.6" stroke="#8b5cf6" strokeWidth="2" />
                                {/* Candle inside */}
                                <rect x="35" y="80" width="10" height="40" fill="#fef3c7" rx="2" />
                                <path d="M 40 80 Q 35 70 40 65 Q 45 70 40 80" fill="#fbbf24" />
                                <path d="M 40 75 Q 38 70 40 68 Q 42 70 40 75" fill="#f59e0b" />
                                {/* Frame */}
                                <rect x="8" y="120" width="64" height="10" fill="#4c1d95" rx="3" />
                                <rect x="15" y="20" width="50" height="10" fill="#4c1d95" rx="2" />
                                <path d="M 40 20 L 40 5 M 30 5 L 50 5" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" />
                                <circle cx="40" cy="-5" r="10" fill="none" stroke="#4c1d95" strokeWidth="3" />
                            </g>
                        );
                    case 'orn_dream_fish':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="60" cy="130" rx="35" ry="8" fill="#1e40af" opacity="0.3" />
                                {/* Base */}
                                <path d="M 40 120 L 80 120 L 70 90 L 50 90 Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="2" />
                                <rect x="30" y="120" width="60" height="10" fill="#6b7280" rx="2" />
                                {/* Glass dome */}
                                <path d="M 20 90 C 20 10, 100 10, 100 90 Z" fill="#93c5fd" opacity="0.4" stroke="#60a5fa" strokeWidth="2" />
                                {/* Glowing Fish */}
                                <path d="M 60 50 C 70 40, 80 50, 90 50 C 80 60, 70 60, 60 50" fill="#fde047" stroke="#eab308" strokeWidth="1" />
                                <polygon points="50,45 60,50 50,55" fill="#fef08a" />
                                {/* Water ripple */}
                                <path d="M 30 80 Q 60 70 90 80" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_panda_study':
                        return (
                            <g transform="translate(10, 10)">
                                {/* Shadow */}
                                <ellipse cx="60" cy="120" rx="40" ry="10" fill="#374151" opacity="0.3" />
                                {/* Books */}
                                <rect x="30" y="100" width="60" height="10" fill="#ef4444" rx="2" />
                                <rect x="35" y="90" width="50" height="10" fill="#3b82f6" rx="2" />
                                <rect x="30" y="80" width="55" height="10" fill="#10b981" rx="2" />
                                {/* Panda */}
                                <circle cx="60" cy="40" r="25" fill="#fff" stroke="#1f2937" strokeWidth="2" />
                                {/* Ears */}
                                <circle cx="40" cy="20" r="8" fill="#1f2937" />
                                <circle cx="80" cy="20" r="8" fill="#1f2937" />
                                {/* Eyes */}
                                <path d="M 45 35 C 40 45, 55 45, 50 35 Z" fill="#1f2937" />
                                <path d="M 75 35 C 80 45, 65 45, 70 35 Z" fill="#1f2937" />
                                <circle cx="48" cy="40" r="2" fill="#fff" />
                                <circle cx="72" cy="40" r="2" fill="#fff" />
                                {/* Nose */}
                                <circle cx="60" cy="48" r="3" fill="#1f2937" />
                                {/* Paws on books */}
                                <circle cx="45" cy="75" r="7" fill="#1f2937" />
                                <circle cx="75" cy="75" r="7" fill="#1f2937" />
                            </g>
                        );
                    case 'orn_sea_otter_lamp':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="50" cy="130" rx="45" ry="10" fill="#0369a1" opacity="0.3" />
                                {/* Lamp Base / Rock */}
                                <path d="M 20 130 C 10 100, 90 100, 80 130 Z" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                                {/* Otter body */}
                                <path d="M 30 110 C 20 60, 60 50, 70 80 C 80 100, 70 120, 50 120" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                {/* Otter face */}
                                <circle cx="55" cy="70" r="15" fill="#d97706" />
                                <circle cx="50" cy="68" r="2" fill="#111827" />
                                <circle cx="60" cy="68" r="2" fill="#111827" />
                                <circle cx="55" cy="73" r="3" fill="#111827" />
                                {/* Glowing pearl/lamp */}
                                <circle cx="40" cy="90" r="12" fill="#fef08a" stroke="#fde047" strokeWidth="3" />
                                <circle cx="40" cy="90" r="6" fill="#fff" />
                                {/* Otter Paws holding pearl */}
                                <path d="M 35 100 L 40 95" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_halloween':
                        return (
                            <g transform="translate(10, -20)">
                                <ellipse cx="50" cy="150" rx="40" ry="10" fill="#7c2d12" opacity="0.3" />
                                {/* Machine Base */}
                                <rect x="30" y="90" width="40" height="60" fill="#f97316" stroke="#c2410c" strokeWidth="2" rx="4" />
                                <rect x="40" y="110" width="20" height="25" fill="#431407" rx="2" />
                                <circle cx="50" cy="100" r="4" fill="#fbbf24" />
                                {/* Glass Globe */}
                                <circle cx="50" cy="50" r="35" fill="#fcd34d" opacity="0.5" stroke="#f59e0b" strokeWidth="2" />
                                {/* Candies */}
                                <circle cx="35" cy="70" r="5" fill="#ef4444" />
                                <circle cx="50" cy="75" r="5" fill="#3b82f6" />
                                <circle cx="65" cy="65" r="5" fill="#10b981" />
                                <circle cx="45" cy="60" r="5" fill="#8b5cf6" />
                                <circle cx="55" cy="50" r="5" fill="#ec4899" />
                                {/* Pumpkin cap */}
                                <path d="M 30 15 C 40 5, 60 5, 70 15 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
                                <path d="M 45 15 L 50 5 L 55 15" fill="#15803d" />
                            </g>
                        );
                    case 'orn_star_grimoire':
                        return (
                            <g transform="translate(15, 20)">
                                <ellipse cx="50" cy="110" rx="45" ry="12" fill="#1e1b4b" opacity="0.4" />
                                {/* Book Cover */}
                                <path d="M 10 90 L 40 70 L 90 85 L 60 105 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="3" strokeLinejoin="round" />
                                {/* Pages */}
                                <path d="M 10 90 L 10 95 L 60 110 L 90 90 L 90 85 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                                {/* Top Cover (Opened slightly) */}
                                <path d="M 10 90 L 35 40 L 80 50 L 60 105 Z" fill="#4c1d95" stroke="#312e81" strokeWidth="2" strokeLinejoin="round" />
                                {/* Star symbol */}
                                <polygon points="45,60 50,50 55,60 65,65 55,70 50,80 45,70 35,65" fill="#fde047" />
                                {/* Glowing magic particles */}
                                <circle cx="40" cy="30" r="2" fill="#fef08a" />
                                <circle cx="60" cy="20" r="3" fill="#fef08a" />
                                <circle cx="80" cy="35" r="2" fill="#fef08a" />
                                <circle cx="30" cy="50" r="1.5" fill="#fef08a" />
                            </g>
                        );
                    case 'orn_future_city':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="55" cy="130" rx="45" ry="10" fill="#0f172a" opacity="0.4" />
                                {/* Base Disc */}
                                <ellipse cx="55" cy="120" rx="40" ry="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                                {/* Neon Grid Base */}
                                <line x1="30" y1="120" x2="80" y2="120" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
                                <line x1="55" y1="115" x2="55" y2="125" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
                                {/* Holographic buildings */}
                                <rect x="25" y="60" width="15" height="55" fill="#38bdf8" opacity="0.6" stroke="#0284c7" strokeWidth="1" rx="1" />
                                <rect x="45" y="30" width="20" height="85" fill="#818cf8" opacity="0.6" stroke="#4f46e5" strokeWidth="1" rx="1" />
                                <rect x="70" y="70" width="12" height="45" fill="#c084fc" opacity="0.6" stroke="#9333ea" strokeWidth="1" rx="1" />
                                {/* Cyber lines */}
                                <line x1="25" y1="70" x2="40" y2="70" stroke="#bae6fd" strokeWidth="1" />
                                <line x1="45" y1="50" x2="65" y2="50" stroke="#e0e7ff" strokeWidth="1" />
                                <line x1="45" y1="90" x2="65" y2="90" stroke="#e0e7ff" strokeWidth="1" />
                                {/* Flying car trail */}
                                <path d="M 10 80 Q 55 20 100 60" fill="none" stroke="#f472b6" strokeWidth="2" strokeDasharray="4,4" />
                            </g>
                        );
                    case 'orn_butterfly_candle':
                        return (
                            <g transform="translate(25, 0)">
                                <ellipse cx="30" cy="130" rx="25" ry="8" fill="#3f2c2c" opacity="0.3" />
                                {/* Candle base */}
                                <path d="M 15 130 C 15 110, 45 110, 45 130 Z" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="2" />
                                {/* Candle */}
                                <rect x="20" y="60" width="20" height="65" fill="#fef08a" rx="2" />
                                {/* Melted wax */}
                                <path d="M 20 70 Q 25 80 30 70 Q 35 75 40 65" fill="#fde047" />
                                {/* Flame */}
                                <path d="M 30 60 Q 25 45 30 40 Q 35 45 30 60" fill="#f97316" />
                                <path d="M 30 55 Q 28 48 30 45 Q 32 48 30 55" fill="#fef08a" />
                                {/* Butterflies */}
                                <path d="M 50 30 C 55 25, 60 30, 55 35 C 50 35, 45 30, 50 30 Z" fill="#c084fc" />
                                <path d="M -5 50 C 0 45, 5 50, 0 55 C -5 55, -10 50, -5 50 Z" fill="#818cf8" />
                                <path d="M 45 70 C 50 65, 55 70, 50 75 C 45 75, 40 70, 45 70 Z" fill="#f472b6" />
                                {/* Glowing aura */}
                                <circle cx="30" cy="45" r="20" fill="#fef08a" opacity="0.2" />
                            </g>
                        );
                    case 'orn_wishing_cup':
                        return (
                            <g transform="translate(15, 30)">
                                <ellipse cx="40" cy="100" rx="30" ry="8" fill="#1e293b" opacity="0.3" />
                                {/* Teacup Base / Saucer */}
                                <ellipse cx="40" cy="95" rx="25" ry="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                                {/* Cup */}
                                <path d="M 20 60 L 25 90 C 25 95, 55 95, 55 90 L 60 60 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                                {/* Cup Handle */}
                                <path d="M 60 65 C 75 65, 75 80, 58 85" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                <path d="M 60 65 C 75 65, 75 80, 58 85" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                {/* Drink / Aroma */}
                                <ellipse cx="40" cy="60" rx="18" ry="4" fill="#fed7aa" />
                                {/* Steam / Wishes */}
                                <path d="M 30 50 Q 25 30 35 10" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                                <path d="M 45 55 Q 50 40 40 20" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                                {/* Sparkles */}
                                <polygon points="35,10 38,5 41,10 46,13 41,16 38,21 35,16 30,13" fill="#fde047" />
                                <polygon points="40,20 42,17 44,20 47,22 44,24 42,27 40,24 37,22" fill="#fde047" />
                            </g>
                        );
                    case 'orn_fishtank':
                        return (
                            <g transform="translate(10, 10)">
                                <ellipse cx="50" cy="120" rx="40" ry="10" fill="#172554" opacity="0.3" />
                                {/* Tank Base */}
                                <rect x="20" y="110" width="60" height="8" fill="#1f2937" rx="2" />
                                {/* Tank Glass */}
                                <rect x="25" y="40" width="50" height="70" fill="#bae6fd" opacity="0.4" stroke="#7dd3fc" strokeWidth="2" rx="4" />
                                {/* Water */}
                                <path d="M 25 60 Q 50 50 75 60 L 75 110 L 25 110 Z" fill="#38bdf8" opacity="0.5" />
                                {/* Rock / Plant */}
                                <path d="M 40 110 L 45 90 L 55 100 L 65 85 L 65 110 Z" fill="#10b981" opacity="0.8" />
                                <path d="M 30 110 L 40 100 L 50 110 Z" fill="#64748b" />
                                {/* Little fish */}
                                <path d="M 35 75 Q 45 70 45 75 Q 45 80 35 75 Z" fill="#f97316" />
                                <polygon points="35,75 30,70 30,80" fill="#fb923c" />
                                <path d="M 60 65 Q 50 60 50 65 Q 50 70 60 65 Z" fill="#f97316" />
                                <polygon points="60,65 65,60 65,70" fill="#fb923c" />
                                {/* Bubbles */}
                                <circle cx="55" cy="85" r="2" fill="#fff" opacity="0.6" />
                                <circle cx="50" cy="70" r="1.5" fill="#fff" opacity="0.6" />
                                <circle cx="60" cy="50" r="2.5" fill="#fff" opacity="0.6" />
                            </g>
                        );
                    case 'orn_paper_umbrella':
                        return (
                            <g transform="translate(10, -20)">
                                <ellipse cx="50" cy="150" rx="30" ry="8" fill="#3f3f46" opacity="0.3" />
                                {/* Wooden Base */}
                                <path d="M 35 150 L 65 150 L 55 130 L 45 130 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                {/* Umbrella Stick */}
                                <rect x="48" y="40" width="4" height="90" fill="#92400e" />
                                {/* Umbrella Canopy */}
                                <path d="M 10 80 Q 50 20 90 80 Q 50 90 10 80 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                {/* Ribs */}
                                <path d="M 50 40 L 10 80" stroke="#cbd5e1" strokeWidth="1" />
                                <path d="M 50 40 L 30 85" stroke="#cbd5e1" strokeWidth="1" />
                                <path d="M 50 40 L 50 88" stroke="#cbd5e1" strokeWidth="1" />
                                <path d="M 50 40 L 70 85" stroke="#cbd5e1" strokeWidth="1" />
                                <path d="M 50 40 L 90 80" stroke="#cbd5e1" strokeWidth="1" />
                                {/* Plum blossom paintings */}
                                <circle cx="40" cy="70" r="3" fill="#ef4444" opacity="0.8" />
                                <circle cx="60" cy="65" r="2" fill="#ef4444" opacity="0.8" />
                                <circle cx="70" cy="75" r="2.5" fill="#ef4444" opacity="0.8" />
                                <path d="M 50 88 L 40 70 L 60 65 L 70 75" fill="none" stroke="#1f2937" strokeWidth="0.5" opacity="0.5" />
                                {/* Snow accumulation */}
                                <path d="M 45 35 Q 50 30 55 35 Q 50 45 45 35 Z" fill="#fff" />
                                <path d="M 20 65 Q 25 60 30 65 Q 25 75 20 65 Z" fill="#fff" />
                                <path d="M 75 60 Q 80 55 85 60 Q 80 70 75 60 Z" fill="#fff" />
                            </g>
                        );
                    case 'orn_chinese_painting':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="40" cy="130" rx="30" ry="6" fill="#27272a" opacity="0.3" />
                                {/* Stand */}
                                <path d="M 25 130 L 55 130 L 50 110 L 30 110 Z" fill="#451a03" stroke="#2dd4bf" strokeWidth="1" />
                                <rect x="35" y="40" width="10" height="70" fill="#451a03" />
                                {/* Painting Frame */}
                                <rect x="15" y="20" width="50" height="60" fill="#fff" stroke="#451a03" strokeWidth="3" rx="2" />
                                {/* Inner mat */}
                                <rect x="20" y="25" width="40" height="50" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="1" />
                                {/* Painting: Mountains & Sun */}
                                <circle cx="40" cy="40" r="8" fill="#ef4444" opacity="0.8" />
                                <path d="M 20 60 L 30 45 L 45 65 L 60 50 L 60 75 L 20 75 Z" fill="#1f2937" />
                                <path d="M 20 70 L 35 60 L 50 75 L 60 65 L 60 75 L 20 75 Z" fill="#4b5563" opacity="0.7" />
                                {/* Calligraphy marks */}
                                <rect x="23" y="28" width="4" height="12" fill="#ef4444" />
                            </g>
                        );
                    case 'orn_good_luck_bottle':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="25" ry="6" fill="#14532d" opacity="0.3" />
                                {/* Glass Bottle */}
                                <path d="M 20 30 L 40 30 L 45 60 L 50 100 C 50 115, 10 115, 10 100 L 15 60 Z" fill="#a7f3d0" opacity="0.4" stroke="#34d399" strokeWidth="2" />
                                {/* Cork */}
                                <rect x="22" y="20" width="16" height="10" fill="#b45309" rx="2" />
                                {/* Inside - Lucky items (coins, clovers) */}
                                <circle cx="30" cy="95" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                                <rect x="28" y="93" width="4" height="4" fill="#d97706" />
                                <path d="M 20 85 C 15 80, 25 75, 20 85 Z" fill="#10b981" />
                                <path d="M 25 80 C 20 75, 30 70, 25 80 Z" fill="#10b981" />
                                <path d="M 40 85 C 35 80, 45 75, 40 85 Z" fill="#10b981" />
                                <circle cx="35" cy="80" r="4" fill="#fbbf24" />
                                {/* String around neck */}
                                <rect x="18" y="30" width="24" height="3" fill="#fca5a5" />
                                <path d="M 30 33 L 25 45 M 30 33 L 35 45" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_nomadic':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="40" cy="120" rx="35" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Wooden Base logs */}
                                <rect x="15" y="110" width="50" height="8" fill="#78350f" rx="3" />
                                <rect x="25" y="102" width="30" height="8" fill="#92400e" rx="3" />
                                {/* Antlers / Horns */}
                                <path d="M 40 90 C 10 70, 10 20, 20 10 C 25 15, 25 30, 35 40 Z" fill="#eaddcf" stroke="#a8a29e" strokeWidth="2" />
                                <path d="M 40 90 C 70 70, 70 20, 60 10 C 55 15, 55 30, 45 40 Z" fill="#eaddcf" stroke="#a8a29e" strokeWidth="2" />
                                {/* Center gem / shield */}
                                <path d="M 30 60 L 50 60 L 40 90 Z" fill="#0369a1" stroke="#0284c7" strokeWidth="2" strokeLinejoin="round" />
                                <circle cx="40" cy="70" r="5" fill="#38bdf8" />
                                {/* Leather wraps */}
                                <rect x="35" y="90" width="10" height="12" fill="#b45309" />
                                <line x1="35" y1="94" x2="45" y2="94" stroke="#78350f" strokeWidth="1" />
                                <line x1="35" y1="98" x2="45" y2="98" stroke="#78350f" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_calligraphy_scroll':
                        return (
                            <g transform="translate(10, 20)">
                                <ellipse cx="50" cy="110" rx="40" ry="8" fill="#27272a" opacity="0.3" />
                                {/* Scroll Rack */}
                                <path d="M 20 110 L 25 30 M 80 110 L 75 30" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
                                <line x1="15" y1="40" x2="85" y2="40" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
                                {/* Rolled Scroll */}
                                <rect x="35" y="40" width="30" height="60" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="2" />
                                <rect x="30" y="35" width="40" height="10" fill="#b45309" rx="2" />
                                <rect x="30" y="95" width="40" height="10" fill="#b45309" rx="2" />
                                {/* Calligraphy text representation */}
                                <path d="M 45 55 Q 40 60 55 65 M 45 75 Q 50 70 55 80 M 45 85 Q 55 85 50 90" fill="none" stroke="#1f2937" strokeWidth="2" />
                            </g>
                        );
                    case 'orn_flowertower':
                        return (
                            <g transform="translate(15, -10)">
                                <ellipse cx="35" cy="140" rx="30" ry="8" fill="#064e3b" opacity="0.3" />
                                {/* Base Pot */}
                                <path d="M 15 140 L 55 140 L 50 120 L 20 120 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                                <rect x="15" y="115" width="40" height="5" fill="#fde047" rx="2" />
                                {/* Tower Pole */}
                                <rect x="33" y="20" width="4" height="95" fill="#65a30d" />
                                {/* Tier 1 Flowers */}
                                <path d="M 15 100 C 35 120, 55 120, 55 100 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
                                <circle cx="35" cy="100" r="5" fill="#fbbf24" />
                                {/* Tier 2 Flowers */}
                                <path d="M 20 70 C 35 90, 50 90, 50 70 Z" fill="#c084fc" stroke="#9333ea" strokeWidth="1" />
                                <circle cx="35" cy="70" r="4" fill="#fbbf24" />
                                {/* Tier 3 Flowers */}
                                <path d="M 25 40 C 35 55, 45 55, 45 40 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1" />
                                <circle cx="35" cy="40" r="3" fill="#fbbf24" />
                                {/* Top Star/Flower */}
                                <polygon points="35,10 40,20 50,20 42,28 45,38 35,32 25,38 28,28 20,20 30,20" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_adventurer':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="40" cy="120" rx="35" ry="8" fill="#1e293b" opacity="0.3" />
                                {/* Base rock */}
                                <path d="M 15 120 C 15 100, 65 100, 65 120 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                                {/* Compass */}
                                <circle cx="40" cy="90" r="15" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                                <circle cx="40" cy="90" r="12" fill="#fff" />
                                <polygon points="40,80 43,90 40,100 37,90" fill="#ef4444" />
                                {/* Telescope */}
                                <path d="M 10 50 L 50 70 L 45 75 L 5 55 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <rect x="5" y="50" width="8" height="12" fill="#fcd34d" transform="rotate(26, 9, 56)" />
                                <rect x="45" y="65" width="10" height="15" fill="#fcd34d" transform="rotate(26, 50, 72)" />
                                {/* Map */}
                                <path d="M 55 95 L 75 85 L 80 105 L 60 115 Z" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="1" />
                                <path d="M 60 100 L 70 95 M 65 105 L 75 100" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,1" />
                            </g>
                        );
                    case 'orn_wooden_rack':
                        return (
                            <g transform="translate(5, -10)">
                                <ellipse cx="55" cy="140" rx="45" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Frame */}
                                <rect x="15" y="20" width="80" height="120" fill="none" stroke="#78350f" strokeWidth="6" rx="4" />
                                {/* Shelves */}
                                <line x1="15" y1="60" x2="95" y2="60" stroke="#78350f" strokeWidth="4" />
                                <line x1="15" y1="100" x2="95" y2="100" stroke="#78350f" strokeWidth="4" />
                                {/* Items on Top Shelf */}
                                <rect x="25" y="35" width="15" height="25" fill="#ef4444" rx="2" />
                                <circle cx="65" cy="45" r="15" fill="#60a5fa" />
                                {/* Items on Middle Shelf */}
                                <rect x="30" y="80" width="30" height="20" fill="#10b981" rx="1" />
                                <polygon points="75,100 85,100 80,75" fill="#f59e0b" />
                                {/* Items on Bottom Shelf */}
                                <path d="M 25 140 C 25 120, 45 120, 45 140 Z" fill="#a8a29e" />
                                <rect x="60" y="110" width="20" height="30" fill="#d946ef" rx="2" />
                            </g>
                        );
                    case 'orn_wheat_book_lamp':
                        return (
                            <g transform="translate(10, 10)">
                                <ellipse cx="50" cy="120" rx="40" ry="10" fill="#fef3c7" opacity="0.3" />
                                {/* Open Book Base */}
                                <path d="M 20 110 L 50 120 L 80 110 L 50 100 Z" fill="#fff" stroke="#d4d4d8" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 20 110 L 20 115 L 50 125 L 80 115 L 80 110" fill="#f3f4f6" stroke="#d4d4d8" strokeWidth="1" />
                                {/* Glowing pages / wheat field pop-up */}
                                <path d="M 25 105 Q 50 40 75 105" fill="#fde047" opacity="0.5" />
                                <path d="M 35 110 Q 50 50 65 110" fill="#fbbf24" opacity="0.7" />
                                {/* Wheat stalks */}
                                <path d="M 40 105 Q 45 70 50 80" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 50 105 Q 55 60 45 70" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 60 105 Q 55 75 60 85" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                {/* Wheat grains */}
                                <circle cx="50" cy="80" r="2" fill="#fef08a" />
                                <circle cx="45" cy="70" r="2" fill="#fef08a" />
                                <circle cx="60" cy="85" r="2" fill="#fef08a" />
                                {/* Glow aura */}
                                <circle cx="50" cy="80" r="20" fill="#fef08a" opacity="0.2" />
                            </g>
                        );
                    case 'orn_sailing_ship':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="50" cy="130" rx="40" ry="8" fill="#1e3a8a" opacity="0.3" />
                                {/* Wood Base */}
                                <rect x="25" y="125" width="50" height="5" fill="#451a03" rx="2" />
                                {/* Ship Hull */}
                                <path d="M 20 100 L 80 100 L 70 120 L 30 120 Z" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="2" />
                                <path d="M 25 110 L 75 110" stroke="#c4b5fd" strokeWidth="1" />
                                {/* Masts */}
                                <rect x="40" y="30" width="2" height="70" fill="#78350f" />
                                <rect x="60" y="40" width="2" height="60" fill="#78350f" />
                                {/* Sails */}
                                <path d="M 42 35 Q 60 50 42 70 Q 30 50 42 35" fill="#fdf4ff" stroke="#e879f9" strokeWidth="1" />
                                <path d="M 62 45 Q 80 60 62 80 Q 50 60 62 45" fill="#fdf4ff" stroke="#e879f9" strokeWidth="1" />
                                {/* Flags */}
                                <polygon points="42,30 55,35 42,40" fill="#ef4444" />
                                <polygon points="62,40 70,43 62,46" fill="#ef4444" />
                            </g>
                        );
                    case 'orn_clown_box':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="30" ry="8" fill="#7f1d1d" opacity="0.3" />
                                {/* Box */}
                                <path d="M 20 90 L 50 90 L 60 100 L 60 130 L 30 130 L 20 120 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M 20 120 L 50 120 L 60 130 M 50 90 L 50 120" stroke="#991b1b" strokeWidth="2" />
                                {/* Box Lid (Popped open) */}
                                <path d="M 10 70 L 40 50 L 55 60 L 25 80 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" strokeLinejoin="round" />
                                {/* Spring */}
                                <path d="M 40 95 Q 30 85 45 75 Q 35 65 45 55 L 42 45" fill="none" stroke="#94a3b8" strokeWidth="3" />
                                {/* Clown Head */}
                                <circle cx="42" cy="40" r="15" fill="#fff" stroke="#1f2937" strokeWidth="1.5" />
                                {/* Clown Hair */}
                                <circle cx="28" cy="35" r="8" fill="#ef4444" />
                                <circle cx="56" cy="35" r="8" fill="#ef4444" />
                                {/* Clown Face */}
                                <circle cx="37" cy="38" r="2" fill="#1f2937" />
                                <circle cx="47" cy="38" r="2" fill="#1f2937" />
                                <circle cx="42" cy="42" r="3" fill="#ef4444" />
                                <path d="M 35 48 Q 42 55 49 48" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                                {/* Clown Hat */}
                                <polygon points="32,28 52,28 42,10" fill="#3b82f6" />
                                <circle cx="42" cy="8" r="3" fill="#fde047" />
                            </g>
                        );
                    case 'orn_dai_pottery':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="30" cy="120" rx="25" ry="6" fill="#451a03" opacity="0.3" />
                                {/* Pottery Body */}
                                <path d="M 20 120 C 0 90, 60 90, 40 120 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <path d="M 15 90 C 10 60, 50 60, 45 90 Z" fill="#d97706" stroke="#92400e" strokeWidth="2" />
                                {/* Pottery Neck & Opening */}
                                <rect x="25" y="45" width="10" height="20" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <ellipse cx="30" cy="45" rx="10" ry="3" fill="#92400e" stroke="#78350f" strokeWidth="2" />
                                {/* Traditional Patterns */}
                                <path d="M 17 80 L 43 80 M 16 95 L 44 95 M 22 110 L 38 110" stroke="#78350f" strokeWidth="1" strokeDasharray="2,2" />
                                <circle cx="30" cy="70" r="5" fill="none" stroke="#78350f" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_festive_flowers':
                        return (
                            <g transform="translate(15, -10)">
                                <ellipse cx="35" cy="140" rx="30" ry="8" fill="#7f1d1d" opacity="0.3" />
                                {/* Basket / Vase */}
                                <path d="M 15 140 L 55 140 L 50 90 L 20 90 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                                <rect x="18" y="90" width="34" height="5" fill="#fde047" />
                                <rect x="25" y="110" width="20" height="20" fill="#fde047" rx="2" />
                                <text x="35" y="125" fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="bold">福</text>
                                {/* Flowers - Peonies / Hydrangeas */}
                                <circle cx="20" cy="75" r="15" fill="#f43f5e" />
                                <circle cx="50" cy="75" r="15" fill="#fbbf24" />
                                <circle cx="35" cy="55" r="18" fill="#e11d48" />
                                <circle cx="25" cy="50" r="12" fill="#fca5a5" />
                                <circle cx="45" cy="45" r="14" fill="#f59e0b" />
                                {/* Leaves */}
                                <path d="M 35 90 Q 10 80 5 60" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 35 90 Q 60 80 65 60" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                                {/* Small branches/buds */}
                                <circle cx="10" cy="55" r="3" fill="#fbbf24" />
                                <circle cx="60" cy="50" r="3" fill="#f43f5e" />
                                <circle cx="40" cy="25" r="4" fill="#fbbf24" />
                            </g>
                        );
                    case 'orn_2025_calendar':
                        return (
                            <g transform="translate(25, 20)">
                                <ellipse cx="25" cy="110" rx="20" ry="6" fill="#e2e8f0" opacity="0.5" />
                                {/* Calendar Stand */}
                                <path d="M 5 110 L 45 110 L 35 40 L 15 40 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
                                {/* Calendar Pages */}
                                <rect x="10" y="45" width="30" height="55" fill="#fff" stroke="#e2e8f0" strokeWidth="1" rx="2" />
                                {/* Spiral binding */}
                                <path d="M 15 40 L 15 45 M 25 40 L 25 45 M 35 40 L 35 45" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                                {/* Calendar Content */}
                                <rect x="10" y="45" width="30" height="15" fill="#ef4444" rx="2" />
                                <text x="25" y="56" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">2025</text>
                                {/* Dates representation */}
                                <line x1="15" y1="70" x2="35" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                                <line x1="15" y1="80" x2="35" y2="80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                                <line x1="15" y1="90" x2="35" y2="90" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                                {/* Red circle on a date */}
                                <circle cx="20" cy="70" r="3" fill="none" stroke="#ef4444" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_crooked_lamp':
                        return (
                            <g transform="translate(20, 0)">
                                <ellipse cx="30" cy="130" rx="25" ry="8" fill="#64748b" opacity="0.3" />
                                {/* Lamp Base */}
                                <ellipse cx="30" cy="125" rx="20" ry="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                                {/* Crooked Neck */}
                                <path d="M 30 120 C 30 80, 70 80, 50 40" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                                {/* Lamp Shade */}
                                <path d="M 50 40 L 30 20 C 50 10, 70 30, 50 40 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                                {/* Light Beam */}
                                <path d="M 40 30 L -10 100 L 30 130 Z" fill="#fef08a" opacity="0.3" />
                                {/* Light Bulb */}
                                <circle cx="45" cy="30" r="5" fill="#fef08a" />
                            </g>
                        );
                    case 'orn_aroma_candle':
                        return (
                            <g transform="translate(30, 30)">
                                <ellipse cx="20" cy="100" rx="20" ry="6" fill="#fca5a5" opacity="0.3" />
                                {/* Holder */}
                                <path d="M 5 100 C 5 80, 35 80, 35 100 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
                                <ellipse cx="20" cy="90" rx="15" ry="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1" />
                                {/* Candle */}
                                <rect x="15" y="60" width="10" height="30" fill="#fff" rx="1" />
                                {/* Melted wax */}
                                <path d="M 15 65 Q 20 70 25 65 Q 27 75 22 75 Z" fill="#fff" />
                                {/* Flame */}
                                <path d="M 20 60 Q 15 50 20 45 Q 25 50 20 60" fill="#fbbf24" />
                                <path d="M 20 56 Q 18 50 20 48 Q 22 50 20 56" fill="#fef08a" />
                                {/* Aroma smoke */}
                                <path d="M 20 40 Q 10 20 30 0" fill="none" stroke="#e2e8f0" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_wheel_lamp':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="30" ry="8" fill="#1e293b" opacity="0.4" />
                                {/* Base */}
                                <rect x="15" y="120" width="40" height="10" fill="#475569" rx="2" stroke="#334155" strokeWidth="2" />
                                {/* Arm */}
                                <rect x="30" y="60" width="10" height="60" fill="#94a3b8" />
                                {/* Wheel */}
                                <circle cx="35" cy="60" r="25" fill="#cbd5e1" stroke="#64748b" strokeWidth="4" />
                                <circle cx="35" cy="60" r="5" fill="#475569" />
                                {/* Wheel Spokes */}
                                <line x1="35" y1="35" x2="35" y2="85" stroke="#94a3b8" strokeWidth="2" />
                                <line x1="10" y1="60" x2="60" y2="60" stroke="#94a3b8" strokeWidth="2" />
                                <line x1="17" y1="42" x2="53" y2="78" stroke="#94a3b8" strokeWidth="2" />
                                <line x1="17" y1="78" x2="53" y2="42" stroke="#94a3b8" strokeWidth="2" />
                                {/* Lamp Shade extending from center */}
                                <path d="M 35 60 L 70 40 L 75 70 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
                                {/* Light Beam */}
                                <path d="M 72 55 L 120 20 L 120 90 Z" fill="#fef08a" opacity="0.3" />
                            </g>
                        );
                    case 'orn_cloud_incense':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="25" ry="6" fill="#1e3a8a" opacity="0.3" />
                                {/* Incense Burner Body (Celadon green/blue) */}
                                <path d="M 10 100 C -10 60, 70 60, 50 100 Z" fill="#99f6e4" stroke="#0d9488" strokeWidth="2" />
                                {/* Burner Lid / Cloud Shape */}
                                <path d="M 15 65 C 10 50, 30 40, 30 55 C 40 35, 60 45, 50 65 Z" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
                                {/* Legs */}
                                <path d="M 20 100 L 15 110 M 40 100 L 45 110 M 30 100 L 30 112" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                                {/* Smoke (Clouds) */}
                                <path d="M 30 45 Q 20 20 40 10 Q 50 0 30 -10" fill="none" stroke="#f1f5f9" strokeWidth="4" opacity="0.7" strokeLinecap="round" />
                                <path d="M 30 45 Q 40 25 25 15" fill="none" stroke="#f1f5f9" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_retro_flowers':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="30" cy="120" rx="20" ry="6" fill="#451a03" opacity="0.3" />
                                {/* Retro Vase (Dark Brown) */}
                                <path d="M 20 120 L 40 120 L 45 70 L 15 70 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                <rect x="20" y="60" width="20" height="10" fill="#92400e" rx="2" />
                                {/* Flowers - Dahlias / Roses */}
                                <circle cx="20" cy="45" r="10" fill="#ef4444" />
                                <circle cx="40" cy="50" r="12" fill="#f59e0b" />
                                <circle cx="30" cy="30" r="14" fill="#dc2626" />
                                {/* Leaves */}
                                <path d="M 25 60 Q 5 50 0 70" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 35 60 Q 55 50 60 70" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                                {/* Small details */}
                                <circle cx="15" cy="35" r="3" fill="#fbbf24" />
                                <circle cx="45" cy="35" r="4" fill="#fbbf24" />
                            </g>
                        );
                    case 'orn_lotus_lantern':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="30" ry="8" fill="#1e1b4b" opacity="0.3" />
                                {/* Lantern Base */}
                                <path d="M 20 130 L 50 130 L 45 110 L 25 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                {/* Lotus Petals (Lantern Body) */}
                                <path d="M 35 110 C 15 90, 15 50, 35 40 C 55 50, 55 90, 35 110 Z" fill="#fdf4ff" stroke="#e879f9" strokeWidth="2" />
                                <path d="M 35 110 C 25 90, 25 60, 35 50 C 45 60, 45 90, 35 110 Z" fill="#fae8ff" stroke="#d946ef" strokeWidth="1" />
                                {/* Inner Glow */}
                                <circle cx="35" cy="80" r="15" fill="#fef08a" opacity="0.8" />
                                <circle cx="35" cy="80" r="5" fill="#fff" />
                                {/* Lotus Leaves at base */}
                                <path d="M 25 110 Q 10 115 15 125 Z" fill="#4ade80" />
                                <path d="M 45 110 Q 60 115 55 125 Z" fill="#4ade80" />
                                {/* Handle / Stick */}
                                <path d="M 35 40 C 35 20, 50 10, 60 20" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_dragon_boat':
                        return (
                            <g transform="translate(0, 20)">
                                <ellipse cx="50" cy="110" rx="45" ry="8" fill="#0c4a6e" opacity="0.3" />
                                {/* Wave Base */}
                                <path d="M 10 110 Q 30 100 50 110 Q 70 120 90 110 L 90 115 L 10 115 Z" fill="#38bdf8" opacity="0.6" />
                                {/* Boat Hull */}
                                <path d="M 10 90 L 85 90 L 75 110 L 20 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                {/* Dragon Head */}
                                <path d="M 85 90 L 105 80 L 100 95 L 85 105 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" strokeLinejoin="round" />
                                <circle cx="95" cy="87" r="2" fill="#fff" />
                                {/* Dragon Tail */}
                                <path d="M 10 90 L -5 70 L 0 95 L 15 105 Z" fill="#10b981" stroke="#047857" strokeWidth="2" strokeLinejoin="round" />
                                {/* Scales pattern */}
                                <path d="M 25 100 Q 30 105 35 100 M 45 100 Q 50 105 55 100 M 65 100 Q 70 105 75 100" fill="none" stroke="#fcd34d" strokeWidth="1" />
                                {/* Drum in middle */}
                                <rect x="40" y="70" width="20" height="20" fill="#fcd34d" stroke="#b45309" strokeWidth="2" />
                                {/* Drumsticks */}
                                <line x1="35" y1="65" x2="45" y2="75" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                                <line x1="65" y1="65" x2="55" y2="75" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_cream_rack':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="40" cy="130" rx="35" ry="6" fill="#e2e8f0" opacity="0.5" />
                                {/* Shelf Frame (Cream color, curved) */}
                                <path d="M 15 130 L 15 30 Q 40 10 65 30 L 65 130" fill="none" stroke="#fdf4ff" strokeWidth="6" strokeLinecap="round" />
                                <path d="M 15 130 L 15 30 Q 40 10 65 30 L 65 130" fill="none" stroke="#fbcfe8" strokeWidth="1" strokeLinecap="round" />
                                {/* Shelves */}
                                <line x1="15" y1="60" x2="65" y2="60" stroke="#fdf4ff" strokeWidth="4" />
                                <line x1="15" y1="95" x2="65" y2="95" stroke="#fdf4ff" strokeWidth="4" />
                                {/* Items: Perfume bottle, small plant */}
                                <rect x="25" y="40" width="10" height="15" fill="#fbcfe8" rx="2" />
                                <circle cx="30" cy="35" r="4" fill="#f472b6" />
                                <rect x="45" y="80" width="12" height="10" fill="#cbd5e1" rx="1" />
                                <circle cx="51" cy="70" r="6" fill="#86efac" />
                                {/* Stack of books */}
                                <rect x="22" y="115" width="20" height="5" fill="#60a5fa" rx="1" />
                                <rect x="24" y="110" width="18" height="5" fill="#a78bfa" rx="1" />
                                <rect x="23" y="105" width="19" height="5" fill="#f472b6" rx="1" />
                            </g>
                        );
                    case 'orn_coffee_machine':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="6" fill="#1e293b" opacity="0.3" />
                                {/* Machine Body */}
                                <path d="M 15 120 L 55 120 L 60 40 L 10 40 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
                                {/* Machine Details (Black parts) */}
                                <rect x="20" y="50" width="30" height="20" fill="#1e293b" rx="2" />
                                <rect x="15" y="110" width="40" height="10" fill="#1e293b" />
                                {/* Drip area */}
                                <rect x="25" y="70" width="20" height="35" fill="#cbd5e1" />
                                <rect x="30" y="70" width="10" height="5" fill="#475569" />
                                {/* Coffee Pot */}
                                <path d="M 28 105 C 25 85, 45 85, 42 105 Z" fill="#94a3b8" opacity="0.5" stroke="#64748b" strokeWidth="1" />
                                {/* Coffee liquid */}
                                <path d="M 28 105 C 28 95, 42 95, 42 105 Z" fill="#451a03" />
                                {/* Dial/Buttons */}
                                <circle cx="35" cy="60" r="4" fill="#38bdf8" />
                                {/* Aroma */}
                                <path d="M 35 35 Q 25 20 40 5" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                                <path d="M 45 30 Q 55 15 45 0" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_blue_porcelain':
                        return (
                            <g transform="translate(20, -10)">
                                <ellipse cx="30" cy="140" rx="25" ry="6" fill="#0f172a" opacity="0.2" />
                                {/* Porcelain Vase */}
                                <path d="M 20 140 C -10 90, 70 90, 40 140 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                <rect x="25" y="80" width="10" height="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                {/* Blue and White Patterns */}
                                <path d="M 15 110 C 20 100, 40 100, 45 110" fill="none" stroke="#1d4ed8" strokeWidth="2" />
                                <path d="M 10 120 C 30 110, 30 130, 50 120" fill="none" stroke="#1d4ed8" strokeWidth="1" />
                                {/* Bamboo branches sticking out */}
                                <path d="M 30 80 Q 20 40 10 10" fill="none" stroke="#16a34a" strokeWidth="2" />
                                <path d="M 30 80 Q 50 30 60 20" fill="none" stroke="#16a34a" strokeWidth="2" />
                                {/* Bamboo leaves */}
                                <path d="M 15 30 Q 5 25 15 20 Z" fill="#22c55e" />
                                <path d="M 20 50 Q 10 40 25 45 Z" fill="#22c55e" />
                                <path d="M 45 40 Q 60 30 50 25 Z" fill="#22c55e" />
                            </g>
                        );
                    case 'orn_fruit_scent':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="25" ry="6" fill="#9a3412" opacity="0.2" />
                                {/* Base */}
                                <ellipse cx="30" cy="105" rx="22" ry="5" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
                                {/* Glass Dome with Fruit Base */}
                                <path d="M 10 105 C 10 40, 50 40, 50 105 Z" fill="#ffedd5" opacity="0.6" stroke="#fdba74" strokeWidth="2" />
                                {/* Orange slices */}
                                <circle cx="30" cy="90" r="12" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                                <circle cx="30" cy="90" r="10" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3,2" />
                                <circle cx="20" cy="80" r="8" fill="#eab308" />
                                <circle cx="40" cy="85" r="9" fill="#84cc16" />
                                {/* Diffuser sticks */}
                                <line x1="30" y1="75" x2="20" y2="20" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                <line x1="30" y1="75" x2="35" y2="15" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                <line x1="30" y1="75" x2="50" y2="25" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                {/* Scent waves */}
                                <path d="M 20 10 Q 30 -5 15 -15" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_snow_fan':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="6" fill="#0f172a" opacity="0.3" />
                                {/* Wooden Stand */}
                                <path d="M 25 120 L 45 120 L 40 100 L 30 100 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                {/* Fan Stick */}
                                <rect x="33" y="60" width="4" height="40" fill="#92400e" />
                                {/* Fan Face (Round/Oval shape) */}
                                <ellipse cx="35" cy="50" rx="25" ry="35" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                                {/* Snow / Canglan Mountains Pattern */}
                                <path d="M 15 60 Q 25 40 35 60 Q 45 40 55 55 L 55 80 L 15 80 Z" fill="#bae6fd" />
                                <path d="M 20 70 Q 30 50 40 65 Q 45 55 50 65 L 50 80 L 20 80 Z" fill="#38bdf8" />
                                {/* Falling Snow */}
                                <circle cx="25" cy="30" r="1.5" fill="#fff" />
                                <circle cx="40" cy="25" r="1" fill="#fff" />
                                <circle cx="45" cy="40" r="2" fill="#fff" />
                                {/* Tassel */}
                                <path d="M 35 95 L 30 115 M 35 95 L 35 120 M 35 95 L 40 115" stroke="#ef4444" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_beach_aroma':
                        return (
                            <g transform="translate(10, 20)">
                                <ellipse cx="40" cy="110" rx="35" ry="8" fill="#1e3a8a" opacity="0.2" />
                                {/* Sand Base */}
                                <ellipse cx="40" cy="105" rx="30" ry="6" fill="#fde047" stroke="#eab308" strokeWidth="1" />
                                {/* Coconut Drink / Diffuser Base */}
                                <circle cx="40" cy="85" r="18" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                {/* Drink Top */}
                                <ellipse cx="40" cy="75" rx="14" ry="4" fill="#fff" />
                                {/* Umbrella */}
                                <path d="M 45 75 L 60 50 L 30 50 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                                <line x1="45" y1="50" x2="45" y2="75" stroke="#fef08a" strokeWidth="1" />
                                {/* Palm Leaf */}
                                <path d="M 30 75 Q 10 50 5 70" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
                                <path d="M 30 75 Q 15 60 10 85" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
                                {/* Starfish */}
                                <polygon points="20,105 23,100 27,105 24,108 25,112 20,109 15,112 16,108 13,105" fill="#f43f5e" />
                                {/* Aroma Smoke */}
                                <path d="M 40 60 Q 50 40 35 20" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_baseball_corner':
                        return (
                            <g transform="translate(10, 10)">
                                <ellipse cx="40" cy="120" rx="35" ry="8" fill="#0f172a" opacity="0.3" />
                                {/* Wooden Display Base */}
                                <rect x="15" y="110" width="50" height="8" fill="#b45309" rx="2" stroke="#78350f" strokeWidth="1" />
                                {/* Baseball Bat */}
                                <path d="M 25 110 L 65 30 L 70 35 L 30 115 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" strokeLinejoin="round" />
                                <rect x="25" y="100" width="8" height="15" fill="#1f2937" transform="rotate(-63 29 107)" />
                                {/* Baseball Glove */}
                                <path d="M 35 90 C 20 70, 60 70, 50 110 C 45 110, 30 110, 35 90 Z" fill="#92400e" stroke="#78350f" strokeWidth="2" />
                                {/* Baseball */}
                                <circle cx="45" cy="85" r="8" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                                {/* Baseball red stitches */}
                                <path d="M 40 80 Q 45 85 40 90" fill="none" stroke="#ef4444" strokeWidth="1" />
                                <path d="M 50 80 Q 45 85 50 90" fill="none" stroke="#ef4444" strokeWidth="1" />
                                {/* Cap */}
                                <path d="M 15 110 Q 15 90 35 90 L 35 110 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" />
                                <path d="M 35 105 L 45 105" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" />
                            </g>
                        );


                    case 'orn_willow_vase':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="30" cy="120" rx="20" ry="6" fill="#0f172a" opacity="0.2" />
                                {/* Elegant tall white vase */}
                                <path d="M 25 120 C 10 90, 10 70, 20 40 L 40 40 C 50 70, 50 90, 35 120 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                                <ellipse cx="30" cy="40" rx="10" ry="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                                {/* Willow Branches */}
                                <path d="M 30 40 Q 20 0 5 -10" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 30 40 Q 40 -10 60 -5" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 30 40 L 30 -20" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" />
                                {/* Leaves */}
                                <path d="M 15 20 Q 10 25 15 30 Z" fill="#a3e635" />
                                <path d="M 10 5 Q 5 10 10 15 Z" fill="#a3e635" />
                                <path d="M 45 15 Q 50 20 45 25 Z" fill="#a3e635" />
                                <path d="M 50 5 Q 55 10 50 15 Z" fill="#a3e635" />
                                <path d="M 30 0 Q 25 5 30 10 Z" fill="#a3e635" />
                            </g>
                        );
                    case 'orn_vinyl_player':
                        return (
                            <g transform="translate(10, 20)">
                                <ellipse cx="45" cy="110" rx="40" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Record Player Base */}
                                <path d="M 15 100 L 75 100 L 80 110 L 10 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <path d="M 20 90 L 70 90 L 75 100 L 15 100 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                                {/* Vinyl Record */}
                                <ellipse cx="40" cy="95" rx="20" ry="6" fill="#1f2937" stroke="#111827" strokeWidth="1" />
                                <ellipse cx="40" cy="95" rx="15" ry="4" fill="none" stroke="#374151" strokeWidth="1" />
                                <ellipse cx="40" cy="95" rx="6" ry="2" fill="#ef4444" />
                                {/* Tonearm */}
                                <path d="M 65 92 Q 65 85 55 92 L 45 95" fill="none" stroke="#d4d4d8" strokeWidth="2" />
                                <circle cx="65" cy="92" r="3" fill="#a1a1aa" />
                                {/* Controls */}
                                <circle cx="70" cy="97" r="2" fill="#d4d4d8" />
                                <circle cx="65" cy="98" r="1.5" fill="#d4d4d8" />
                                {/* Music Notes */}
                                <path d="M 30 75 L 30 65 L 40 60 L 40 70 M 30 65 L 30 75 Q 25 75 25 80 Q 30 85 30 75 M 40 60 L 40 70 Q 35 70 35 75 Q 40 80 40 70" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_floral_candle':
                        return (
                            <g transform="translate(25, 10)">
                                <ellipse cx="25" cy="120" rx="20" ry="6" fill="#9d174d" opacity="0.2" />
                                {/* Glass/Crystal Base */}
                                <path d="M 15 120 C 5 100, 45 100, 35 120 Z" fill="#fbcfe8" opacity="0.8" stroke="#f472b6" strokeWidth="2" />
                                {/* Candle */}
                                <rect x="20" y="60" width="10" height="45" fill="#fef08a" rx="2" />
                                {/* Flowers around candle */}
                                <circle cx="15" cy="100" r="8" fill="#f43f5e" />
                                <circle cx="35" cy="105" r="7" fill="#fbbf24" />
                                <circle cx="25" cy="110" r="9" fill="#e11d48" />
                                {/* Leaves */}
                                <path d="M 15 100 Q 5 95 10 85" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 35 105 Q 45 95 40 85" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                                {/* Flame */}
                                <path d="M 25 60 Q 20 45 25 40 Q 30 45 25 60" fill="#f97316" />
                                <path d="M 25 55 Q 23 48 25 45 Q 27 48 25 55" fill="#fef08a" />
                            </g>
                        );
                    case 'orn_chibi_noodles':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="25" ry="6" fill="#7f1d1d" opacity="0.3" />
                                {/* Bowl */}
                                <path d="M 10 90 C 10 120, 50 120, 50 90 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                                {/* Noodles pattern on bowl */}
                                <path d="M 15 100 Q 30 110 45 100" fill="none" stroke="#fca5a5" strokeWidth="1" />
                                {/* Noodles heap */}
                                <path d="M 15 90 C 15 70, 45 70, 45 90 Z" fill="#fde047" stroke="#eab308" strokeWidth="2" />
                                {/* Long noodle lifted up */}
                                <path d="M 30 75 Q 20 40 35 30 Q 50 40 40 75" fill="none" stroke="#fef08a" strokeWidth="3" />
                                {/* Chopsticks */}
                                <line x1="45" y1="20" x2="25" y2="80" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                                <line x1="50" y1="25" x2="30" y2="85" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                                {/* Fried Egg */}
                                <circle cx="25" cy="85" r="8" fill="#fff" />
                                <circle cx="25" cy="85" r="4" fill="#f59e0b" />
                                {/* Green onions */}
                                <circle cx="40" cy="85" r="2" fill="#22c55e" />
                                <circle cx="35" cy="82" r="2" fill="#22c55e" />
                                <circle cx="42" cy="80" r="2" fill="#22c55e" />
                            </g>
                        );
                    case 'orn_pipa':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="25" ry="6" fill="#451a03" opacity="0.3" />
                                {/* Display Stand */}
                                <rect x="25" y="125" width="20" height="5" fill="#78350f" rx="1" />
                                <rect x="30" y="100" width="10" height="25" fill="#92400e" />
                                {/* Pipa Body */}
                                <path d="M 35 110 C 15 110, 20 60, 35 50 C 50 60, 55 110, 35 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" transform="rotate(-15 35 80)" />
                                {/* Pipa Neck */}
                                <rect x="32" y="20" width="6" height="35" fill="#92400e" stroke="#78350f" strokeWidth="1" transform="rotate(-15 35 80)" />
                                {/* Pipa Head */}
                                <path d="M 30 10 L 40 10 L 45 20 L 25 20 Z" fill="#78350f" transform="rotate(-15 35 80)" />
                                {/* Tuning Pegs */}
                                <rect x="25" y="12" width="5" height="2" fill="#fde047" transform="rotate(-15 35 80)" />
                                <rect x="40" y="15" width="5" height="2" fill="#fde047" transform="rotate(-15 35 80)" />
                                {/* Silk/Strings */}
                                <line x1="33" y1="20" x2="33" y2="100" stroke="#fcd34d" strokeWidth="0.5" transform="rotate(-15 35 80)" />
                                <line x1="35" y1="20" x2="35" y2="100" stroke="#fcd34d" strokeWidth="0.5" transform="rotate(-15 35 80)" />
                                <line x1="37" y1="20" x2="37" y2="100" stroke="#fcd34d" strokeWidth="0.5" transform="rotate(-15 35 80)" />
                                {/* "Half-Hidden" veil or flower detail */}
                                <path d="M 20 80 Q 40 70 50 90 Q 30 100 20 80 Z" fill="#f472b6" opacity="0.6" stroke="#db2777" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_unicorn':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#1e1b4b" opacity="0.2" />
                                {/* Base rock/grass */}
                                <path d="M 10 120 C 10 100, 60 100, 60 120 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
                                {/* Unicorn Body */}
                                <path d="M 20 90 C 20 70, 50 70, 50 90 C 50 110, 45 115, 35 115 C 25 115, 20 110, 20 90 Z" fill="#fdf4ff" stroke="#e879f9" strokeWidth="2" />
                                {/* Head */}
                                <circle cx="45" cy="70" r="12" fill="#fdf4ff" stroke="#e879f9" strokeWidth="2" />
                                <path d="M 45 70 L 58 75 L 55 82 L 45 80 Z" fill="#fdf4ff" stroke="#e879f9" strokeWidth="2" />
                                {/* Eye */}
                                <path d="M 47 72 Q 50 75 52 72" fill="none" stroke="#831843" strokeWidth="1.5" />
                                {/* Horn */}
                                <polygon points="45,58 48,58 55,40" fill="#fde047" stroke="#eab308" strokeWidth="1" />
                                {/* Mane & Tail (Glowing blue/purple) */}
                                <path d="M 35 60 Q 25 70 30 80" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 38 65 Q 28 75 33 85" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 22 95 Q 10 100 15 110" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
                                {/* Sparkles */}
                                <circle cx="15" cy="60" r="2" fill="#fef08a" />
                                <circle cx="65" cy="50" r="3" fill="#fef08a" />
                                <circle cx="50" cy="35" r="2" fill="#fef08a" />
                            </g>
                        );
                    case 'orn_picnic_basket':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Basket Body */}
                                <path d="M 15 120 L 55 120 L 60 80 L 10 80 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                                {/* Basket Weave */}
                                <line x1="20" y1="80" x2="25" y2="120" stroke="#b45309" strokeWidth="1" />
                                <line x1="30" y1="80" x2="35" y2="120" stroke="#b45309" strokeWidth="1" />
                                <line x1="40" y1="80" x2="45" y2="120" stroke="#b45309" strokeWidth="1" />
                                <line x1="50" y1="80" x2="55" y2="120" stroke="#b45309" strokeWidth="1" />
                                <line x1="12" y1="90" x2="58" y2="90" stroke="#b45309" strokeWidth="1" />
                                <line x1="14" y1="100" x2="56" y2="100" stroke="#b45309" strokeWidth="1" />
                                <line x1="16" y1="110" x2="54" y2="110" stroke="#b45309" strokeWidth="1" />
                                {/* Picnic Cloth (Red/White checkered) */}
                                <path d="M 10 80 L 40 80 L 30 100 L 5 95 Z" fill="#ef4444" opacity="0.9" />
                                <path d="M 15 80 L 20 100 M 25 80 L 30 100 M 35 80 L 40 100" stroke="#fff" strokeWidth="2" />
                                <path d="M 10 85 L 35 85 M 8 90 L 33 90 M 6 95 L 30 95" stroke="#fff" strokeWidth="2" />
                                {/* Items sticking out (Baguette, Apple, Wine bottle) */}
                                <path d="M 40 80 L 55 50 Q 60 55 45 80 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="1" />
                                <rect x="35" y="80" width="8" height="3" fill="#d97706" />
                                <circle cx="35" cy="75" r="5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                                <path d="M 25 80 L 20 40 L 28 40 L 30 80 Z" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
                                {/* Basket Handle */}
                                <path d="M 15 80 C 15 30, 55 30, 55 80" fill="none" stroke="#d97706" strokeWidth="4" />
                                <path d="M 15 80 C 15 30, 55 30, 55 80" fill="none" stroke="#b45309" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_grain_barn':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Base */}
                                <rect x="10" y="110" width="50" height="10" fill="#78350f" rx="2" />
                                {/* Barn Body */}
                                <rect x="15" y="60" width="40" height="50" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="2" />
                                {/* Barn Door */}
                                <path d="M 30 110 L 30 80 C 30 75, 40 75, 40 80 L 40 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                {/* Barn Roof */}
                                <path d="M 10 60 L 35 30 L 60 60 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" strokeLinejoin="round" />
                                {/* Grain / Wheat coming out */}
                                <path d="M 15 110 Q 5 100 0 115" fill="none" stroke="#f59e0b" strokeWidth="2" />
                                <path d="M 55 110 Q 65 100 70 115" fill="none" stroke="#f59e0b" strokeWidth="2" />
                                {/* Red lantern hanging */}
                                <circle cx="35" cy="50" r="4" fill="#ef4444" />
                                <line x1="35" y1="40" x2="35" y2="46" stroke="#1f2937" strokeWidth="1" />
                                <line x1="35" y1="54" x2="35" y2="58" stroke="#fcd34d" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_panda_ac':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="25" cy="120" rx="20" ry="6" fill="#1e293b" opacity="0.3" />
                                {/* Standing AC Unit */}
                                <rect x="15" y="20" width="20" height="100" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="2" />
                                {/* AC Vents */}
                                <rect x="18" y="30" width="14" height="4" fill="#334155" />
                                <rect x="18" y="36" width="14" height="4" fill="#334155" />
                                <rect x="18" y="42" width="14" height="4" fill="#334155" />
                                {/* Panda Decoration on AC */}
                                <circle cx="25" cy="80" r="8" fill="#1f2937" />
                                <circle cx="25" cy="80" r="6" fill="#fff" />
                                <circle cx="22" cy="78" r="2" fill="#1f2937" />
                                <circle cx="28" cy="78" r="2" fill="#1f2937" />
                                <circle cx="25" cy="82" r="1" fill="#1f2937" />
                                {/* Panda Ears */}
                                <circle cx="20" cy="74" r="2.5" fill="#1f2937" />
                                <circle cx="30" cy="74" r="2.5" fill="#1f2937" />
                                {/* Cold Air indicator */}
                                <path d="M 10 35 L -5 35" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                                <path d="M 10 40 L -10 40" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                                {/* Display Panel */}
                                <rect x="20" y="22" width="10" height="4" fill="#1f2937" />
                                <text x="25" y="25" fontSize="3" fill="#4ade80" textAnchor="middle" fontWeight="bold">26</text>
                            </g>
                        );
                    case 'orn_panda_weightlifter':
                        return (
                            <g transform="translate(15, 20)">
                                <ellipse cx="35" cy="110" rx="30" ry="6" fill="#1e293b" opacity="0.3" />
                                {/* Dumbbell/Barbell Base */}
                                <rect x="10" y="105" width="50" height="4" fill="#64748b" />
                                <circle cx="10" cy="107" r="6" fill="#334155" />
                                <circle cx="60" cy="107" r="6" fill="#334155" />
                                {/* Panda Body */}
                                <circle cx="35" cy="85" r="16" fill="#fff" stroke="#1f2937" strokeWidth="2" />
                                {/* Panda Ears */}
                                <circle cx="25" cy="75" r="5" fill="#1f2937" />
                                <circle cx="45" cy="75" r="5" fill="#1f2937" />
                                {/* Panda Eyes */}
                                <path d="M 28 82 C 25 88, 35 88, 32 82 Z" fill="#1f2937" />
                                <path d="M 42 82 C 45 88, 35 88, 38 82 Z" fill="#1f2937" />
                                <circle cx="31" cy="84" r="1" fill="#fff" />
                                <circle cx="39" cy="84" r="1" fill="#fff" />
                                {/* Straining face (Sweat and mouth) */}
                                <path d="M 32 92 Q 35 95 38 92" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                                <circle cx="45" cy="80" r="1.5" fill="#38bdf8" opacity="0.8" />
                                {/* Arms lifting Barbell overhead */}
                                <path d="M 22 90 L 15 65" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                                <path d="M 48 90 L 55 65" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                                {/* Barbell */}
                                <line x1="5" y1="65" x2="65" y2="65" stroke="#64748b" strokeWidth="2" />
                                <rect x="5" y="55" width="6" height="20" fill="#334155" rx="1" />
                                <rect x="59" y="55" width="6" height="20" fill="#334155" rx="1" />
                            </g>
                        );
                    case 'orn_coconut':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="25" cy="110" rx="20" ry="6" fill="#b45309" opacity="0.3" />
                                {/* Coconut Shell Base */}
                                <path d="M 5 90 C 5 120, 45 120, 45 90 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                <path d="M 5 90 C 5 70, 45 70, 45 90 Z" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="2" />
                                {/* Coconut details */}
                                <circle cx="20" cy="100" r="2" fill="#451a03" />
                                <circle cx="30" cy="100" r="2" fill="#451a03" />
                                <circle cx="25" cy="105" r="2" fill="#451a03" />
                                {/* Open Book emerging from coconut (Academic Success) */}
                                <path d="M 15 80 L 25 90 L 35 80 L 25 70 Z" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                                <path d="M 15 75 L 25 85 L 35 75" fill="none" stroke="#fff" strokeWidth="1" />
                                {/* Little scholar hat or scroll */}
                                <rect x="20" y="50" width="10" height="25" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
                                <rect x="18" y="55" width="14" height="2" fill="#ef4444" />
                                {/* "100" Score floating */}
                                <text x="25" y="45" fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="bold">100</text>
                            </g>
                        );
                    case 'orn_floating_stars':
                        return (
                            <g transform="translate(10, 10)">
                                <ellipse cx="40" cy="120" rx="30" ry="6" fill="#1e1b4b" opacity="0.4" />
                                {/* Floating Galaxy Base */}
                                <path d="M 20 120 C 10 100, 70 100, 60 120 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="2" />
                                {/* Rings */}
                                <ellipse cx="40" cy="80" rx="35" ry="10" fill="none" stroke="#c084fc" strokeWidth="2" transform="rotate(-15 40 80)" />
                                <ellipse cx="40" cy="80" rx="25" ry="8" fill="none" stroke="#60a5fa" strokeWidth="1.5" transform="rotate(25 40 80)" />
                                {/* Planets/Stars */}
                                <circle cx="40" cy="80" r="12" fill="#fcd34d" />
                                <circle cx="15" cy="70" r="4" fill="#a78bfa" />
                                <circle cx="65" cy="90" r="6" fill="#38bdf8" />
                                {/* Sparkles */}
                                <circle cx="20" cy="40" r="2" fill="#fff" />
                                <circle cx="50" cy="30" r="1.5" fill="#fff" />
                                <circle cx="60" cy="50" r="2.5" fill="#fff" />
                                <polygon points="30,20 32,15 34,20 39,22 34,24 32,29 30,24 25,22" fill="#fef08a" />
                            </g>
                        );
                    case 'orn_lucky_doll':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="20" ry="6" fill="#7f1d1d" opacity="0.2" />
                                {/* Sitting Cushion */}
                                <path d="M 10 110 C 10 100, 50 100, 50 110 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                                {/* Doll Body */}
                                <path d="M 15 105 C 15 75, 45 75, 45 105 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                                {/* White Face */}
                                <circle cx="30" cy="75" r="15" fill="#fff" stroke="#fca5a5" strokeWidth="1" />
                                {/* Face details */}
                                <path d="M 22 75 Q 25 72 28 75" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                                <path d="M 32 75 Q 35 72 38 75" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                                {/* Red cheeks */}
                                <circle cx="20" cy="78" r="2" fill="#ef4444" />
                                <circle cx="40" cy="78" r="2" fill="#ef4444" />
                                {/* Smile */}
                                <path d="M 28 82 Q 30 85 32 82" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                                {/* Belly character "福" or "Lucky" motif */}
                                <circle cx="30" cy="95" r="6" fill="#fff" />
                                <text x="30" y="98" fontSize="6" fill="#ef4444" textAnchor="middle" fontWeight="bold">幸</text>
                            </g>
                        );
                    case 'orn_vinyl':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="6" fill="#1e293b" opacity="0.3" />
                                {/* Retro Record Player Box */}
                                <path d="M 15 120 L 55 120 L 60 70 L 10 70 Z" fill="#84cc16" stroke="#4d7c0f" strokeWidth="2" strokeLinejoin="round" />
                                {/* Front details */}
                                <circle cx="25" cy="95" r="10" fill="#fff" stroke="#d4d4d8" strokeWidth="1" />
                                <circle cx="45" cy="95" r="4" fill="#3f6212" />
                                <rect x="15" y="110" width="40" height="4" fill="#fef08a" />
                                {/* Horn / Gramophone Trumpet */}
                                <path d="M 40 70 C 45 40, 70 30, 80 40 C 90 50, 70 60, 45 70 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                                <ellipse cx="75" cy="45" rx="10" ry="15" fill="#fef3c7" stroke="#d97706" strokeWidth="2" transform="rotate(-30 75 45)" />
                                {/* Music Notes popping out */}
                                <path d="M 70 20 L 70 10 L 80 5 L 80 15 M 70 10 L 70 20 Q 65 20 65 25 Q 70 30 70 20 M 80 5 L 80 15 Q 75 15 75 20 Q 80 25 80 15" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_worry_free_fan':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="25" cy="120" rx="20" ry="6" fill="#0f172a" opacity="0.3" />
                                {/* Stand */}
                                <path d="M 15 120 L 35 120 L 30 110 L 20 110 Z" fill="#1e293b" />
                                {/* Fan Stick */}
                                <rect x="23" y="40" width="4" height="70" fill="#fcd34d" />
                                {/* Lacquer Fan Shape (Blue/Green gradients) */}
                                <path d="M 5 60 C 5 20, 45 20, 45 60 C 45 70, 25 80, 5 60 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                                <path d="M 10 55 C 15 30, 35 30, 40 55 C 35 60, 15 60, 10 55 Z" fill="#a78bfa" opacity="0.6" />
                                {/* Character for "Worry-Free" (无忧) */}
                                <text x="25" y="55" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="bold">无忧</text>
                            </g>
                        );
                    case 'orn_ashore_fan':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="25" cy="120" rx="20" ry="6" fill="#0f172a" opacity="0.3" />
                                {/* Stand */}
                                <path d="M 15 120 L 35 120 L 30 110 L 20 110 Z" fill="#1e293b" />
                                {/* Fan Stick */}
                                <rect x="23" y="40" width="4" height="70" fill="#fca5a5" />
                                {/* Lacquer Fan Shape (Red/Orange gradients - "Going Ashore / Success") */}
                                <path d="M 5 60 C 5 20, 45 20, 45 60 C 45 70, 25 80, 5 60 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                                <path d="M 10 55 C 15 30, 35 30, 40 55 C 35 60, 15 60, 10 55 Z" fill="#fde047" opacity="0.8" />
                                {/* Character for "Ashore" (上岸) */}
                                <text x="25" y="55" fontSize="10" fill="#b91c1c" textAnchor="middle" fontWeight="bold">上岸</text>
                            </g>
                        );


                    case 'orn_fortune_tree':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="30" ry="8" fill="#7f1d1d" opacity="0.3" />
                                {/* Pot Base */}
                                <path d="M 20 130 L 50 130 L 55 110 L 15 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <rect x="15" y="105" width="40" height="5" fill="#fde047" rx="2" />
                                {/* Tree Trunk */}
                                <path d="M 32 105 C 32 70, 30 50, 35 40" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                                <path d="M 32 80 C 40 70, 45 60, 50 55" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 32 60 C 20 50, 15 40, 20 30" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                {/* Gold Coins / Leaves */}
                                <circle cx="35" cy="40" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                <circle cx="50" cy="55" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                <circle cx="20" cy="30" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                <circle cx="30" cy="20" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                <circle cx="45" cy="30" r="12" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                <circle cx="25" cy="50" r="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                                {/* Square holes in coins */}
                                <rect x="33" y="38" width="4" height="4" fill="#ca8a04" />
                                <rect x="43" y="28" width="4" height="4" fill="#ca8a04" />
                                {/* Red ribbons hanging */}
                                <path d="M 45 35 Q 50 45 45 50" fill="none" stroke="#ef4444" strokeWidth="2" />
                                <path d="M 25 55 Q 20 65 25 70" fill="none" stroke="#ef4444" strokeWidth="2" />
                            </g>
                        );
                    case 'orn_jade_rabbit':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#1e1b4b" opacity="0.3" />
                                {/* Cloud/Moon Base */}
                                <path d="M 10 120 C 10 100, 30 90, 35 105 C 40 90, 60 100, 60 120 Z" fill="#e0e7ff" opacity="0.8" stroke="#a5b4fc" strokeWidth="2" />
                                {/* Moon Backdrop */}
                                <circle cx="35" cy="65" r="25" fill="#fef08a" opacity="0.6" stroke="#fde047" strokeWidth="2" />
                                {/* Jade Rabbit */}
                                <circle cx="35" cy="85" r="12" fill="#fff" stroke="#fbcfe8" strokeWidth="2" />
                                <circle cx="35" cy="70" r="10" fill="#fff" stroke="#fbcfe8" strokeWidth="2" />
                                {/* Rabbit Ears */}
                                <path d="M 30 65 Q 25 50 30 45 Q 35 50 35 65 Z" fill="#fff" stroke="#fbcfe8" strokeWidth="1" />
                                <path d="M 40 65 Q 45 50 40 45 Q 35 50 35 65 Z" fill="#fff" stroke="#fbcfe8" strokeWidth="1" />
                                {/* Face */}
                                <circle cx="32" cy="70" r="1.5" fill="#1f2937" />
                                <circle cx="38" cy="70" r="1.5" fill="#1f2937" />
                                <path d="M 35 72 Q 35 74 35 73" stroke="#fca5a5" strokeWidth="1" />
                                {/* Mortar and Pestle */}
                                <rect x="25" y="85" width="10" height="8" fill="#d1d5db" rx="1" />
                                <line x1="32" y1="80" x2="28" y2="90" stroke="#78350f" strokeWidth="2" />
                            </g>
                        );
                    case 'orn_star_lamp':
                        return (
                            <g transform="translate(20, 10)">
                                <ellipse cx="30" cy="120" rx="25" ry="6" fill="#1e3a8a" opacity="0.3" />
                                {/* Lamp Stand */}
                                <path d="M 15 120 L 45 120 L 40 110 L 20 110 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                <rect x="28" y="40" width="4" height="70" fill="#92400e" />
                                {/* Star Shape */}
                                <polygon points="30,10 35,25 50,25 38,35 42,50 30,40 18,50 22,35 10,25 25,25" fill="#fef08a" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
                                {/* Inner Star Glow */}
                                <polygon points="30,15 34,26 45,26 36,33 39,44 30,37 21,44 24,33 15,26 26,26" fill="#fdf08a" opacity="0.8" />
                                <polygon points="30,20 33,27 40,27 34,31 36,38 30,34 24,38 26,31 20,27 27,27" fill="#fff" />
                                {/* Sparkles */}
                                <circle cx="10" cy="10" r="2" fill="#fff" />
                                <circle cx="50" cy="15" r="1.5" fill="#fff" />
                                <circle cx="45" cy="55" r="2.5" fill="#fff" />
                            </g>
                        );
                    case 'orn_globe':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#475569" opacity="0.3" />
                                {/* Stand Base */}
                                <path d="M 20 120 L 50 120 L 45 105 L 25 105 Z" fill="#9ca3af" stroke="#6b7280" strokeWidth="2" />
                                <rect x="33" y="90" width="4" height="15" fill="#9ca3af" />
                                {/* Globe Axis Arc */}
                                <path d="M 25 100 A 35 35 0 0 1 65 30" fill="none" stroke="#9ca3af" strokeWidth="4" />
                                {/* Globe Sphere */}
                                <circle cx="35" cy="60" r="25" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
                                {/* Continents */}
                                <path d="M 20 50 Q 30 40 40 45 Q 50 40 45 60 Q 35 70 20 50 Z" fill="#22c55e" />
                                <path d="M 30 75 Q 40 85 55 70 Q 55 55 45 65 Z" fill="#22c55e" />
                                {/* Grid lines */}
                                <ellipse cx="35" cy="60" rx="25" ry="5" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.5" />
                                <ellipse cx="35" cy="60" rx="5" ry="25" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.5" />
                            </g>
                        );
                    case 'orn_ghost_castle':
                        return (
                            <g transform="translate(15, 0)">
                                <ellipse cx="35" cy="130" rx="30" ry="8" fill="#1e1b4b" opacity="0.4" />
                                {/* Base Hill */}
                                <path d="M 10 130 C 10 110, 60 110, 60 130 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="2" />
                                {/* Castle Main Building */}
                                <rect x="25" y="80" width="20" height="40" fill="#4c1d95" stroke="#312e81" strokeWidth="2" />
                                <rect x="15" y="90" width="10" height="30" fill="#4c1d95" stroke="#312e81" strokeWidth="2" />
                                <rect x="45" y="70" width="10" height="50" fill="#4c1d95" stroke="#312e81" strokeWidth="2" />
                                {/* Roofs */}
                                <polygon points="15,90 20,70 25,90" fill="#1e1b4b" />
                                <polygon points="25,80 35,50 45,80" fill="#1e1b4b" />
                                <polygon points="45,70 50,40 55,70" fill="#1e1b4b" />
                                {/* Windows */}
                                <rect x="32" y="90" width="6" height="10" fill="#fde047" rx="1" />
                                <rect x="48" y="85" width="4" height="6" fill="#fde047" rx="1" />
                                <rect x="48" y="100" width="4" height="6" fill="#fde047" rx="1" />
                                {/* Ghosts flying */}
                                <path d="M 10 50 C 15 45, 20 45, 15 55 Z" fill="#f8fafc" opacity="0.8" />
                                <path d="M 60 30 C 65 20, 70 25, 65 35 Z" fill="#f8fafc" opacity="0.8" />
                                <circle cx="15" cy="50" r="1" fill="#1e1b4b" />
                                <circle cx="65" cy="28" r="1" fill="#1e1b4b" />
                                {/* Moon */}
                                <circle cx="20" cy="30" r="8" fill="#fef08a" opacity="0.6" />
                            </g>
                        );
                    case 'orn_ancient_incense':
                        return (
                            <g transform="translate(20, 20)">
                                <ellipse cx="30" cy="110" rx="25" ry="6" fill="#1e293b" opacity="0.3" />
                                {/* Bronze Incense Burner */}
                                <path d="M 15 100 C 10 80, 50 80, 45 100 C 45 110, 15 110, 15 100 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                                {/* Legs */}
                                <path d="M 20 100 L 15 110" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 40 100 L 45 110" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 30 100 L 30 112" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                {/* Handles */}
                                <path d="M 15 85 C 5 80, 5 95, 15 90" fill="none" stroke="#78350f" strokeWidth="2" />
                                <path d="M 45 85 C 55 80, 55 95, 45 90" fill="none" stroke="#78350f" strokeWidth="2" />
                                {/* Lid */}
                                <path d="M 18 80 C 25 65, 35 65, 42 80 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                                {/* Top knob */}
                                <circle cx="30" cy="65" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                                {/* Smoke rising */}
                                <path d="M 30 60 Q 20 40 35 20 Q 50 0 30 -15" fill="none" stroke="#f1f5f9" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
                                <path d="M 32 50 Q 40 30 25 10 Q 15 -5 28 -10" fill="none" stroke="#f1f5f9" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_retro_speaker':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#1e293b" opacity="0.3" />
                                {/* Speaker Box */}
                                <rect x="15" y="50" width="40" height="70" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="4" />
                                {/* Front Grill */}
                                <rect x="20" y="55" width="30" height="40" fill="#cbd5e1" rx="2" />
                                {/* Speaker Cones */}
                                <circle cx="35" cy="70" r="10" fill="#334155" />
                                <circle cx="35" cy="70" r="4" fill="#1e293b" />
                                <circle cx="35" cy="85" r="6" fill="#334155" />
                                {/* Branding/Buttons */}
                                <rect x="25" y="100" width="20" height="5" fill="#fcd34d" rx="1" />
                                <circle cx="25" cy="110" r="2" fill="#94a3b8" />
                                <circle cx="35" cy="110" r="2" fill="#94a3b8" />
                                <circle cx="45" cy="110" r="2" fill="#94a3b8" />
                                {/* Music Waves */}
                                <path d="M 5 60 Q 0 70 5 80" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 65 60 Q 70 70 65 80" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                                <path d="M -5 55 Q -15 70 -5 85" fill="none" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
                                <path d="M 75 55 Q 85 70 75 85" fill="none" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_fortune_flowers':
                        return (
                            <g transform="translate(20, 0)">
                                <ellipse cx="30" cy="130" rx="25" ry="6" fill="#7f1d1d" opacity="0.2" />
                                {/* Golden Pot */}
                                <path d="M 15 130 C 5 110, 55 110, 45 130 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                                <rect x="18" y="110" width="24" height="6" fill="#f59e0b" rx="1" />
                                <text x="30" y="125" fontSize="10" fill="#991b1b" textAnchor="middle" fontWeight="bold">满</text>
                                {/* Branches */}
                                <path d="M 30 110 Q 20 60 10 30" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 30 110 Q 40 70 50 40" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                                {/* Red Berries/Flowers (Winter Jasmine/Ilex) */}
                                <circle cx="10" cy="30" r="4" fill="#ef4444" />
                                <circle cx="15" cy="40" r="3" fill="#ef4444" />
                                <circle cx="20" cy="55" r="4" fill="#ef4444" />
                                <circle cx="25" cy="70" r="3" fill="#ef4444" />
                                <circle cx="35" cy="80" r="4" fill="#ef4444" />
                                <circle cx="45" cy="55" r="3" fill="#ef4444" />
                                <circle cx="50" cy="40" r="4" fill="#ef4444" />
                                {/* Hanging decorations (Golden coins or tags) */}
                                <rect x="15" y="45" width="6" height="10" fill="#fcd34d" rx="1" />
                                <rect x="40" y="60" width="6" height="10" fill="#fcd34d" rx="1" />
                                {/* Leaves */}
                                <path d="M 25 105 Q 15 100 10 105 Z" fill="#16a34a" />
                                <path d="M 35 105 Q 45 100 50 105 Z" fill="#16a34a" />
                            </g>
                        );


                    case 'orn_stove_tea':
                        return (
                            <g transform="translate(15, 10)">
                                <ellipse cx="35" cy="120" rx="30" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Small Stove Base */}
                                <path d="M 20 120 L 50 120 L 55 90 L 15 90 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                                <rect x="15" y="85" width="40" height="5" fill="#92400e" rx="2" />
                                {/* Glowing Coals */}
                                <circle cx="30" cy="85" r="4" fill="#ef4444" opacity="0.8" />
                                <circle cx="40" cy="85" r="5" fill="#f97316" opacity="0.9" />
                                <circle cx="35" cy="82" r="3" fill="#fde047" />
                                {/* Teapot */}
                                <path d="M 25 80 C 25 60, 45 60, 45 80 Z" fill="#3f3f46" stroke="#27272a" strokeWidth="2" />
                                <rect x="32" y="55" width="6" height="5" fill="#52525b" rx="1" />
                                <path d="M 45 70 C 55 65, 55 75, 45 75" fill="none" stroke="#27272a" strokeWidth="3" />
                                <path d="M 25 75 L 15 70" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
                                {/* Roasting items (Sweet potato / Persimmon / Peanuts) */}
                                <ellipse cx="20" cy="95" rx="6" ry="3" fill="#d97706" transform="rotate(-15 20 95)" />
                                <circle cx="50" cy="95" r="4" fill="#f97316" />
                                <circle cx="28" cy="95" r="2" fill="#d4d4d8" />
                                <circle cx="42" cy="95" r="2" fill="#d4d4d8" />
                                {/* Steam */}
                                <path d="M 15 65 Q 10 50 20 35" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
                            </g>
                        );
                    case 'orn_antique_rack':
                        return (
                            <g transform="translate(10, 0)">
                                <ellipse cx="40" cy="130" rx="35" ry="8" fill="#451a03" opacity="0.3" />
                                {/* Wooden Frame Rack */}
                                <path d="M 15 130 L 15 30 L 65 30 L 65 130" fill="none" stroke="#78350f" strokeWidth="6" strokeLinejoin="round" />
                                <path d="M 15 130 L 15 30 L 65 30 L 65 130" fill="none" stroke="#451a03" strokeWidth="1" strokeLinejoin="round" />
                                {/* Shelves */}
                                <line x1="15" y1="60" x2="45" y2="60" stroke="#78350f" strokeWidth="4" />
                                <line x1="45" y1="60" x2="45" y2="90" stroke="#78350f" strokeWidth="4" />
                                <line x1="35" y1="90" x2="65" y2="90" stroke="#78350f" strokeWidth="4" />
                                {/* Antiquities */}
                                {/* Top shelf - Vase */}
                                <path d="M 25 60 C 20 40, 40 40, 35 60 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                                <path d="M 25 50 Q 30 55 35 50" fill="none" stroke="#3b82f6" strokeWidth="1" />
                                {/* Bottom right - Scroll/Books */}
                                <rect x="45" y="80" width="15" height="10" fill="#fcd34d" rx="1" />
                                <rect x="45" y="82" width="15" height="2" fill="#ef4444" />
                                {/* Bottom left - Teacup */}
                                <path d="M 20 130 C 20 115, 30 115, 30 130 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
                            </g>
                        );
                    case 'orn_study_panda':
                        return (
                            <g transform="translate(10, 10)">
                                <ellipse cx="40" cy="120" rx="35" ry="8" fill="#1e293b" opacity="0.3" />
                                {/* Big desk/books stack */}
                                <rect x="15" y="110" width="50" height="10" fill="#3b82f6" rx="2" stroke="#1d4ed8" strokeWidth="1" />
                                <rect x="20" y="100" width="40" height="10" fill="#10b981" rx="2" stroke="#047857" strokeWidth="1" />
                                {/* Panda */}
                                <path d="M 25 100 C 25 60, 55 60, 55 100 Z" fill="#fff" stroke="#1f2937" strokeWidth="2" />
                                <circle cx="30" cy="65" r="6" fill="#1f2937" />
                                <circle cx="50" cy="65" r="6" fill="#1f2937" />
                                <ellipse cx="35" cy="80" rx="5" ry="7" fill="#1f2937" transform="rotate(30 35 80)" />
                                <ellipse cx="45" cy="80" rx="5" ry="7" fill="#1f2937" transform="rotate(-30 45 80)" />
                                <circle cx="36" cy="80" r="1.5" fill="#fff" />
                                <circle cx="44" cy="80" r="1.5" fill="#fff" />
                                <circle cx="40" cy="88" r="2" fill="#1f2937" />
                                {/* Headband "奋斗" (Strive) */}
                                <rect x="25" y="68" width="30" height="6" fill="#ef4444" />
                                <text x="40" y="73" fontSize="4" fill="#fff" textAnchor="middle" fontWeight="bold">奋 斗</text>
                                {/* Holding a pen/pencil */}
                                <path d="M 50 100 L 65 70" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 65 70 L 68 65" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="52" cy="98" r="5" fill="#1f2937" />
                            </g>
                        );
                    default:
                        return null;
                }
            })()}
        </g>
    );
}

// End of Batch 4

export function ItemPreview({ slotType, imageKey, size = 80 }: { slotType: string; imageKey: string; size?: number }) {
    if (!imageKey) return null;
    return (
        <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
            {(() => {
                switch (slotType) {
                    case 'body':
                        return (
                            <g transform="translate(60, 60) scale(0.3) translate(-150, -300)">
                                {renderOutfit(imageKey)}
                            </g>
                        );
                    case 'hair':
                        return (
                            <g transform="translate(60, 60) scale(0.35) translate(-150, -140)">
                                {renderHair(imageKey)}
                            </g>
                        );
                    case 'hat':
                        return (
                            <g transform="translate(60, 60) scale(0.4) translate(-150, -80)">
                                {renderHat(imageKey)}
                            </g>
                        );
                    case 'face':
                        return (
                            <g transform="translate(60, 60) scale(0.5) translate(-150, -115)">
                                {renderFace(imageKey)}
                            </g>
                        );
                    case 'desk_acc':
                        return (
                            <g transform="translate(60, 60) scale(0.9) translate(-80, -60) translate(10, -360)">
                                {renderDeskAcc(imageKey)}
                            </g>
                        );
                    case 'desk_ornament':
                        return (
                            <g transform="translate(60, 60) scale(0.65) translate(-55, -70) translate(-150, -380)">
                                {renderDeskOrnament(imageKey)}
                            </g>
                        );
                    case 'wall_hanging':
                        return (
                            <g>
                                <defs>
                                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ffe082" />
                                        <stop offset="50%" stopColor="#d4af37" />
                                        <stop offset="100%" stopColor="#b58900" />
                                    </linearGradient>
                                    <radialGradient id="blueLanternGrad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#e0f7fa" />
                                        <stop offset="40%" stopColor="#4dd0e1" />
                                        <stop offset="85%" stopColor="#00acc1" />
                                        <stop offset="100%" stopColor="#00838f" />
                                    </radialGradient>
                                    <radialGradient id="lanternInnerGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="30%" stopColor="#e0f7fa" />
                                        <stop offset="70%" stopColor="#00e5ff" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#006064" />
                                        <stop offset="30%" stopColor="#00acc1" />
                                        <stop offset="70%" stopColor="#00acc1" />
                                        <stop offset="100%" stopColor="#004d40" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    if (imageKey === 'wall_clock') {
                                        return (
                                            <g transform="translate(60, 60) scale(0.7) translate(-250, -250)">
                                                {renderWallHanging(imageKey)}
                                            </g>
                                        );
                                    }
                                    const yOffset = imageKey === 'wall_plum_window' || imageKey === 'wall_scenic_window' ? -180 : -100;
                                    const localY = imageKey === 'wall_plum_window' || imageKey === 'wall_scenic_window' ? 0 : -150;
                                    const scaleVal = imageKey === 'wall_plum_window' || imageKey === 'wall_scenic_window' ? 0.35 : 0.35;
                                    
                                    return (
                                        <g transform={`translate(60, 60) scale(${scaleVal}) translate(0, ${localY}) translate(-370, ${yOffset})`}>
                                            {renderWallHanging(imageKey)}
                                        </g>
                                    );
                            })()}
                        </g>
                    );
                    case 'wallpaper':
                        return (
                            <g transform="translate(4, 7) scale(0.14)">
                                {renderWallpaper(imageKey)}
                            </g>
                        );
                    case 'window':
                        return (
                            <g transform="translate(10, 15) scale(0.2) translate(-150, -100)">
                                {renderWindow(imageKey)}
                            </g>
                        );
                    case 'large_cabinet':
                        return (
                            <g transform="translate(25, 10) scale(0.18) translate(-20, -200)">
                                {renderLargeCabinet(imageKey)}
                            </g>
                        );
                    case 'whiteboard':
                        return (
                            <g transform="translate(15, 15) scale(0.4) translate(-450, -150)">
                                {renderWhiteboard(imageKey)}
                            </g>
                        );
                    case 'carpet':
                        return (
                            <g transform="translate(10, 45) scale(0.2) translate(-150, -680)">
                                {renderCarpet(imageKey)}
                            </g>
                        );
                    case 'ground_lamp':
                        return (
                            <g transform="translate(45, 10) scale(0.26) translate(-220, -380)">
                                {renderGroundLamp(imageKey)}
                            </g>
                        );
                    case 'broadcaster':
                        return (
                            <g transform="translate(35, 35) scale(0.5) translate(-360, -250)">
                                {renderBroadcaster(imageKey)}
                            </g>
                        );
                    case 'cabinet':
                        return (
                            <g transform="translate(20, 15) scale(0.3) translate(-600, -430)">
                                {renderCabinet(imageKey)}
                            </g>
                        );
                    case 'decoration_floor':
                        return (
                            <g transform="translate(35, 15) scale(0.45) translate(-500, -570)">
                                {renderDecorationFloor(imageKey)}
                            </g>
                        );
                    case 'decoration_wall':
                        return (
                            <g transform="translate(25, 25) scale(0.5) translate(-330, -100)">
                                {renderDecorationWall(imageKey)}
                            </g>
                        );
                    default:
                        return (
                            <text x="60" y="60" textAnchor="middle" fill="#ccc" fontSize="10">{imageKey}</text>
                        );
                }
            })()}
        </svg>
    );
}


function renderWallHanging(item: string) {
    if (!item) return null;

    switch (item) {
        case 'wall_clock':
            return (
                <g transform="translate(250, 250)">
                    <circle cx="0" cy="0" r="60" fill="#fff" stroke="#ffcc80" strokeWidth="10" />
                    <line x1="0" y1="0" x2="0" y2="-40" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="30" y2="20" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'wall_lantern':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="30" stroke="#8c7853" strokeWidth="2.5" />
                    <circle cx="0" cy="30" r="4" fill="none" stroke="#d4af37" strokeWidth="2" />

                    {/* Hanging Beads left & right */}
                    <line x1="-45" y1="47" x2="-45" y2="85" stroke="#aa7c11" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="-45" cy="85" r="3" fill="#8bc34a" />
                    <path d="M -45 88 L -45 100" stroke="#00acc1" strokeWidth="1.5" />

                    <line x1="45" y1="47" x2="45" y2="85" stroke="#aa7c11" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="45" cy="85" r="3" fill="#8bc34a" />
                    <path d="M 45 88 L 45 100" stroke="#00acc1" strokeWidth="1.5" />

                    {/* Crown (Roof) */}
                    <path d="M -25 55 Q 0 35 25 55 L 30 65 Q 0 50 -30 65 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <path d="M -25 55 Q -38 42 -45 45 Q -38 52 -25 55 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <path d="M 25 55 Q 38 42 45 45 Q 38 52 25 55 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <circle cx="-45" cy="45" r="2.5" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                    <circle cx="45" cy="45" r="2.5" fill="none" stroke="#d4af37" strokeWidth="1.5" />
                    <circle cx="0" cy="36" r="6" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <circle cx="0" cy="27" r="3" fill="#8bc34a" />

                    {/* Lantern Glass Core */}
                    <ellipse cx="0" cy="105" rx="25" ry="38" fill="url(#blueLanternGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <ellipse cx="0" cy="105" rx="16" ry="26" fill="url(#lanternInnerGlow)" opacity="0.8" />
                    <path d="M 0 67 C -12 75 -12 135 0 143" fill="none" stroke="#aa7c11" strokeWidth="1.5" />
                    <path d="M 0 67 C 12 75 12 135 0 143" fill="none" stroke="#aa7c11" strokeWidth="1.5" />
                    <path d="M 0 67 C -22 80 -22 130 0 143" fill="none" stroke="#aa7c11" strokeWidth="1.2" />
                    <path d="M 0 67 C 22 80 22 130 0 143" fill="none" stroke="#aa7c11" strokeWidth="1.2" />
                    <line x1="0" y1="67" x2="0" y2="143" stroke="#aa7c11" strokeWidth="1.8" />

                    {/* Bottom Cap */}
                    <path d="M -15 143 Q 0 150 15 143 L 10 155 Q 0 160 -10 155 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <circle cx="0" cy="162" r="5" fill="#8bc34a" stroke="#aa7c11" strokeWidth="1" />
                    <circle cx="0" cy="162" r="1.5" fill="#3f51b5" />

                    {/* Tassel */}
                    <path d="M -3 167 L -5 260 C -5 270, 5 270, 5 260 L 3 167 Z" fill="url(#tasselGrad)" opacity="0.9" />
                    <path d="M -3 167 L -10 260 C -10 265, -3 270, 0 270 C 3 270, 10 265, 10 260 L 3 167 Z" fill="url(#tasselGrad)" opacity="0.6" />
                    <rect x="-4" y="170" width="8" height="6" fill="#d4af37" rx="1" />
                </g>
            );
        case 'wall_elf_lamp':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="40" stroke="#78350f" strokeWidth="2.5" />
                    {/* Golden branches */}
                    <path d="M 0 40 Q 20 60 40 50 T 80 80" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
                    <path d="M 0 40 Q -15 70 -30 90 T -40 140" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
                    {/* Flower shade Lily of valley */}
                    <path d="M 35 52 C 25 52, 20 82, 35 92 C 45 92, 50 52, 35 52 Z" fill="#fff" opacity="0.9" stroke="#aa7c11" strokeWidth="1" />
                    <path d="M 35 85 Q 35 95 30 95 Q 35 95 40 95" fill="none" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="35" cy="72" r="8" fill="#fff9c4" opacity="0.8" />
                    {/* Tiny Pink Fairy sitting on branch */}
                    <circle cx="-32" cy="110" r="10" fill="#f8bbd0" stroke="#c2185b" strokeWidth="1" />
                    {/* Wings */}
                    <ellipse cx="-45" cy="105" rx="12" ry="5" fill="#e0f7fa" opacity="0.7" transform="rotate(-30 -45 105)" />
                    <ellipse cx="-20" cy="105" rx="12" ry="5" fill="#e0f7fa" opacity="0.7" transform="rotate(30 -20 105)" />
                    {/* Hair & Face */}
                    <circle cx="-32" cy="108" r="3" fill="#ffe0cc" />
                    <path d="M -37 105 Q -32 98 -27 105" fill="#f48fb1" />
                </g>
            );
        case 'wall_cowboy_chime':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="40" stroke="#78909c" strokeWidth="1.5" />
                    {/* Cowboy Hat base */}
                    <path d="M -35 60 Q 0 50 35 60 L 25 45 Q 0 35 -25 45 Z" fill="#a1887f" stroke="#5d4037" strokeWidth="2" />
                    <path d="M -45 60 C -45 55, 45 55, 45 60 C 45 68, -45 68, -45 60 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
                    {/* Threads hanging down */}
                    <line x1="-20" y1="65" x2="-20" y2="180" stroke="#78909c" strokeWidth="1" />
                    <line x1="0" y1="65" x2="0" y2="200" stroke="#78909c" strokeWidth="1" />
                    <line x1="20" y1="65" x2="20" y2="180" stroke="#78909c" strokeWidth="1" />
                    {/* Hanging stars & moon */}
                    <polygon points="-20,130 -17,120 -25,125 -15,125 -23,120" fill="#ffeb3b" />
                    <circle cx="-20" cy="180" r="4" fill="#64b5f6" />
                    
                    {/* Crescent moon in middle */}
                    <path d="M -5 120 A 15 15 0 0 0 15 140 A 12 12 0 0 1 -5 120 Z" fill="#fff59d" stroke="#fbc02d" strokeWidth="1" transform="translate(-5, 10)" />
                    <circle cx="0" cy="200" r="5" fill="#81c784" />
                    
                    <polygon points="20,130 23,120 15,125 25,125 17,120" fill="#ffeb3b" />
                    <circle cx="20" cy="180" r="4" fill="#e57373" />
                </g>
            );
        case 'wall_flower_lamp':
            return (
                <g transform="translate(370, 100)">
                    {/* Clip holding the vase */}
                    <rect x="-10" y="20" width="20" height="15" fill="#90a4ae" stroke="#455a64" strokeWidth="1.5" rx="2" />
                    {/* Glass tube vase */}
                    <rect x="-6" y="35" width="12" height="90" fill="#e0f7fa" opacity="0.5" stroke="#00acc1" strokeWidth="1.5" rx="5" />
                    {/* Glowing water inside */}
                    <rect x="-5" y="70" width="10" height="52" fill="#80deea" opacity="0.6" rx="4" />
                    {/* Morning Glory Flowers emerging */}
                    <path d="M 0 35 Q 25 10 30 -10" fill="none" stroke="#81c784" strokeWidth="3" />
                    <path d="M 0 35 Q -25 20 -30 5" fill="none" stroke="#81c784" strokeWidth="3" />
                    {/* Flower cups */}
                    <path d="M 30 -10 L 45 -25 L 35 -30 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="1" />
                    <ellipse cx="40" cy="-27" rx="8" ry="4" fill="#d1c4e9" transform="rotate(-30 40 -27)" />
                    
                    <path d="M -30 5 L -45 -10 L -40 -15 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="1" />
                    <ellipse cx="-42" cy="-12" rx="8" ry="4" fill="#d1c4e9" transform="rotate(30 -42 -12)" />
                </g>
            );
        case 'wall_lantern_string':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging top cord */}
                    <line x1="0" y1="-100" x2="0" y2="0" stroke="#b71c1c" strokeWidth="2" />
                    {/* 5 round paper lanterns colored Red, Orange, Yellow, Pink, Green */}
                    {['#f44336', '#ff9800', '#ffeb3b', '#e91e63', '#4caf50'].map((color, idx) => {
                        const y = 20 + idx * 45;
                        const chars = ['福', '吉', '囍', '春', '樂'];
                        return (
                            <g key={idx} transform={"translate(0, " + y + ")"}>
                                {/* String segment */}
                                <line x1="0" y1="-25" x2="0" y2="25" stroke="#b71c1c" strokeWidth="2" />
                                <ellipse cx="0" cy="0" rx="18" ry="15" fill={color} stroke="#333" strokeWidth="1.5" />
                                <rect x="-10" y="-17" width="20" height="3" fill="#ffd54f" />
                                <rect x="-10" y="14" width="20" height="3" fill="#ffd54f" />
                                <text x="0" y="4" fontSize="10" fontWeight="black" fill="#333" textAnchor="middle">{chars[idx]}</text>
                            </g>
                        );
                    })}
                    {/* Bottom tassel */}
                    <path d="M 0 240 L 0 275" stroke="#f44336" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="0" cy="242" r="4" fill="#ffd54f" />
                </g>
            );
        case 'wall_newyear_painting':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#b71c1c" strokeWidth="2" />
                    {/* Gold coin header */}
                    <circle cx="0" cy="20" r="14" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    <rect x="-4" y="16" width="8" height="8" fill="#fff" stroke="#aa7c11" strokeWidth="1.5" />
                    {/* Two hanging red cards */}
                    <g transform="translate(-25, 45) rotate(-5)">
                        <rect x="0" y="0" width="45" height="70" fill="#d32f2f" stroke="#ffeb3b" strokeWidth="1.5" rx="3" />
                        <text x="22.5" y="30" fontSize="14" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">新春</text>
                        <text x="22.5" y="52" fontSize="14" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">快乐</text>
                    </g>
                    <g transform="translate(15, 55) rotate(5)">
                        <rect x="-20" y="0" width="45" height="70" fill="#d32f2f" stroke="#ffeb3b" strokeWidth="1.5" rx="3" />
                        <text x="2.5" y="25" fontSize="8" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">HAPPY</text>
                        <text x="2.5" y="40" fontSize="8" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">NEW</text>
                        <text x="2.5" y="55" fontSize="8" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">YEAR</text>
                    </g>
                    {/* Year number 2026 */}
                    <rect x="-20" y="130" width="40" height="15" fill="#ffeb3b" stroke="#d32f2f" strokeWidth="1" rx="2" />
                    <text x="0" y="141" fontSize="10" fontWeight="black" fill="#d32f2f" textAnchor="middle">2026</text>
                </g>
            );
        case 'wall_owl_tapestry':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden support stick */}
                    <rect x="-50" y="20" width="100" height="6" fill="#8d6e63" rx="2" />
                    <path d="M -45 20 L 0 -20 L 45 20" fill="none" stroke="#a1887f" strokeWidth="2" />
                    {/* Owl on branch */}
                    <g transform="translate(0, 50)">
                        <ellipse cx="0" cy="0" rx="25" ry="20" fill="#8d6e63" stroke="#4e342e" strokeWidth="2" />
                        {/* Owl eyes */}
                        <circle cx="-10" cy="-5" r="8" fill="#fff" stroke="#4e342e" strokeWidth="1.5" />
                        <circle cx="-10" cy="-5" r="4" fill="#333" />
                        <circle cx="10" cy="-5" r="8" fill="#fff" stroke="#4e342e" strokeWidth="1.5" />
                        <circle cx="10" cy="-5" r="4" fill="#333" />
                        {/* Beak */}
                        <polygon points="0,-2 -4,5 4,5" fill="#ffb300" />
                        {/* Belly feathers */}
                        <path d="M -10 8 Q 0 14 10 8 M -8 11 Q 0 17 8 11" fill="none" stroke="#4e342e" strokeWidth="1.5" />
                    </g>
                    {/* Three detailed hanging feathers */}
                    {[-25, 0, 25].map((x, idx) => {
                        const colors = ['#ce93d8', '#b39ddb', '#ce93d8'];
                        return (
                            <g key={idx} transform={"translate(" + x + ", 80)"}>
                                <line x1="0" y1="0" x2="0" y2="20" stroke="#4e342e" strokeWidth="1.5" />
                                <path d="M 0 20 C -8 30, -8 60, 0 70 C 8 60, 8 30, 0 20 Z" fill={colors[idx]} stroke="#4e342e" strokeWidth="1" />
                                <line x1="0" y1="20" x2="0" y2="65" stroke="#4e342e" strokeWidth="1" />
                            </g>
                        );
                    })}
                </g>
            );
        case 'wall_palace_lantern':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="30" stroke="#aa7c11" strokeWidth="2.5" />
                    {/* Hexagonal Gold Roof */}
                    <polygon points="0,25 -35,45 -25,55 25,55 35,45" fill="url(#goldGrad)" stroke="#8c6206" strokeWidth="1.5" />
                    {/* Lantern Body (Hexagonal Warm Yellow window panes) */}
                    <polygon points="-25,55 -20,115 20,115 25,55" fill="#ffe082" stroke="url(#goldGrad)" strokeWidth="3" />
                    <line x1="-10" y1="55" x2="-8" y2="115" stroke="url(#goldGrad)" strokeWidth="1.5" />
                    <line x1="10" y1="55" x2="8" y2="115" stroke="url(#goldGrad)" strokeWidth="1.5" />
                    {/* Red paper-cut character "春" representation inside */}
                    <text x="0" y="90" fontSize="12" fill="#d32f2f" fontWeight="bold" textAnchor="middle">春</text>
                    {/* Hexagonal Base */}
                    <polygon points="-25,115 -30,123 30,123 25,115" fill="url(#goldGrad)" stroke="#8c6206" strokeWidth="1.5" />
                    {/* Long Red tassel */}
                    <line x1="0" y1="123" x2="0" y2="210" stroke="#d32f2f" strokeWidth="5.5" strokeLinecap="round" />
                    <circle cx="0" cy="128" r="5" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_butterfly_board':
            return (
                <g transform="translate(370, 100)">
                    {/* Board frame */}
                    <path d="M -30 20 L 30 20 A 40 40 0 0 1 30 110 L -30 110 A 40 40 0 0 1 -30 20 Z" fill="#bcaaa4" stroke="#5d4037" strokeWidth="4" />
                    {/* Specimen pins and labels */}
                    {[-15, 15].map((x, idx) => {
                        return (
                            <g key={idx} transform={"translate(" + x + ", 50)"}>
                                <rect x="-8" y="-12" width="16" height="24" fill="#fff" stroke="#8d6e63" strokeWidth="1" />
                                {/* Butterfly specimen */}
                                <ellipse cx="-3" cy="0" rx="5" ry="3" fill="#90caf9" transform="rotate(-30 -3 0)" />
                                <ellipse cx="3" cy="0" rx="5" ry="3" fill="#90caf9" transform="rotate(30 3 0)" />
                                <circle cx="0" cy="0" r="1.5" fill="#333" />
                            </g>
                        );
                    })}
                    {/* Center specimen */}
                    <g transform="translate(0, 85)">
                        <rect x="-12" y="-8" width="24" height="16" fill="#fff" stroke="#8d6e63" strokeWidth="1" />
                        <ellipse cx="-4" cy="0" rx="6" ry="4" fill="#ffab91" transform="rotate(-20 -4 0)" />
                        <ellipse cx="4" cy="0" rx="6" ry="4" fill="#ffab91" transform="rotate(20 4 0)" />
                        <circle cx="0" cy="0" r="1.5" fill="#333" />
                    </g>
                    {/* Fluttering blue butterflies around frame */}
                    <path d="M -42 15 C -39 12 -36 15 -39 18 Z" fill="#42a5f5" />
                    <path d="M 45 40 C 48 37 51 40 48 43 Z" fill="#42a5f5" />
                </g>
            );
        case 'wall_xmas_lantern':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire with red bow */}
                    <line x1="0" y1="-100" x2="0" y2="30" stroke="#78909c" strokeWidth="1.5" />
                    <path d="M -12 25 Q 0 10 12 25 L 0 35 Z" fill="#d32f2f" />
                    {/* Gold Dome Lantern */}
                    <path d="M -25 60 C -25 30, 25 30, 25 60 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.5" />
                    {/* Glass body (Snowglobe) */}
                    <circle cx="0" cy="88" r="28" fill="#e0f7fa" opacity="0.4" stroke="url(#goldGrad)" strokeWidth="2.5" />
                    {/* Mini decorated Christmas tree inside */}
                    <polygon points="0,68 -10,88 10,88" fill="#2e7d32" />
                    <polygon points="0,75 -7,92 7,92" fill="#388e3c" />
                    <circle cx="0" cy="67" r="2.5" fill="#ffd54f" />
                    <circle cx="-5" cy="82" r="1.5" fill="#e57373" />
                    <circle cx="5" cy="85" r="1.5" fill="#64b5f6" />
                    {/* Snowy base inside */}
                    <path d="M -24 98 Q 0 92 24 98 L 20 110 L -20 110 Z" fill="#fff" />
                </g>
            );
        case 'wall_vinyl_shelf':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden diagonal shelf */}
                    <rect x="-45" y="45" width="90" height="8" fill="#a1887f" stroke="#5d4037" strokeWidth="1.5" transform="rotate(-20 0 50)" />
                    {/* Books and Vinyl record leaning */}
                    <g transform="translate(-10, 20) rotate(-20)">
                        <rect x="-15" y="0" width="10" height="35" fill="#e57373" stroke="#b71c1c" strokeWidth="1" />
                        <rect x="-5" y="5" width="8" height="30" fill="#ffd54f" stroke="#fbc02d" strokeWidth="1" />
                        {/* Vinyl sleeve and disc */}
                        <circle cx="15" cy="15" r="18" fill="#111" />
                        <circle cx="15" cy="15" r="6" fill="#64b5f6" />
                        <rect x="5" y="0" width="22" height="25" fill="#fff" opacity="0.8" stroke="#ccc" strokeWidth="1" />
                        <circle cx="16" cy="12" r="8" fill="#111" />
                    </g>
                    {/* Yellow music notes floating */}
                    <path d="M 30 10 Q 35 0 40 5 L 40 20" fill="none" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="30" cy="12" r="3.5" fill="#ffd54f" />
                </g>
            );
        case 'wall_plum_window':
            return (
                <g transform="translate(370, 180)">
                    {/* Octagonal Chinese window frame */}
                    <polygon points="-50,-20 -20,-50 20,-50 50,-20 50,20 20,50 -20,50 -50,20" fill="#fff" stroke="#5d4037" strokeWidth="6" />
                    <polygon points="-47,-18 -18,-47 18,-47 47,-18 47,18 18,47 -18,47 -47,18" fill="none" stroke="#8d6e63" strokeWidth="1.5" />
                    {/* White full moon background */}
                    <circle cx="15" cy="-10" r="30" fill="#fff9c4" opacity="0.6" />
                    {/* Plum blossom branches */}
                    <path d="M -45 25 Q -10 10 35 30" fill="none" stroke="#4e342e" strokeWidth="2.5" />
                    <path d="M -20 18 Q -15 -10 -5 -15" fill="none" stroke="#4e342e" strokeWidth="1.5" />
                    {/* Blossom flowers (Pink) */}
                    <circle cx="-25" cy="18" r="3.5" fill="#f48fb1" />
                    <circle cx="-20" cy="10" r="2.5" fill="#f48fb1" />
                    <circle cx="-10" cy="-8" r="3" fill="#f48fb1" />
                    <circle cx="-5" cy="-15" r="2" fill="#f48fb1" />
                    <circle cx="15" cy="22" r="3.5" fill="#f48fb1" />
                </g>
            );
        case 'wall_autumn_letter':
            return (
                <g transform="translate(370, 100)">
                    {/* Envelope base */}
                    <polygon points="-30,30 30,30 35,70 -35,70" fill="#ffe0b2" stroke="#bcaaa4" strokeWidth="1.5" />
                    <polygon points="-30,30 30,30 0,60" fill="#ffd54f" opacity="0.8" stroke="#bcaaa4" strokeWidth="1" />
                    {/* Open letter contents (Maple leaves and acorns) */}
                    <path d="M -15 30 L -25 5 Q -15 -5 -10 10 Z" fill="#ffb74d" stroke="#f57c00" strokeWidth="0.8" />
                    <path d="M 15 30 L 25 5 Q 15 -5 10 10 Z" fill="#ffb74d" stroke="#f57c00" strokeWidth="0.8" />
                    {/* Red wax seal */}
                    <circle cx="0" cy="60" r="6" fill="#c62828" />
                    <polygon points="0,57 -2,62 2,62" fill="#ffd54f" />
                    {/* Golden key hanger */}
                    <line x1="-20" y1="70" x2="-20" y2="105" stroke="url(#goldGrad)" strokeWidth="2" />
                    <circle cx="-20" cy="110" r="5" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
                    <rect x="-22" y="115" width="4" height="8" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_cat_pumpkin':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging colorful bead string */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#78909c" strokeWidth="1" />
                    {['#ff8a65', '#ffd54f', '#81c784', '#e57373'].map((c, i) => (
                        <circle key={i} cx="0" cy={-80 + i * 20} r="3" fill={c} />
                    ))}
                    {/* Glowing star frame */}
                    <polygon points="0,15 15,35 35,35 20,50 25,70 0,58 -25,70 -20,50 -35,35 -15,35" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                    {/* Cat inside Pumpkin helmet */}
                    <circle cx="0" cy="45" r="14" fill="#ffb74d" stroke="#e65100" strokeWidth="1.5" />
                    <polygon points="-8,33 -10,23 -4,29" fill="#111" />
                    {/* Cat ears inside */}
                    <polygon points="-8,37 -12,47 -4,45" fill="#ffe0cc" />
                    <polygon points="8,37 12,47 4,45" fill="#ffe0cc" />
                    {/* Cat face */}
                    <circle cx="0" cy="48" r="9" fill="#fff" />
                    <circle cx="-3" cy="46" r="1.5" fill="#333" />
                    <circle cx="3" cy="46" r="1.5" fill="#333" />
                    <polygon points="0,49 2,51 -2,51" fill="#e57373" />
                </g>
            );
        case 'wall_magic_wand':
            return (
                <g transform="translate(370, 100)">
                    {/* Blue circular orbit background */}
                    <ellipse cx="0" cy="55" rx="40" ry="12" fill="none" stroke="#64b5f6" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(-20 0 55)" />
                    {/* Magic wand placed diagonally */}
                    <g transform="translate(0, 50) rotate(-35)">
                        <rect x="-2" y="-30" width="4" height="90" fill="url(#goldGrad)" rx="1" />
                        {/* Blue sphere on top */}
                        <circle cx="0" cy="-35" r="8" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1.5" />
                        <polygon points="0,-48 3,-40 -3,-40" fill="url(#goldGrad)" />
                        {/* Golden wings */}
                        <path d="M -8 -35 Q -20 -45 -18 -30 Z" fill="url(#goldGrad)" />
                        <path d="M 8 -35 Q 20 -45 18 -30 Z" fill="url(#goldGrad)" />
                    </g>
                    {/* Sparkles around */}
                    <polygon points="25,20 28,15 31,20 36,23 31,26 28,31 25,26 20,23" fill="#ffe082" />
                    <polygon points="-25,75 -22,70 -19,75 -14,78 -19,81 -22,86 -25,81 -30,78" fill="#ffe082" />
                </g>
            );
        case 'wall_solar_system':
            return (
                <g transform="translate(370, 100)">
                    {/* Mobile central support */}
                    <line x1="0" y1="-100" x2="0" y2="40" stroke="#78909c" strokeWidth="2" />
                    <ellipse cx="0" cy="40" rx="30" ry="8" fill="none" stroke="#b0bec5" strokeWidth="1.5" />
                    {/* Orbit lines */}
                    <line x1="-30" y1="40" x2="-30" y2="120" stroke="#b0bec5" strokeWidth="1" />
                    <line x1="-15" y1="43" x2="-15" y2="150" stroke="#b0bec5" strokeWidth="1" />
                    <line x1="15" y1="43" x2="15" y2="160" stroke="#b0bec5" strokeWidth="1" />
                    <line x1="30" y1="40" x2="30" y2="110" stroke="#b0bec5" strokeWidth="1" />
                    {/* Planets */}
                    <circle cx="0" cy="40" r="10" fill="#ffb74d" stroke="#f57c00" strokeWidth="1.5" /> {/* Sun */}
                    <circle cx="-30" cy="120" r="6" fill="#e57373" /> {/* Mars */}
                    <circle cx="-15" cy="150" r="8" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1" /> {/* Earth */}
                    <g transform="translate(15, 160)">
                        <circle cx="0" cy="0" r="11" fill="#ffe082" /> {/* Saturn */}
                        <ellipse cx="0" cy="0" rx="18" ry="4" fill="none" stroke="#ffd54f" strokeWidth="2" transform="rotate(-15)" />
                    </g>
                    <circle cx="30" cy="110" r="5" fill="#81c784" /> {/* Jupiter */}
                </g>
            );
        case 'wall_sleeping_cat':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging macrame rope */}
                    <line x1="0" y1="-100" x2="0" y2="40" stroke="#d7ccc8" strokeWidth="3" />
                    {/* Hanging wicker basket */}
                    <path d="M -30 90 Q 0 130 30 90 C 35 70, -35 70, -30 90 Z" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="2.5" />
                    <path d="M -30 90 Q 0 40 30 90" fill="none" stroke="#d7ccc8" strokeWidth="3" />
                    {/* Sleeping Orange Cat inside */}
                    <ellipse cx="0" cy="85" rx="18" ry="13" fill="#ffb74d" stroke="#e65100" strokeWidth="1.5" />
                    {/* Cat ears */}
                    <polygon points="-12,75 -18,65 -8,70" fill="#ffb74d" stroke="#e65100" strokeWidth="1" />
                    <polygon points="12,75 18,65 8,70" fill="#ffb74d" stroke="#e65100" strokeWidth="1" />
                    {/* Sleeping eyes */}
                    <path d="M -8 83 Q -5 86 -2 83" fill="none" stroke="#e65100" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 8 83 Q 5 86 2 83" fill="none" stroke="#e65100" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Tail curled outside */}
                    <path d="M 15 90 Q 25 100 20 110" fill="none" stroke="#ffb74d" strokeWidth="3.5" strokeLinecap="round" />
                </g>
            );
        case 'wall_dreamcatcher':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="30" stroke="#aa7c11" strokeWidth="1.5" />
                    {/* Main circular frame */}
                    <circle cx="0" cy="55" r="25" fill="none" stroke="url(#goldGrad)" strokeWidth="3.5" />
                    {/* Dreamcatcher web inside */}
                    <polygon points="0,30 18,43 11,67 -11,67 -18,43" fill="none" stroke="#e0f7fa" strokeWidth="1" />
                    <polygon points="0,55 -8,45 8,45 0,65" fill="none" stroke="#e0f7fa" strokeWidth="0.8" />
                    <circle cx="0" cy="55" r="3" fill="#80deea" />
                    {/* Three feathers hanging down */}
                    {[-15, 0, 15].map((x, idx) => {
                        const y = 80 + (idx === 1 ? 15 : 0);
                        return (
                            <g key={idx} transform={"translate(" + x + ", " + y + ")"}>
                                <line x1="0" y1="0" x2="0" y2="15" stroke="#aa7c11" strokeWidth="1" />
                                <circle cx="0" cy="5" r="2.5" fill="#d1c4e9" />
                                <path d="M 0 15 C -5 22, -5 45, 0 52 C 5 45, 5 22, 0 15 Z" fill="#b39ddb" stroke="#7e57c2" strokeWidth="0.8" />
                            </g>
                        );
                    })}
                </g>
            );
        case 'wall_cloud_bubbles':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging top wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#90a4ae" strokeWidth="1.5" />
                    {/* Soft blue cloud */}
                    <path d="M -25 35 Q -35 25 -20 15 Q -10 5 10 15 Q 25 10 25 25 Q 35 35 20 45 L -20 45 Z" fill="#e0f7fa" opacity="0.9" stroke="#80deea" strokeWidth="2" />
                    {/* Rain threads with colored glass fish silhouettes */}
                    {[-18, 0, 18].map((x, idx) => {
                        const colors = ['#ffab91', '#ffe082', '#90caf9'];
                        const fishY = 80 + idx * 20;
                        return (
                            <g key={idx}>
                                <line x1={x} y1="45" x2={x} y2={fishY + 30} stroke="#80deea" strokeWidth="1.2" strokeDasharray="3 3" />
                                {/* Hanging glass fish */}
                                <g transform={"translate(" + x + ", " + fishY + ")"}>
                                    <ellipse cx="0" cy="0" rx="8" ry="4" fill={colors[idx]} stroke="#333" strokeWidth="0.8" />
                                    <polygon points="-8,0 -12,-5 -12,5" fill={colors[idx]} stroke="#333" strokeWidth="0.8" />
                                </g>
                            </g>
                        );
                    })}
                </g>
            );
        case 'wall_pandas_bamboo':
            return (
                <g transform="translate(370, 100)">
                    {/* Main green bamboo branch mounted diagonally */}
                    <rect x="-65" y="45" width="130" height="8" fill="#4caf50" rx="3" transform="rotate(-20 0 50)" />
                    {/* Nodes on bamboo */}
                    {[-40, -10, 20, 50].map((x, idx) => (
                        <rect key={idx} x={x} y="43" width="3" height="12" fill="#2e7d32" transform="rotate(-20 0 50)" />
                    ))}
                    {/* Bamboo leaves */}
                    <path d="M 30 20 C 35 10, 55 10, 45 25 Z" fill="#81c784" />
                    <path d="M -40 60 C -55 70, -60 55, -45 55 Z" fill="#81c784" />
                    {/* Four climbing tiny pandas */}
                    {[-35, -10, 15, 40].map((x, idx) => {
                        const y = 35 - idx * 5;
                        return (
                            <g key={idx} transform={"translate(" + x + ", " + y + ")"}>
                                <circle cx="0" cy="0" r="7" fill="#fff" stroke="#333" strokeWidth="1" />
                                <circle cx="-4" cy="-6" r="2.5" fill="#333" />
                                <circle cx="4" cy="-6" r="2.5" fill="#333" />
                                <circle cx="-3" cy="1" r="1.2" fill="#333" />
                                <circle cx="3" cy="1" r="1.2" fill="#333" />
                                <path d="M -5 6 Q 0 8 5 6" fill="none" stroke="#333" strokeWidth="1.2" />
                            </g>
                        );
                    })}
                </g>
            );
        case 'wall_apple_chime':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#81c784" strokeWidth="1.5" />
                    {/* Half Green Apple sliced frame */}
                    <path d="M -25 45 C -25 20, 25 20, 25 45 C 25 60, -25 60, -25 45 Z" fill="#e8f5e9" stroke="#4caf50" strokeWidth="3.5" />
                    <rect x="-3" y="20" width="6" height="8" fill="#78350f" /> {/* Apple stem */}
                    {/* Core seed details */}
                    <circle cx="-5" cy="45" r="2.2" fill="#3e2723" />
                    <circle cx="5" cy="45" r="2.2" fill="#3e2723" />
                    {/* Small apple beads hanging down */}
                    <line x1="-15" y1="53" x2="-15" y2="120" stroke="#81c784" strokeWidth="1" />
                    <circle cx="-15" cy="120" r="5" fill="#c8e6c9" stroke="#4caf50" strokeWidth="1" />
                    
                    <line x1="0" y1="55" x2="0" y2="150" stroke="#81c784" strokeWidth="1" />
                    <polygon points="0,95 3,90 -3,90" fill="#ffd54f" /> {/* Small hanging star */}
                    <circle cx="0" cy="150" r="6" fill="#81c784" stroke="#4caf50" strokeWidth="1.5" />
                    
                    <line x1="15" y1="53" x2="15" y2="120" stroke="#81c784" strokeWidth="1" />
                    <circle cx="15" cy="120" r="5" fill="#c8e6c9" stroke="#4caf50" strokeWidth="1" />
                </g>
            );
        case 'wall_pipa_hanging':
            return (
                <g transform="translate(370, 100) rotate(15)">
                    {/* Pipa neck and pegs */}
                    <rect x="-5" y="10" width="10" height="60" fill="#a1887f" stroke="#5d4037" strokeWidth="2" />
                    <line x1="-15" y1="25" x2="15" y2="25" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                    <line x1="-15" y1="40" x2="15" y2="40" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                    {/* Curved Pipa Head (Ruyi design) */}
                    <path d="M -8 10 Q 0 -5 8 10 Z" fill="#ffd54f" stroke="#5d4037" strokeWidth="1.5" />
                    {/* Pipa Body (Blue-white porcelain landscape themed) */}
                    <path d="M -5 70 C -30 110, -25 180, 0 190 C 25 180, 30 110, 5 70 Z" fill="#e0f7fa" stroke="#00838f" strokeWidth="3.5" />
                    {/* Landscape painting blue waves */}
                    <path d="M -21 150 Q 0 135 21 150 L 15 185 Q 0 190 -15 185 Z" fill="#b2ebf2" opacity="0.6" />
                    <path d="M -15 130 C -5 120, 5 120, 15 130" fill="none" stroke="#006064" strokeWidth="1.5" />
                    {/* Strings */}
                    {[-3, -1, 1, 3].map((x, i) => (
                        <line key={i} x1={x} y1="45" x2={x} y2="160" stroke="#ffd54f" strokeWidth="0.8" />
                    ))}
                    {/* Tassel at bottom */}
                    <line x1="0" y1="190" x2="0" y2="240" stroke="#00838f" strokeWidth="4" />
                </g>
            );
        case 'wall_island_dream':
            return (
                <g transform="translate(370, 100)">
                    {/* Driftwood branch support */}
                    <rect x="-45" y="20" width="90" height="7" fill="#d7ccc8" rx="3" stroke="#8d6e63" strokeWidth="1" />
                    <path d="M -35 20 L 0 -15 L 35 20" fill="none" stroke="#bcaaa4" strokeWidth="1.5" />
                    {/* Seaside chime threads holding shells */}
                    {[-20, 0, 20].map((x, idx) => {
                        const y = 80 + idx * 15;
                        return (
                            <g key={idx}>
                                <line x1={x} y1="25" x2={x} y2={y + 30} stroke="#90a4ae" strokeWidth="1" />
                                <g transform={"translate(" + x + ", " + y + ")"}>
                                    {idx === 0 && (
                                        /* Orange Scallop Shell */
                                        <path d="M -8 -8 C -12 2, 12 2, 8 -8 C 0 -12, 0 -12, -8 -8 Z" fill="#ffcc80" stroke="#e65100" strokeWidth="1" />
                                    )}
                                    {idx === 1 && (
                                        /* Starfish (Yellow) */
                                        <polygon points="0,-9 3,-2 10,-2 5,2 7,9 0,5 -7,9 -5,2 -10,-2 -3,-2" fill="#ffe082" stroke="#f57c00" strokeWidth="1" />
                                    )}
                                    {idx === 2 && (
                                        /* Blue Conch Shell */
                                        <path d="M -5 -9 C -10 -5, 10 5, 5 9 C 0 5, -5 5, -5 -9 Z" fill="#80deea" stroke="#00838f" strokeWidth="1" />
                                    )}
                                </g>
                            </g>
                        );
                    })}
                </g>
            );
        case 'wall_tennis_racket':
            return (
                <g transform="translate(370, 100)">
                    {/* Clay court peg board */}
                    <rect x="-30" y="20" width="60" height="90" fill="#d84315" stroke="#5d4037" strokeWidth="3" rx="3" />
                    {/* White lines representing tennis court */}
                    <line x1="-30" y1="35" x2="30" y2="35" stroke="#fff" strokeWidth="1.5" />
                    <line x1="-30" y1="95" x2="30" y2="95" stroke="#fff" strokeWidth="1.5" />
                    <line x1="0" y1="35" x2="0" y2="95" stroke="#fff" strokeWidth="1.5" />
                    {/* Tennis Racket hanging diagonally */}
                    <g transform="translate(0, 60) rotate(-45)">
                        <rect x="-2" y="-10" width="4" height="55" fill="#fff" stroke="#333" strokeWidth="1" />
                        <ellipse cx="0" cy="-22" rx="14" ry="18" fill="none" stroke="#e53935" strokeWidth="2.5" />
                        {/* String grid representation */}
                        <line x1="-10" y1="-22" x2="10" y2="-22" stroke="#ccc" strokeWidth="0.8" />
                        <line x1="0" y1="-40" x2="0" y2="-4" stroke="#ccc" strokeWidth="0.8" />
                    </g>
                    {/* Neon yellow tennis ball */}
                    <circle cx="15" cy="85" r="7" fill="#eeff41" stroke="#333" strokeWidth="1" />
                    <path d="M 10 85 Q 15 82 20 85" fill="none" stroke="#fff" strokeWidth="1" />
                </g>
            );
        case 'wall_mugwort_hanger':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging red string */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#d32f2f" strokeWidth="2.5" />
                    {/* Dried Mugwort bundle shape */}
                    <path d="M -15 65 C -25 35, 25 35, 15 65 L 5 110 C 2 120, -2 120, -5 110 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="2.5" />
                    <path d="M -5 65 C -15 45, 15 45, 5 65 L 2 110 C 1 115, -1 115, -2 110 Z" fill="#a5d6a7" />
                    {/* Straw tie wrap */}
                    <rect x="-6" y="85" width="12" height="8" fill="#ffd54f" rx="1" stroke="#fbc02d" strokeWidth="1" />
                    {/* Hanging red lucky sachet at the bottom */}
                    <g transform="translate(0, 120)">
                        <polygon points="0,0 -8,12 8,12" fill="#d32f2f" stroke="#ffeb3b" strokeWidth="1" />
                        <text x="0" y="10" fontSize="7" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">吉</text>
                        <line x1="0" y1="12" x2="0" y2="35" stroke="#d32f2f" strokeWidth="2.5" />
                    </g>
                </g>
            );
        case 'wall_casa_vase':
            return (
                <g transform="translate(370, 100)">
                    {/* Black picture frame */}
                    <rect x="-35" y="20" width="70" height="90" fill="#fafafa" stroke="#212121" strokeWidth="4" rx="2" />
                    <rect x="-30" y="25" width="60" height="80" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                    {/* Glass vase of flowers inside */}
                    <ellipse cx="0" cy="85" rx="14" ry="12" fill="#e0f7fa" opacity="0.6" stroke="#00acc1" strokeWidth="1.5" />
                    <rect x="-4" y="62" width="8" height="15" fill="#e0f7fa" opacity="0.6" stroke="#00acc1" strokeWidth="1" />
                    {/* Pink floral bouquet inside vase */}
                    <path d="M -15 65 Q 0 45 15 65" stroke="#4caf50" strokeWidth="2" />
                    <circle cx="-12" cy="50" r="6" fill="#f48fb1" />
                    <circle cx="0" cy="45" r="7" fill="#f48fb1" />
                    <circle cx="12" cy="50" r="6" fill="#f48fb1" />
                    <circle cx="-5" cy="58" r="5" fill="#f8bbd0" />
                    <circle cx="5" cy="58" r="5" fill="#f8bbd0" />
                    {/* Butterflies on border */}
                    <path d="M 28 35 C 31 32, 34 35, 31 38 Z" fill="#90caf9" />
                </g>
            );
        case 'wall_cork_board':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden cork board frame */}
                    <rect x="-35" y="20" width="70" height="95" fill="#d7ccc8" stroke="#5d4037" strokeWidth="4" rx="2" />
                    <rect x="-30" y="25" width="60" height="85" fill="#bcaaa4" />
                    {/* Pinned cards, sunglasses, menu */}
                    <rect x="-24" y="32" width="22" height="35" fill="#fff" rx="1" />
                    <text x="-13" y="44" fontSize="5" fontWeight="bold" fill="#333" textAnchor="middle">MENU</text>
                    <line x1="-20" y1="50" x2="-8" y2="50" stroke="#ccc" strokeWidth="1" />
                    <line x1="-20" y1="56" x2="-8" y2="56" stroke="#ccc" strokeWidth="1" />
                    
                    <rect x="4" y="32" width="20" height="20" fill="#e8f5e9" rx="1" />
                    <circle cx="14" cy="42" r="3.5" fill="#81c784" /> {/* Polaroid print */}
                    
                    {/* Sunglasses pinned */}
                    <g transform="translate(5, 65) scale(0.9)">
                        <circle cx="5" cy="5" r="5" fill="none" stroke="#212121" strokeWidth="2" />
                        <circle cx="15" cy="5" r="5" fill="none" stroke="#212121" strokeWidth="2" />
                        <line x1="8" y1="3" x2="12" y2="3" stroke="#212121" strokeWidth="2" />
                    </g>
                    {/* Pinned pink tulip branch at bottom */}
                    <path d="M -15 88 Q 0 85 15 92" stroke="#81c784" strokeWidth="1.5" />
                    <circle cx="10" cy="86" r="4.5" fill="#ffab91" />
                </g>
            );
        case 'wall_bamboo_flute':
            return (
                <g transform="translate(370, 100) rotate(-25)">
                    {/* Jade Bamboo flute body */}
                    <rect x="-6" y="20" width="12" height="150" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="2" rx="3" />
                    {/* Bamboo nodes and flute blowholes */}
                    {[45, 70, 95, 120, 145].map((y, idx) => (
                        <g key={idx}>
                            <rect x="-6" y={y} width="12" height="2" fill="#1b5e20" />
                            <circle cx="0" cy={y + 12} r="2.2" fill="#1b5e20" />
                        </g>
                    ))}
                    {/* Hanging cyan silk tassel */}
                    <line x1="0" y1="170" x2="0" y2="230" stroke="#00acc1" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="0" cy="173" r="3.5" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_graffiti_wheel':
            return (
                <g transform="translate(370, 100)">
                    {/* Bicycle outer tyre and metal rim */}
                    <circle cx="0" cy="55" r="42" fill="none" stroke="#212121" strokeWidth="5.5" />
                    <circle cx="0" cy="55" r="37" fill="none" stroke="#e0e0e0" strokeWidth="2" />
                    {/* Spokes */}
                    {[0, 30, 60, 90, 120, 150].map((deg, idx) => (
                        <line key={idx} x1="0" y1="55" x2="0" y2="55" stroke="#ccc" strokeWidth="1.2" transform={"rotate(" + deg + " 0 55) translate(0, -35) L 0 35"} />
                    ))}
                    <circle cx="0" cy="55" r="8" fill="#757575" />
                    {/* Small colorful stickers (Graffiti decoration) */}
                    <circle cx="-25" cy="30" r="4.5" fill="#f44336" />
                    <polygon points="25,35 28,27 33,35" fill="#ffeb3b" />
                    <rect x="-20" y="70" width="8" height="8" fill="#4caf50" rx="1.5" />
                    <circle cx="20" cy="72" r="3.5" fill="#00bcd4" />
                </g>
            );
        case 'wall_swallow_kite':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#90a4ae" strokeWidth="1.5" />
                    {/* Symmetrical Swallow Wings (Red and White) */}
                    <path d="M 0 45 C -25 15, -45 35, -40 65 C -35 85, -5 65, 0 45 Z" fill="#d32f2f" stroke="#333" strokeWidth="1.5" />
                    <path d="M 0 45 C 25 15, 45 35, 40 65 C 35 85, 5 65, 0 45 Z" fill="#d32f2f" stroke="#333" strokeWidth="1.5" />
                    <path d="M 0 45 C -15 25, -30 40, -25 60 Z" fill="#fff" />
                    <path d="M 0 45 C 15 25, 30 40, 25 60 Z" fill="#fff" />
                    {/* Swallow head */}
                    <circle cx="0" cy="32" r="6" fill="#d32f2f" stroke="#333" strokeWidth="1.5" />
                    <polygon points="-3,27 0,20 3,27" fill="#ffd54f" />
                    {/* Swallow tail feathers (Forked) */}
                    <path d="M -15 65 L -25 125 L 0 95 L 25 125 L 15 65 Z" fill="#d32f2f" stroke="#333" strokeWidth="1.5" />
                    {/* Hanging ribbons */}
                    <path d="M -20 120 Q -25 150 -15 180" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                    <path d="M 20 120 Q 25 150 15 180" fill="none" stroke="#ffd54f" strokeWidth="2.5" />
                </g>
            );
        case 'wall_birds_painting':
            return (
                <g transform="translate(370, 100)">
                    {/* Vertical dark wood frame */}
                    <rect x="-30" y="20" width="60" height="90" fill="#3e2723" stroke="#271510" strokeWidth="4.5" rx="2" />
                    {/* Off-white inner background */}
                    <rect x="-25" y="25" width="50" height="80" fill="#efebe9" />
                    {/* Three white bird silhouettes flying upwards */}
                    <g transform="translate(-10, 80) scale(0.8)">
                        <path d="M -10 0 Q 0 -12 10 0 Q 0 -4 -10 0" fill="#fff" stroke="#90a4ae" strokeWidth="0.8" />
                    </g>
                    <g transform="translate(5, 55) scale(0.9)">
                        <path d="M -12 0 Q 0 -15 12 0 Q 0 -5 -12 0" fill="#fff" stroke="#90a4ae" strokeWidth="0.8" />
                    </g>
                    <g transform="translate(-8, 35) scale(0.6)">
                        <path d="M -10 0 Q 0 -12 10 0 Q 0 -4 -10 0" fill="#fff" stroke="#90a4ae" strokeWidth="0.8" />
                    </g>
                </g>
            );
        case 'wall_red_lantern':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging top rod */}
                    <line x1="0" y1="-100" x2="0" y2="30" stroke="#d32f2f" strokeWidth="2.5" />
                    {/* Hexagonal Gold Roof cap */}
                    <polygon points="0,25 -25,40 -15,48 15,48 25,40" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1" />
                    {/* Lantern Body (Red hexagonal paper) */}
                    <polygon points="-18,48 -14,105 14,105 18,48" fill="#d32f2f" stroke="url(#goldGrad)" strokeWidth="2.5" />
                    {/* Vertical gold patterns on lantern */}
                    <line x1="-8" y1="48" x2="-6" y2="105" stroke="url(#goldGrad)" strokeWidth="1.2" />
                    <line x1="8" y1="48" x2="6" y2="105" stroke="url(#goldGrad)" strokeWidth="1.2" />
                    {/* Hexagonal Base */}
                    <polygon points="-16,105 -22,112 22,112 16,105" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1" />
                    {/* Symmetrical long red tassels */}
                    <line x1="0" y1="112" x2="0" y2="200" stroke="#b71c1c" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="0" cy="115" r="4.5" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_snake_hanger':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging lucky red string */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#d32f2f" strokeWidth="2.5" />
                    {/* Cute Year of Snake mascot holding gold coin */}
                    <ellipse cx="0" cy="40" rx="14" ry="12" fill="#ffd54f" stroke="#fbc02d" strokeWidth="1.5" />
                    <path d="M 0 52 C -15 65, 15 65, 0 52 Z" fill="#ffd54f" stroke="#fbc02d" strokeWidth="1.5" /> {/* snake tail */}
                    {/* Snake face details */}
                    <circle cx="-5" cy="38" r="1.5" fill="#333" />
                    <circle cx="5" cy="38" r="1.5" fill="#333" />
                    <path d="M -3 43 Q 0 45 3 43" fill="none" stroke="#e57373" strokeWidth="1" />
                    {/* Hanging firecracker bundle */}
                    <g transform="translate(0, 75)">
                        <line x1="0" y1="-15" x2="0" y2="110" stroke="#d32f2f" strokeWidth="2.5" />
                        {/* Red firecrackers along string */}
                        {[-12, -4, 4, 12].map((x, i) => {
                            const y = i * 24;
                            return (
                                <g key={i}>
                                    <rect x="-14" y={y} width="12" height="6" fill="#d32f2f" rx="1" />
                                    <rect x="2" y={y + 6} width="12" height="6" fill="#d32f2f" rx="1" />
                                </g>
                            );
                        })}
                    </g>
                </g>
            );
        case 'wall_snowboard':
            return (
                <g transform="translate(370, 100)">
                    {/* Snowboard body mounted vertically/diagonally */}
                    <rect x="-12" y="10" width="24" height="120" rx="11" fill="#4fc3f7" stroke="#0288d1" strokeWidth="3.5" transform="rotate(30 0 70)" />
                    {/* Yellow and black boot strap frames */}
                    <g transform="rotate(30 0 70)">
                        <rect x="-13" y="32" width="26" height="8" fill="#ffd54f" rx="1" stroke="#333" strokeWidth="1" />
                        <rect x="-13" y="82" width="26" height="8" fill="#ffd54f" rx="1" stroke="#333" strokeWidth="1" />
                        {/* Black details */}
                        <line x1="-10" y1="36" x2="10" y2="36" stroke="#212121" strokeWidth="2.5" />
                        <line x1="-10" y1="86" x2="10" y2="86" stroke="#212121" strokeWidth="2.5" />
                    </g>
                    {/* Snowflakes floating */}
                    <path d="M -25 30 L -15 30 M -20 25 L -20 35" stroke="#e0f7fa" strokeWidth="1.5" />
                    <path d="M 20 100 L 30 100 M 25 95 L 25 105" stroke="#e0f7fa" strokeWidth="1.5" />
                </g>
            );
        case 'wall_xmas_specimen':
            return (
                <g transform="translate(370, 100)">
                    {/* Narrow vertical wooden frame */}
                    <rect x="-18" y="20" width="36" height="105" fill="#fafafa" stroke="#8d6e63" strokeWidth="3" rx="2" />
                    {/* Specimen interior components (Holly leaves, berries) */}
                    <path d="M 0 35 L -10 60 L 10 60 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1" />
                    {/* Red berries */}
                    <circle cx="-5" cy="50" r="3.2" fill="#d32f2f" />
                    <circle cx="5" cy="48" r="3.2" fill="#d32f2f" />
                    <circle cx="0" cy="55" r="3.5" fill="#d32f2f" />
                    {/* Pinecones in middle */}
                    <polygon points="0,70 -8,85 8,85" fill="#5d4037" stroke="#3e2723" strokeWidth="1" />
                    <polygon points="0,85 -6,95 6,95" fill="#5d4037" stroke="#3e2723" strokeWidth="1" />
                    {/* Red ribbon and "Merry Xmas" text block */}
                    <path d="M -14 105 Q 0 95 14 105" fill="none" stroke="#d32f2f" strokeWidth="5.5" />
                    <text x="0" y="117" fontSize="5" fontWeight="bold" fill="#388e3c" textAnchor="middle">Merry Xmas</text>
                </g>
            );
        case 'wall_winter_rack':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden horizontal peg rack */}
                    <rect x="-35" y="20" width="70" height="7" fill="#d7ccc8" rx="2" stroke="#8d6e63" strokeWidth="1" />
                    <circle cx="-20" cy="23" r="3.5" fill="#bcaaa4" />
                    <circle cx="20" cy="23" r="3.5" fill="#bcaaa4" />
                    {/* Cozy striped winter scarf hanging */}
                    <g transform="translate(-20, 24)">
                        <path d="M -6 0 C -6 20, 6 20, 6 0 L 8 65 C 8 70, -8 70, -8 65 Z" fill="#a1887f" stroke="#5d4037" strokeWidth="1.2" />
                        <line x1="-8" y1="18" x2="8" y2="18" stroke="#ffe0b2" strokeWidth="4.5" />
                        <line x1="-8" y1="36" x2="8" y2="36" stroke="#ffe0b2" strokeWidth="4.5" />
                        <line x1="-8" y1="54" x2="8" y2="54" stroke="#ffe0b2" strokeWidth="4.5" />
                    </g>
                    {/* Matching winter knit beanie */}
                    <g transform="translate(20, 24)">
                        <path d="M -14 20 C -14 0, 14 0, 14 20 Z" fill="#ffe0b2" stroke="#a1887f" strokeWidth="1.5" />
                        {/* Folded edge */}
                        <rect x="-16" y="15" width="32" height="7" fill="#a1887f" rx="1.5" stroke="#5d4037" strokeWidth="1" />
                        {/* Pom-pom on top */}
                        <circle cx="0" cy="-2" r="5" fill="#ffe0b2" stroke="#a1887f" strokeWidth="1" />
                    </g>
                </g>
            );
        case 'wall_art_frame':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden easel picture frame */}
                    <rect x="-35" y="20" width="70" height="85" fill="#f5f5f5" stroke="#8d6e63" strokeWidth="4" rx="2" />
                    {/* Gilded gold inner frame mat */}
                    <rect x="-30" y="25" width="60" height="75" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
                    {/* Van Gogh Starry night canvas painting representation */}
                    <rect x="-27" y="28" width="54" height="40" fill="#0d47a1" />
                    <circle cx="-12" cy="40" r="8" fill="#ffd54f" opacity="0.8" /> {/* Moon */}
                    <path d="M -27 58 Q 0 45 27 58 L 27 68 L -27 68 Z" fill="#1b5e20" opacity="0.8" /> {/* Hills */}
                    {/* Sunflower canvas painting representation */}
                    <rect x="-27" y="70" width="54" height="27" fill="#fff9c4" />
                    <circle cx="0" cy="85" r="7" fill="#ffe082" stroke="#ffb300" strokeWidth="1.5" />
                    {/* Flower stem */}
                    <line x1="0" y1="85" x2="0" y2="97" stroke="#2e7d32" strokeWidth="1.5" />
                </g>
            );
        case 'wall_treasure_map':
            return (
                <g transform="translate(370, 100)">
                    {/* Old aged parchment map body */}
                    <path d="M -35 25 L 35 25 C 40 25, 40 100, 35 100 L -35 100 C -40 100, -40 25, -35 25 Z" fill="#ffe0b2" stroke="#a1887f" strokeWidth="3" />
                    {/* Ripped scroll rolls on sides */}
                    <rect x="-38" y="20" width="4" height="85" fill="#8d6e63" rx="1" />
                    <rect x="34" y="20" width="4" height="85" fill="#8d6e63" rx="1" />
                    {/* Map markings (Islands, ships, red dotted route, red cross) */}
                    {/* Island blobs */}
                    <path d="M -20 40 Q -10 32 -5 45 Q -10 55 -25 50 Z" fill="#fff" opacity="0.6" stroke="#bcaaa4" strokeWidth="1" />
                    <path d="M 15 70 Q 25 65 20 80 Q 10 85 10 75 Z" fill="#fff" opacity="0.6" stroke="#bcaaa4" strokeWidth="1" />
                    {/* Red dotted route */}
                    <path d="M -15 45 Q 0 60 15 75" fill="none" stroke="#d32f2f" strokeWidth="2.2" strokeDasharray="3 3" />
                    {/* Red Cross target */}
                    <path d="M 12 72 L 18 78 M 18 72 L 12 78" stroke="#d32f2f" strokeWidth="2.5" />
                    {/* Miniature sailing ship */}
                    <polygon points="-25,75 -15,75 -18,65 -22,65" fill="#5d4037" stroke="#3e2723" strokeWidth="0.8" />
                </g>
            );
        case 'wall_halloween_frame':
            return (
                <g transform="translate(370, 100)">
                    {/* Spooky black wooden board with arched top */}
                    <path d="M -30 20 L 30 20 A 35 35 0 0 1 30 95 L -30 95 A 35 35 0 0 1 -30 20 Z" fill="#212121" stroke="#e65100" strokeWidth="3.5" />
                    {/* Spooky orange text "Halloween" */}
                    <text x="0" y="42" fontSize="9" fontWeight="black" fill="#ffab40" textAnchor="middle" letterSpacing="1">Halloween</text>
                    {/* Pumpkin smiling at bottom */}
                    <circle cx="0" cy="72" r="13" fill="#ff9100" stroke="#e65100" strokeWidth="1" />
                    <rect x="-2" y="55" width="4" height="6" fill="#4caf50" />
                    {/* Carved eyes & smile */}
                    <polygon points="-5,68 -3,72 -7,72" fill="#212121" />
                    <polygon points="5,68 3,72 7,72" fill="#212121" />
                    <path d="M -6 76 Q 0 81 6 76" fill="none" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" />
                    {/* White flying ghost */}
                    <path d="M -18 55 Q -25 50 -20 62 Q -18 68 -22 70" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'wall_zhuang_ball':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging red lucky cords */}
                    <line x1="-15" y1="-100" x2="-15" y2="35" stroke="#d32f2f" strokeWidth="1.5" />
                    <line x1="15" y1="-100" x2="15" y2="55" stroke="#d32f2f" strokeWidth="1.5" />
                    {/* Zhuang Embroidered Balls (Pink & Blue) */}
                    <g transform="translate(-15, 35)">
                        <circle cx="0" cy="0" r="14" fill="#f48fb1" stroke="#ad1457" strokeWidth="1.5" />
                        {/* Embroidered floral wedges */}
                        <path d="M 0 -14 Q 5 0 0 14" fill="none" stroke="#ad1457" strokeWidth="1.2" />
                        <path d="M 0 -14 Q -5 0 0 14" fill="none" stroke="#ad1457" strokeWidth="1.2" />
                        <path d="M -14 0 Q 0 5 14 0" fill="none" stroke="#ad1457" strokeWidth="1.2" />
                        <line x1="0" y1="14" x2="0" y2="40" stroke="#d32f2f" strokeWidth="2" />
                    </g>
                    <g transform="translate(15, 55)">
                        <circle cx="0" cy="0" r="14" fill="#90caf9" stroke="#1565c0" strokeWidth="1.5" />
                        <path d="M 0 -14 Q 5 0 0 14" fill="none" stroke="#1565c0" strokeWidth="1.2" />
                        <path d="M 0 -14 Q -5 0 0 14" fill="none" stroke="#1565c0" strokeWidth="1.2" />
                        <path d="M -14 0 Q 0 5 14 0" fill="none" stroke="#1565c0" strokeWidth="1.2" />
                        <line x1="0" y1="14" x2="0" y2="40" stroke="#d32f2f" strokeWidth="2" />
                    </g>
                </g>
            );
        case 'wall_rose_mirror':
            return (
                <g transform="translate(370, 180)">
                    {/* Gilded circular frame */}
                    <circle cx="0" cy="0" r="48" fill="#e3f2fd" stroke="url(#goldGrad)" strokeWidth="6" />
                    {/* Inner silver mirror reflection border */}
                    <circle cx="0" cy="0" r="44" fill="none" stroke="#bbdefb" strokeWidth="1.5" />
                    {/* Pink roses and leaves decorating the border */}
                    {/* Bottom bouquet */}
                    <circle cx="-15" cy="40" r="5" fill="#f48fb1" stroke="#d81b60" strokeWidth="0.8" />
                    <circle cx="0" cy="45" r="6.5" fill="#f48fb1" stroke="#d81b60" strokeWidth="0.8" />
                    <circle cx="15" cy="40" r="5" fill="#f48fb1" stroke="#d81b60" strokeWidth="0.8" />
                    {/* Leaves */}
                    <path d="M -25 35 Q -32 42 -22 45 Z" fill="#81c784" />
                    <path d="M 25 35 Q 32 42 22 45 Z" fill="#81c784" />
                    {/* Top rose */}
                    <circle cx="0" cy="-45" r="5.5" fill="#f48fb1" stroke="#d81b60" strokeWidth="0.8" />
                    <path d="M -8 -45 Q -15 -48 -6 -52 Z" fill="#81c784" />
                </g>
            );
        case 'wall_loong_year':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#d32f2f" strokeWidth="2" />
                    {/* Symmetrical red felt calendar scroll */}
                    <rect x="-24" y="20" width="48" height="78" fill="#d32f2f" stroke="#ffd54f" strokeWidth="1.5" rx="3" />
                    {/* Gold text scroll top "LOONG YEAR" */}
                    <text x="0" y="32" fontSize="6.5" fontWeight="black" fill="#ffd54f" textAnchor="middle" letterSpacing="0.5">LOONG YEAR</text>
                    <text x="0" y="42" fontSize="9" fontWeight="black" fill="#ffd54f" textAnchor="middle">2000</text>
                    {/* Cute baby dragon illustration */}
                    <ellipse cx="0" cy="62" rx="10" ry="8" fill="#ff7043" stroke="#ffd54f" strokeWidth="0.8" />
                    <circle cx="-3" cy="59" r="1" fill="#fff" />
                    <circle cx="3" cy="59" r="1" fill="#fff" />
                    <path d="M -4 53 L -1 56 L -4 58" fill="#ffd54f" /> {/* horn */}
                    <path d="M 4 53 L 1 56 L 4 58" fill="#ffd54f" />
                    {/* Bottom calendar grid lines */}
                    <rect x="-18" y="78" width="36" height="15" fill="#fff" rx="1" />
                    <line x1="-12" y1="84" x2="12" y2="84" stroke="#ff7043" strokeWidth="1" />
                    <line x1="-12" y1="89" x2="12" y2="89" stroke="#ff7043" strokeWidth="1" />
                </g>
            );
        case 'wall_qiqiao_scroll':
            return (
                <g transform="translate(370, 100)">
                    {/* Traditional vertical hanging scroll */}
                    <rect x="-22" y="20" width="44" height="105" fill="#fef3c7" stroke="#b45309" strokeWidth="2.5" />
                    <rect x="-26" y="15" width="52" height="7" fill="#78350f" rx="1.5" />
                    <rect x="-26" y="123" width="52" height="7" fill="#78350f" rx="1.5" />
                    {/* Painting interior: Full Moon, Bridge, Magpie silhouettes */}
                    <circle cx="10" cy="45" r="12" fill="#fff59d" opacity="0.8" />
                    <path d="M -18 95 Q 0 85 18 95" fill="none" stroke="#78350f" strokeWidth="3" /> {/* bridge */}
                    {/* Magpies in sky */}
                    <path d="M -8 50 Q -5 45 -2 50 Q -5 52 -8 50" fill="#3e2723" />
                    <path d="M 5 62 Q 8 57 11 62 Q 8 64 5 62" fill="#3e2723" />
                    {/* Hanging red threads from the scroll base */}
                    <line x1="-20" y1="130" x2="-20" y2="155" stroke="#b45309" strokeWidth="1.5" />
                    <line x1="20" y1="130" x2="20" y2="155" stroke="#b45309" strokeWidth="1.5" />
                </g>
            );
        case 'wall_sports_medal':
            return (
                <g transform="translate(370, 100)">
                    {/* Symmetrical pink ribbon hanging from top */}
                    <path d="M -12 20 L -4 80 L 4 80 L 12 20 Z" fill="#f8bbd0" stroke="#ad1457" strokeWidth="1.2" />
                    <text x="0" y="55" fontSize="4.5" fill="#ad1457" fontWeight="bold" textAnchor="middle" transform="rotate(85 0 55)">BAICIZHAN</text>
                    {/* Golden circular medal hanger */}
                    <circle cx="0" cy="88" r="14" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="1.8" />
                    <circle cx="0" cy="88" r="11" fill="none" stroke="#aa7c11" strokeWidth="0.8" />
                    {/* Swimmer figure / victory emblem inside */}
                    <circle cx="0" cy="82" r="3.2" fill="#aa7c11" />
                    <path d="M -5 93 Q 0 86 5 93 L 3 98 L -3 98 Z" fill="#aa7c11" />
                </g>
            );
        case 'wall_watermelon_chime':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#78909c" strokeWidth="1.5" />
                    {/* Circular pink glass bowl cap */}
                    <path d="M -15 35 C -15 20, 15 20, 15 35 Z" fill="#ffab91" opacity="0.8" stroke="#e65100" strokeWidth="1.5" />
                    {/* Handpainted black watermelon seeds inside */}
                    <circle cx="-5" cy="27" r="1" fill="#212121" />
                    <circle cx="5" cy="27" r="1" fill="#212121" />
                    <circle cx="0" cy="31" r="1" fill="#212121" />
                    {/* Hanging thread with paper watermelon slice tag */}
                    <line x1="0" y1="35" x2="0" y2="130" stroke="#78909c" strokeWidth="1" />
                    <g transform="translate(0, 130) rotate(15)">
                        <path d="M -12 -5 Q 0 10 12 -5 L 10 -10 Q 0 0 -10 -10 Z" fill="#ff8a80" stroke="#4caf50" strokeWidth="1.5" />
                        <circle cx="-3" cy="-5" r="0.8" fill="#333" />
                        <circle cx="3" cy="-5" r="0.8" fill="#333" />
                    </g>
                </g>
            );
        case 'wall_space_frame':
            return (
                <g transform="translate(370, 100)">
                    {/* Diagonal dark space picture frame */}
                    <rect x="-32" y="20" width="64" height="90" fill="#1a237e" stroke="#212121" strokeWidth="4.5" rx="3" transform="rotate(15 0 65)" />
                    {/* Planet symbols and golden orbits inside */}
                    <g transform="rotate(15 0 65)">
                        <circle cx="-12" cy="45" r="8" fill="#ff7043" /> {/* Orange planet */}
                        <ellipse cx="-12" cy="45" rx="14" ry="3" fill="none" stroke="#ffd54f" strokeWidth="1.5" transform="rotate(-15 -12 45)" />
                        
                        <circle cx="12" cy="75" r="6" fill="#29b6f6" /> {/* Blue planet */}
                        
                        <circle cx="-18" cy="85" r="2.5" fill="#81c784" /> {/* Green planet */}
                        {/* Cosmic dust and shooting stars */}
                        <path d="M 12 35 L 22 45" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" />
                    </g>
                </g>
            );
        case 'wall_scenic_window':
            return (
                <g transform="translate(370, 180)">
                    {/* Traditional Chinese circular moon window frame */}
                    <circle cx="0" cy="0" r="50" fill="#fff" stroke="#5d4037" strokeWidth="6" />
                    <circle cx="0" cy="0" r="46" fill="none" stroke="#8d6e63" strokeWidth="1.5" />
                    {/* Traditional interior scene (table, teapot, bamboo) */}
                    {/* Red desk table line */}
                    <line x1="-42" y1="20" x2="42" y2="20" stroke="#b45309" strokeWidth="3.5" />
                    {/* Golden teapot and cup */}
                    <path d="M -15 20 L -15 2 C -15 -3, -5 -3, -5 2 L -5 20 Z" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="0.8" />
                    <circle cx="-10" cy="11" r="5" fill="url(#goldGrad)" />
                    {/* Green bamboo vase */}
                    <rect x="15" y="-5" width="8" height="25" fill="#a5d6a7" rx="1.5" stroke="#2e7d32" strokeWidth="1" />
                    <path d="M 19 -5 Q 28 -18 32 -10" fill="none" stroke="#2e7d32" strokeWidth="1.5" />
                </g>
            );
        case 'wall_elven_bow':
            return (
                <g transform="translate(370, 100)">
                    {/* Wooden support rack peg */}
                    <rect x="-35" y="45" width="70" height="6" fill="#8d6e63" rx="2" stroke="#5d4037" strokeWidth="1" />
                    <circle cx="-20" cy="48" r="3" fill="#3e2723" />
                    <circle cx="20" cy="48" r="3" fill="#3e2723" />
                    {/* Gilded elven bow decorated with green forest leaves */}
                    <g transform="translate(0, 48) rotate(-10)">
                        {/* Bow curved limbs */}
                        <path d="M -50 -5 C -25 -25, 25 -25, 50 -5" fill="none" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
                        <path d="M -50 -5 C -45 -12, -40 -5, -42 -2" fill="url(#goldGrad)" />
                        <path d="M 50 -5 C 45 -12, 40 -5, 42 -2" fill="url(#goldGrad)" />
                        {/* Bow string */}
                        <line x1="-50" y1="-5" x2="50" y2="-5" stroke="#e0f7fa" strokeWidth="0.8" />
                        {/* Forest leaves wrapper at the center handle */}
                        <circle cx="0" cy="-18" r="6" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
                        <path d="M -8 -18 Q -16 -22 -6 -24 Z" fill="#4caf50" />
                        <path d="M 8 -18 Q 16 -22 6 -24 Z" fill="#4caf50" />
                    </g>
                </g>
            );
        case 'wall_tulips_basket':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wicker bamboo basket */}
                    <path d="M -25 50 L -15 95 C -12 105, 12 105, 15 95 L 25 50 Z" fill="#ffd54f" stroke="#b45309" strokeWidth="2.5" />
                    {/* Basket grid lines */}
                    <line x1="-20" y1="65" x2="20" y2="65" stroke="#b45309" strokeWidth="1.2" />
                    <line x1="-16" y1="80" x2="16" y2="80" stroke="#b45309" strokeWidth="1.2" />
                    {/* Overflowing pink tulips */}
                    <path d="M -10 50 Q -15 30 -5 20 Q 5 30 -10 50 Z" fill="#f48fb1" stroke="#c2185b" strokeWidth="0.8" />
                    <path d="M 10 50 Q 15 30 5 20 Q -5 30 10 50 Z" fill="#f48fb1" stroke="#c2185b" strokeWidth="0.8" />
                    <path d="M 0 50 Q 0 25 -10 15 Q -20 25 0 50 Z" fill="#ffab91" stroke="#e64a19" strokeWidth="0.8" />
                    <circle cx="-12" cy="38" r="1.5" fill="#fff" /> {/* Baby breath dots */}
                    <circle cx="12" cy="38" r="1.5" fill="#fff" />
                    <circle cx="0" cy="28" r="1.5" fill="#fff" />
                </g>
            );
        case 'wall_labor_poster':
            return (
                <g transform="translate(370, 100)">
                    {/* Vertical frame */}
                    <rect x="-32" y="20" width="64" height="90" fill="#fafafa" stroke="#d32f2f" strokeWidth="4.5" rx="2" />
                    {/* Red sunburst background */}
                    <rect x="-27" y="25" width="54" height="80" fill="#ffe082" />
                    {/* Sun rays rising */}
                    <polygon points="0,105 -27,60 -27,45" fill="#ef9a9a" opacity="0.6" />
                    <polygon points="0,105 27,60 27,45" fill="#ef9a9a" opacity="0.6" />
                    {/* Three young workers reading blueprint */}
                    <g transform="translate(0, 72) scale(0.9)">
                        {/* Heads */}
                        <circle cx="-10" cy="10" r="7" fill="#ffe0cc" stroke="#333" strokeWidth="1" />
                        <circle cx="10" cy="10" r="7" fill="#ffe0cc" stroke="#333" strokeWidth="1" />
                        <circle cx="0" cy="0" r="7.5" fill="#ffe0cc" stroke="#333" strokeWidth="1" />
                        {/* Hair caps */}
                        <path d="M -15 8 Q -10 -2 -5 8 Z" fill="#333" />
                        <path d="M 5 8 Q 10 -2 15 8 Z" fill="#ffd54f" />
                        <path d="M -6 -2 Q 0 -12 6 -2 Z" fill="#3e2723" />
                    </g>
                    {/* Bottom banner with text "劳动最光荣" */}
                    <rect x="-22" y="92" width="44" height="10" fill="#d32f2f" />
                    <text x="0" y="100" fontSize="6.5" fontWeight="bold" fill="#ffeb3b" textAnchor="middle">劳动最光荣</text>
                </g>
            );
        case 'wall_opera_mask':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging red cord */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#d32f2f" strokeWidth="2.5" />
                    {/* Peking Opera Mask (Symmetric Red, Black, White) */}
                    <path d="M -18 50 C -18 20, 18 20, 18 50 C 18 80, -18 80, -18 50 Z" fill="#fff" stroke="#212121" strokeWidth="3" />
                    {/* Black cheeks and eyebrows pattern */}
                    <path d="M -18 50 C -18 35, -5 32, -8 50 C -10 65, -18 60, -18 50 Z" fill="#212121" />
                    <path d="M 18 50 C 18 35, 5 32, 8 50 C 10 65, 18 60, 18 50 Z" fill="#212121" />
                    {/* Red central nose forehead banner */}
                    <path d="M -4 20 L 4 20 L 6 78 L -6 78 Z" fill="#d32f2f" />
                    {/* Eye slits */}
                    <ellipse cx="-8" cy="46" rx="4" ry="1.5" fill="#fff" />
                    <ellipse cx="8" cy="46" rx="4" ry="1.5" fill="#fff" />
                </g>
            );
        case 'wall_reunion_lantern':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="25" stroke="#00acc1" strokeWidth="2" />
                    {/* Round paper lantern decorated with pink cherry blossoms */}
                    <circle cx="0" cy="55" r="26" fill="#fff9c4" stroke="#ffd54f" strokeWidth="2" />
                    {/* Cherry blossoms (Pink) */}
                    <circle cx="-10" cy="50" r="3" fill="#f48fb1" />
                    <circle cx="-13" cy="56" r="2.5" fill="#f48fb1" />
                    <circle cx="8" cy="62" r="3.5" fill="#f48fb1" />
                    {/* Hanging teal/cyan tassels */}
                    <line x1="0" y1="81" x2="0" y2="160" stroke="#00acc1" strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="0" cy="84" r="4.5" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_xmas_wreath':
            return (
                <g transform="translate(370, 100)">
                    {/* Green pine needle Christmas wreath */}
                    <circle cx="0" cy="55" r="30" fill="none" stroke="#2e7d32" strokeWidth="15" />
                    <circle cx="0" cy="55" r="30" fill="none" stroke="#1b5e20" strokeWidth="15" strokeDasharray="5 5" />
                    {/* Red bow ribbon on top */}
                    <path d="M -12 20 Q 0 8 12 20 L 0 30 Z" fill="#d32f2f" />
                    <path d="M -6 30 L -12 55" stroke="#d32f2f" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M 6 30 L 12 55" stroke="#d32f2f" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Golden bells & snowman decorations */}
                    <circle cx="-25" cy="55" r="4" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="0.8" />
                    <circle cx="25" cy="55" r="4" fill="url(#goldGrad)" stroke="#aa7c11" strokeWidth="0.8" />
                    {/* White snow accumulation on pine needles */}
                    <path d="M -30 38 Q -20 28 -10 38" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 10 38 Q 20 28 30 38" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </g>
            );
        case 'wall_cat_milktea':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging star chain */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="url(#goldGrad)" strokeWidth="1.5" />
                    <polygon points="0,20 3,12 -3,12" fill="url(#goldGrad)" />
                    {/* Milk tea cup with cat ear lid */}
                    <polygon points="-16,40 16,40 12,98 -12,98" fill="#ffe0b2" stroke="#8d6e63" strokeWidth="2.5" />
                    <ellipse cx="0" cy="40" rx="16" ry="5" fill="#d7ccc8" stroke="#8d6e63" strokeWidth="1.5" />
                    {/* Cat ear lid */}
                    <path d="M -14 38 C -14 20, 14 20, 14 38 Z" fill="#fff" stroke="#8d6e63" strokeWidth="1.5" />
                    <polygon points="-10,25 -14,14 -4,20" fill="#ffab91" />
                    <polygon points="10,25 14,14 4,20" fill="#ffab91" />
                    {/* Boba pearls inside representation */}
                    <circle cx="-6" cy="85" r="3.5" fill="#212121" />
                    <circle cx="6" cy="88" r="3.5" fill="#212121" />
                    <circle cx="0" cy="80" r="3.5" fill="#212121" />
                </g>
            );
        case 'wall_persimmon_hanger':
            return (
                <g transform="translate(370, 100)">
                    {/* Traditional black branch support */}
                    <path d="M -45 20 Q 0 5 45 20" fill="none" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    {/* Three hanging orange persimmon fruits */}
                    {[-20, 0, 20].map((x, idx) => {
                        const y = 50 + (idx === 1 ? 15 : 0);
                        return (
                            <g key={idx} transform={"translate(" + x + ", " + y + ")"}>
                                <line x1="0" y1="-30" x2="0" y2="0" stroke="#212121" strokeWidth="1.5" />
                                <circle cx="0" cy="0" r="10" fill="#ff7043" stroke="#d84315" strokeWidth="1.5" />
                                {/* Persimmon top leaves */}
                                <polygon points="-5,-10 0,-14 5,-10 0,-7" fill="#4caf50" />
                            </g>
                        );
                    })}
                    {/* Center lucky card "柿柿如意" */}
                    <g transform="translate(0, 92)">
                        <circle cx="0" cy="0" r="14" fill="#ffb74d" stroke="#e65100" strokeWidth="1.5" />
                        <text x="0" y="4" fontSize="6.5" fontWeight="bold" fill="#e65100" textAnchor="middle">柿柿如意</text>
                    </g>
                </g>
            );
        case 'wall_rainbow_scepter':
            return (
                <g transform="translate(370, 100)">
                    {/* Royal scepter golden handle */}
                    <rect x="-2.5" y="20" width="5" height="110" fill="url(#goldGrad)" rx="1.5" stroke="#aa7c11" strokeWidth="1.2" />
                    {/* Rainbow diamond on top */}
                    <polygon points="0,5 -15,20 0,35 15,20" fill="#e0f7fa" stroke="url(#goldGrad)" strokeWidth="2.5" />
                    {/* Rainbow reflection streaks */}
                    <path d="M -15 20 Q 0 35 0 5" fill="none" stroke="#f48fb1" strokeWidth="1.5" />
                    <path d="M 15 20 Q 0 35 0 5" fill="none" stroke="#80deea" strokeWidth="1.5" />
                    {/* Crown eave support below scepter head */}
                    <rect x="-10" y="32" width="20" height="4" fill="url(#goldGrad)" />
                </g>
            );
        case 'wall_rocket_frame':
            return (
                <g transform="translate(370, 100)">
                    {/* Circular space blue frame */}
                    <circle cx="0" cy="55" r="42" fill="#0d47a1" stroke="#e0f7fa" strokeWidth="3.5" />
                    <circle cx="0" cy="55" r="38" fill="none" stroke="#29b6f6" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Rocket blasting off in center */}
                    <g transform="translate(0, 50)">
                        {/* Flame */}
                        <polygon points="-6,15 0,32 6,15" fill="#ff7043" />
                        <polygon points="-3,15 0,25 3,15" fill="#ffeb3b" />
                        {/* Rocket body */}
                        <rect x="-8" y="-20" width="16" height="35" fill="#fff" rx="4" stroke="#212121" strokeWidth="1.5" />
                        {/* Nose cone (Red) */}
                        <path d="M -8 -20 C -8 -35, 8 -35, 8 -20 Z" fill="#d32f2f" stroke="#212121" strokeWidth="1.5" />
                        {/* Circular window */}
                        <circle cx="0" cy="-8" r="4.5" fill="#29b6f6" stroke="#212121" strokeWidth="1" />
                        {/* Symmetrical fins */}
                        <polygon points="-8,-2 -15,10 -8,10" fill="#d32f2f" stroke="#212121" strokeWidth="1" />
                        <polygon points="8,-2 15,10 8,10" fill="#d32f2f" stroke="#212121" strokeWidth="1" />
                    </g>
                </g>
            );
        case 'wall_graffiti_skateboard':
            return (
                <g transform="translate(370, 100)">
                    {/* Skateboard body mounted horizontally */}
                    <rect x="-55" y="42" width="110" height="24" rx="8" fill="#ff7043" stroke="#212121" strokeWidth="3" />
                    {/* Wheels beneath */}
                    <circle cx="-35" cy="68" r="6" fill="#757575" stroke="#212121" strokeWidth="1" />
                    <circle cx="35" cy="68" r="6" fill="#757575" stroke="#212121" strokeWidth="1" />
                    {/* Green graffiti monster details inside */}
                    <ellipse cx="-15" cy="54" rx="9" ry="7" fill="#81c784" stroke="#333" strokeWidth="1" />
                    <circle cx="-18" cy="52" r="1.5" fill="#fff" />
                    <circle cx="-12" cy="52" r="1.5" fill="#fff" />
                    <path d="M -16 57 Q -15 59 -14 57" fill="none" stroke="#333" strokeWidth="1" />
                    {/* Text "Skate cool" */}
                    <text x="18" y="57" fontSize="8" fontWeight="black" fill="#fff" textAnchor="middle">Skate</text>
                </g>
            );
        case 'wall_rock_guitar':
            return (
                <g transform="translate(370, 100) rotate(-30)">
                    {/* Guitar/Bass neck */}
                    <rect x="-3" y="10" width="6" height="75" fill="#ffe0b2" stroke="#3e2723" strokeWidth="1.5" />
                    <line x1="-3" y1="20" x2="3" y2="20" stroke="#757575" strokeWidth="1.5" />
                    <line x1="-3" y1="40" x2="3" y2="40" stroke="#757575" strokeWidth="1.5" />
                    <line x1="-3" y1="60" x2="3" y2="60" stroke="#757575" strokeWidth="1.5" />
                    {/* Guitar head */}
                    <path d="M -5 10 Q 0 -5 5 10 Z" fill="#ff7043" stroke="#3e2723" strokeWidth="1.2" />
                    {/* Electric Guitar Body (Orange with white pickguard) */}
                    <path d="M -3 80 C -25 90, -20 145, 0 150 C 20 145, 25 90, 3 80 Z" fill="#ff7043" stroke="#3e2723" strokeWidth="3" />
                    <path d="M -3 85 C -15 92, -10 120, 0 125 C 10 120, 15 92, 3 85 Z" fill="#fff" opacity="0.9" />
                    {/* Controls (Knobs) */}
                    <circle cx="-8" cy="130" r="3.2" fill="#bdbdbd" />
                    <circle cx="8" cy="130" r="3.2" fill="#bdbdbd" />
                </g>
            );
        case 'wall_checkin_reminder':
            return (
                <g transform="translate(370, 100)">
                    {/* Flower-shaped yellow wooden plaque */}
                    <path d="M -30 45 C -45 30, -45 10, -30 -5 C -15 -20, 15 -20, 30 -5 C 45 10, 45 30, 30 45 Z" fill="#ffe082" stroke="#8d6e63" strokeWidth="3.5" transform="translate(0, 50)" />
                    {/* Sign content "记得打卡" */}
                    <text x="0" y="86" fontSize="12" fontWeight="black" fill="#5d4037" textAnchor="middle">记得打卡</text>
                    {/* Hanging tiny panda head */}
                    <line x1="0" y1="108" x2="0" y2="140" stroke="#8d6e63" strokeWidth="1.5" />
                    <g transform="translate(0, 148)">
                        <circle cx="0" cy="0" r="9" fill="#fff" stroke="#333" strokeWidth="1.2" />
                        <circle cx="-5" cy="-8" r="3" fill="#333" />
                        <circle cx="5" cy="-8" r="3" fill="#333" />
                        <circle cx="-3.5" cy="-1" r="1.5" fill="#333" />
                        <circle cx="3.5" cy="-1" r="1.5" fill="#333" />
                        <polygon points="0,3 -2,5 2,5" fill="#e57373" />
                    </g>
                </g>
            );
        case 'wall_future_scroll':
            return (
                <g transform="translate(370, 100)">
                    {/* Traditional Chinese hanging scroll */}
                    <rect x="-24" y="20" width="48" height="110" fill="#fafafa" stroke="#b45309" strokeWidth="3" />
                    <rect x="-28" y="15" width="56" height="7" fill="#78350f" rx="1.5" />
                    <rect x="-28" y="128" width="56" height="7" fill="#78350f" rx="1.5" />
                    {/* Elegant calligraphy "前程似锦" */}
                    <text x="0" y="47" fontSize="11" fontWeight="bold" fill="#212121" textAnchor="middle">前</text>
                    <text x="0" y="69" fontSize="11" fontWeight="bold" fill="#212121" textAnchor="middle">程</text>
                    <text x="0" y="91" fontSize="11" fontWeight="bold" fill="#212121" textAnchor="middle">似</text>
                    <text x="0" y="113" fontSize="11" fontWeight="bold" fill="#212121" textAnchor="middle">锦</text>
                </g>
            );
        case 'wall_paper_kite':
            return (
                <g transform="translate(370, 100)">
                    {/* Hanging wire */}
                    <line x1="0" y1="-100" x2="0" y2="20" stroke="#90a4ae" strokeWidth="1.5" />
                    {/* Elaborate yellow paper kite diamond frame */}
                    <polygon points="0,25 -26,55 0,95 26,55" fill="#ffe082" stroke="#b45309" strokeWidth="2.5" />
                    {/* Painted floral patterns */}
                    <circle cx="0" cy="55" r="6" fill="#f48fb1" />
                    <path d="M -15 50 Q 0 45 15 50" fill="none" stroke="#2e7d32" strokeWidth="1.5" />
                    {/* Long flowing orange tail ribbons */}
                    <path d="M -12 95 Q -22 135 -10 170" fill="none" stroke="#ff7043" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 12 95 Q 22 135 10 170" fill="none" stroke="#ff7043" strokeWidth="3" strokeLinecap="round" />
                </g>
            );
        default:
            return null;
    }
}

// Saved by Antigravity
