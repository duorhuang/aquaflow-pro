import React from 'react';

export function renderWallpaper(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-wallpaper">
            {/* Base wall fallback if needed */}
        </g>
    );
}

export function renderWindow(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-window" transform="translate(150, 200)">
        </g>
    );
}

export function renderWhiteboard(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-whiteboard" transform="translate(50, 150)">
        </g>
    );
}

export function renderCarpet(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-carpet" transform="translate(0, 700)">
        </g>
    );
}

export function renderLargeCabinet(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-large-cabinet" transform="translate(20, 450)">
        </g>
    );
}

export function renderCabinet(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-cabinet" transform="translate(600, 500)">
        </g>
    );
}

export function renderGroundLamp(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-ground-lamp" transform="translate(650, 650)">
        </g>
    );
}

export function renderBroadcaster(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-broadcaster" transform="translate(550, 400)">
        </g>
    );
}

export function renderDecorationFloor(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-decoration-floor" transform="translate(100, 680)">
        </g>
    );
}

export function renderDecorationWall(itemKey: string) {
    if (!itemKey) return null;
    return (
        <g id="layer-decoration-wall" transform="translate(650, 150)">
        </g>
    );
}
