"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { AvatarRenderer } from "./AvatarRenderer";
import {
    Coins,
    Sparkles,
    Check,
    Plus,
    Bookmark,
    BookmarkCheck,
    ZoomIn,
    X,
    Download,
    Dices,
    Shirt,
    Footprints,
    Gem,
    Hand,
    Image as ImageIcon,
    User,
    Smile,
    Scissors,
    Palette,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ShopAndClosetProps {
    swimmerId: string;
    onUpdateSwimmer?: () => void;
}

interface ShopItem {
    id: string;
    name: string;
    price: number;
    slotType: string;
    tier: string;
    imageKey: string;
    category: string;
    gender: string;
    description?: string;
    previewColor?: string;
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    basic: { label: "Basic", color: "text-[#60a5fa]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20" },
    common: { label: "Common", color: "text-[#60a5fa]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20" },
    rare: { label: "Rare", color: "text-[#c084fc]", bg: "bg-[#7c3aed]/10", border: "border-[#7c3aed]/20" },
    legendary: { label: "Legendary", color: "text-[#fbbf24]", bg: "bg-[#eab308]/10", border: "border-[#eab308]/20" },
    ultimate: { label: "Ultimate", color: "text-[#f472b6]", bg: "bg-[#db2777]/10", border: "border-[#db2777]/20" },
};

const SKIN_TONES = [
    { id: "skin_fair", name: "Fair", color: "#fdd1a2" },
    { id: "skin_light", name: "Light", color: "#f5d0a9" },
    { id: "skin_medium", name: "Medium", color: "#e0b896" },
    { id: "skin_tan", name: "Tan", color: "#c69c6d" },
    { id: "skin_dark", name: "Dark", color: "#8d5524" },
    { id: "skin_deep", name: "Deep", color: "#5c3a21" },
];

const EXPRESSIONS = [
    { id: "expression_neutral", name: "Neutral" },
    { id: "expression_happy", name: "Happy" },
    { id: "expression_determined", name: "Determined" },
    { id: "expression_excited", name: "Excited" },
    { id: "expression_proud", name: "Proud" },
    { id: "expression_focused", name: "Focused" },
];

const TABS = [
    { id: "presets", label: "Presets", icon: Sparkles },
    { id: "face", label: "Face", icon: Smile },
    { id: "hair", label: "Hair", icon: Scissors },
    { id: "hat", label: "Hat", icon: User },
    { id: "top", label: "Top", icon: Shirt },
    { id: "bottom", label: "Bottom", icon: Footprints },
    { id: "shoes", label: "Shoes", icon: Footprints },
    { id: "accessory", label: "Accessory", icon: Gem },
    { id: "handheld", label: "Handheld", icon: Hand },
];

export function ShopAndCloset({ swimmerId, onUpdateSwimmer }: ShopAndClosetProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [totalXp, setTotalXp] = useState(0);
    const [inventory, setInventory] = useState<string[]>([]);
    const [equippedItems, setEquippedItems] = useState<Record<string, any>>({});
    const [wishlist, setWishlist] = useState<string[]>([]);

    const [gender, setGender] = useState<"male" | "female">("male");
    const [swimmerName, setSwimmerName] = useState("");
    const [activeTab, setActiveTab] = useState("presets");

    const [previewEquipped, setPreviewEquipped] = useState<Record<string, any>>({});
    const [isSavingEquip, setIsSavingEquip] = useState(false);
    const [equipSuccess, setEquipSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [inspectItem, setInspectItem] = useState<ShopItem | null>(null);

    const previewContainerRef = useRef<HTMLDivElement>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const loadShopData = useCallback(async (sid: string) => {
        setLoading(true);
        try {
            const data = await api.shop.get(sid);
            if (data) {
                setItems(data.items || []);
                setBalance(data.balance || 0);
                setTotalXp(data.totalXp || 0);
                setInventory(data.inventory || []);
                setEquippedItems(data.equippedItems || {});
                setPreviewEquipped(data.equippedItems || {});
                setWishlist(data.wishlist || []);

                const me = await api.auth.me();
                if (me) {
                    const g = me.gender === "female" ? "female" : "male";
                    setGender(g);
                    setSwimmerName(me.name || "Swimmer");
                }
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err.message || "Failed to load shop data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (swimmerId) loadShopData(swimmerId);
    }, [swimmerId]);

    const handlePurchase = async (itemId: string) => {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        if (balance < item.price) {
            triggerToast("Insufficient XP balance! Complete training to earn more.");
            return;
        }

        setPurchasingId(itemId);
        try {
            const res = await api.shop.purchase(swimmerId, itemId);
            if (res?.success) {
                setBalance(res.balance);
                setInventory(res.inventory);
                triggerToast(`Purchased: ${item.name}!`);
                if (onUpdateSwimmer) onUpdateSwimmer();
            } else {
                triggerToast(res?.error || "Purchase failed");
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            triggerToast(err.message || "Purchase failed");
        } finally {
            setPurchasingId(null);
        }
    };

    const handleToggleWishlist = async (itemId: string) => {
        const isInWishlist = wishlist.includes(itemId);
        try {
            if (isInWishlist) {
                const res = await api.shop.wishlistRemove(swimmerId, itemId);
                if (res?.success) setWishlist(res.wishlist);
            } else {
                if (wishlist.length >= 3) {
                    triggerToast("Wishlist is full (max 3 items)");
                    return;
                }
                const res = await api.shop.wishlistAdd(swimmerId, itemId);
                if (res?.success) setWishlist(res.wishlist);
            }
        } catch {
            triggerToast("Failed to update wishlist");
        }
    };

    const handleEquip = (slot: string, itemId: string | null) => {
        setPreviewEquipped((prev) => ({
            ...prev,
            [slot]: itemId || undefined,
        }));
    };

    const handleSaveEquipped = async () => {
        setIsSavingEquip(true);
        try {
            const res = await api.shop.equip(swimmerId, previewEquipped);
            await api.swimmers.update(swimmerId, { gender });

            if (res?.success) {
                setEquippedItems(res.equippedItems);
                setEquipSuccess(true);
                triggerToast("Outfit saved successfully!");
                setTimeout(() => setEquipSuccess(false), 2000);
                if (onUpdateSwimmer) onUpdateSwimmer();
            }
        } catch {
            triggerToast("Failed to save outfit");
        } finally {
            setIsSavingEquip(false);
        }
    };

    const handleRandomize = () => {
        const slots = ["skinTone", "expression", "hair", "hat", "top", "bottom", "shoes", "accessory", "handheld"];
        const randomized: Record<string, any> = { ...previewEquipped };

        slots.forEach((slot) => {
            const ownedItems = items.filter((item) => {
                if (!inventory.includes(item.id)) return false;
                if (item.slotType !== slot) return false;
                if (item.gender === "unisex" || item.gender === gender) return true;
                return false;
            });

            if (ownedItems.length > 0 && Math.random() > 0.3) {
                const randomItem = ownedItems[Math.floor(Math.random() * ownedItems.length)];
                randomized[slot] = randomItem;
            } else {
                delete randomized[slot];
            }
        });

        setPreviewEquipped(randomized);
        triggerToast("Random outfit generated!");
    };

    const handleDownloadSvg = () => {
        if (!previewContainerRef.current) return;
        const svgElement = previewContainerRef.current.querySelector("svg");
        if (!svgElement) {
            triggerToast("Export failed: no SVG canvas found");
            return;
        }

        try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);

            if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = `avatar_${swimmerName}_${gender}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
            triggerToast("Avatar SVG downloaded!");
        } catch {
            triggerToast("Export failed, please retry");
        }
    };

    // Filter visible shop items for the active tab
    const visibleShopItems = items.filter((item) => {
        if (activeTab === "presets") {
            return item.slotType === "specialSkin";
        }
        if (activeTab === "face") {
            return item.slotType === "skinTone" || item.slotType === "expression";
        }
        if (item.slotType !== activeTab) return false;
        return item.gender === "unisex" || item.gender === gender;
    });

    // Count owned items per slot for "Closet" badge
    const getOwnedCount = (slot: string) => {
        return items.filter((item) => inventory.includes(item.id) && item.slotType === slot).length;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-[#0c0c0e] min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-yellow-500/80">Loading Avatar Shop...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-3xl flex items-center gap-3 max-w-xl mx-auto my-12">
                <h5 className="font-bold text-white">Connection Failed</h5>
                <p className="text-xs text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#18181c] border border-yellow-500/30 text-white font-bold text-xs py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 z-10">
                <h1 className="text-lg md:text-xl font-black tracking-wide bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent uppercase">
                    {swimmerName}&apos;s Avatar
                </h1>
                <div className="flex items-center gap-3">
                    {/* Balance pill */}
                    <div className="flex items-center gap-1.5 bg-[#22170f]/90 border border-[#d97706]/35 text-[#fbbf24] px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.15)] text-sm font-black transition-all">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-base">{balance}</span>
                        <button
                            className="w-5 h-5 flex items-center justify-center bg-[#f59f00] text-black hover:bg-[#ffe066] font-bold rounded-full ml-1.5 shadow transition-transform active:scale-90"
                            onClick={() => triggerToast("Complete training and daily feedback to earn XP!")}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {/* Close */}
                    <Link
                        href="/workout"
                        className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all border border-white/5"
                        title="Back to Training"
                    >
                        <X className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* MAIN CONTENT — two-panel grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 md:p-6 overflow-hidden">
                {/* ==========================================
                    LEFT PANEL: Shop & Closet (60%)
                   ========================================== */}
                <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
                    {/* Icon-only tab bar */}
                    <div className="flex items-center gap-1 bg-[#131317] border border-white/5 p-1.5 rounded-2xl overflow-x-auto">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const owned = tab.id !== "presets" && tab.id !== "face" ? getOwnedCount(tab.id) : 0;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex items-center justify-center p-2.5 md:p-3 rounded-xl transition-all shrink-0",
                                        activeTab === tab.id
                                            ? "bg-[#27272a] text-white shadow-lg"
                                            : "text-slate-500 hover:text-white"
                                    )}
                                    title={tab.label}
                                >
                                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                    {owned > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-[8px] font-bold flex items-center justify-center">
                                            {owned}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Item grid area */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {/* Face tab: skin tones + expressions */}
                        {activeTab === "face" && (
                            <div className="space-y-6">
                                {/* Skin tone swatches */}
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3">Skin Tone</h4>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SKIN_TONES.map((tone) => {
                                            const isEquipped = previewEquipped.skinTone?.imageKey === tone.id || previewEquipped.skinTone === tone.id;
                                            return (
                                                <button
                                                    key={tone.id}
                                                    className={cn(
                                                        "aspect-square rounded-xl border-2 transition-all active:scale-95 shadow",
                                                        isEquipped
                                                            ? "border-white ring-2 ring-white/30"
                                                            : "border-transparent hover:border-white/20"
                                                    )}
                                                    style={{ backgroundColor: tone.color }}
                                                    title={tone.name}
                                                    onClick={() => handleEquip("skinTone", tone.id)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-white/5" />

                                {/* Expressions */}
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3">Expression</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {EXPRESSIONS.map((exp) => {
                                            const isEquipped = previewEquipped.expression?.imageKey === exp.id || previewEquipped.expression === exp.id;
                                            return (
                                                <button
                                                    key={exp.id}
                                                    className={cn(
                                                        "bg-[#18181c] border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all active:scale-95",
                                                        isEquipped
                                                            ? "border-purple-500 bg-[#7c3aed]/10"
                                                            : "border-white/5 hover:border-white/15"
                                                    )}
                                                    onClick={() => handleEquip("expression", exp.id)}
                                                >
                                                    <AvatarRenderer
                                                        gender={gender}
                                                        equippedItems={{ expression: { imageKey: exp.id, slotType: "expression" } }}
                                                        size={64}
                                                        className="border-none bg-transparent mb-2"
                                                        animated={false}
                                                    />
                                                    <span className="text-xs font-bold text-white">{exp.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Presets tab: special skins + gender selector */}
                        {activeTab === "presets" && (
                            <div className="space-y-6">
                                {/* Gender selector */}
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3">Character Base</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(["male", "female"] as const).map((g) => (
                                            <button
                                                key={g}
                                                className={cn(
                                                    "bg-[#18181c] border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all active:scale-95",
                                                    gender === g
                                                        ? "border-purple-500 bg-[#7c3aed]/10"
                                                        : "border-white/5 hover:border-white/15"
                                                )}
                                                onClick={() => setGender(g)}
                                            >
                                                <AvatarRenderer
                                                    gender={g}
                                                    equippedItems={previewEquipped}
                                                    size={100}
                                                    className="border-none bg-transparent"
                                                    animated={false}
                                                />
                                                <span className="text-xs font-bold text-white capitalize">{g}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-white/5" />

                                {/* Special skins */}
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3">Special Skins</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {visibleShopItems.map((item) => {
                                            const isOwned = inventory.includes(item.id);
                                            const isEquipped = previewEquipped.specialSkin?.imageKey === item.imageKey;
                                            const tier = TIER_CONFIG[item.tier] || TIER_CONFIG.basic;
                                            const canAfford = balance >= item.price;
                                            const isPurchasing = purchasingId === item.id;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "bg-[#18181c] border rounded-2xl p-3 flex flex-col gap-2.5 transition-all",
                                                        isEquipped
                                                            ? "border-purple-500 bg-[#7c3aed]/5"
                                                            : "border-white/5 hover:border-white/15"
                                                    )}
                                                >
                                                    {/* Rarity badge + wishlist */}
                                                    <div className="flex justify-between items-center">
                                                        <span className={cn("text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full border", tier.color, tier.bg, tier.border)}>
                                                            {tier.label}
                                                        </span>
                                                        {!isOwned && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleToggleWishlist(item.id); }} className="text-slate-500 hover:text-amber-400 transition-colors">
                                                                {wishlist.includes(item.id) ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Preview */}
                                                    <div
                                                        className="aspect-square bg-[#0c0c0e] rounded-xl flex items-center justify-center border border-white/5 cursor-pointer overflow-hidden"
                                                        onClick={() => { if (!isOwned) setInspectItem(item); }}
                                                    >
                                                        <AvatarRenderer
                                                            gender={gender}
                                                            equippedItems={{ specialSkin: { imageKey: item.imageKey, slotType: "specialSkin" } }}
                                                            size={120}
                                                            className="border-none bg-transparent"
                                                            animated={false}
                                                        />
                                                    </div>

                                                    <span className="text-[11px] font-bold text-white truncate">{item.name}</span>

                                                    {isOwned ? (
                                                        <button
                                                            onClick={() => handleEquip("specialSkin", isEquipped ? null : item.imageKey)}
                                                            className={cn(
                                                                "w-full py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1",
                                                                isEquipped
                                                                    ? "bg-[#7c3aed] text-white"
                                                                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {isEquipped ? <><Check className="w-3 h-3" /> Equipped</> : "Equip"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePurchase(item.id)}
                                                            disabled={isPurchasing || !canAfford}
                                                            className={cn(
                                                                "w-full py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1",
                                                                canAfford
                                                                    ? "bg-[#eab308] text-black hover:bg-[#fbbf24]"
                                                                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                                                            )}
                                                        >
                                                            {isPurchasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Coins className="w-3.5 h-3.5" />}
                                                            <span className="font-mono">{item.price}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard slot tabs (hair, hat, top, bottom, shoes, accessory, handheld) */}
                        {!["presets", "face"].includes(activeTab) && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {visibleShopItems.map((item) => {
                                    const isOwned = inventory.includes(item.id);
                                    const isEquipped = previewEquipped[activeTab]?.imageKey === item.imageKey || previewEquipped[activeTab] === item.id;
                                    const tier = TIER_CONFIG[item.tier] || TIER_CONFIG.basic;
                                    const canAfford = balance >= item.price;
                                    const isPurchasing = purchasingId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "bg-[#18181c] border rounded-2xl p-3 flex flex-col gap-2.5 transition-all",
                                                isEquipped
                                                    ? "border-purple-500 bg-[#7c3aed]/5"
                                                    : "border-white/5 hover:border-white/15"
                                            )}
                                        >
                                            {/* Rarity badge + wishlist */}
                                            <div className="flex justify-between items-center">
                                                <span className={cn("text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full border", tier.color, tier.bg, tier.border)}>
                                                    {tier.label}
                                                </span>
                                                {!isOwned && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleToggleWishlist(item.id); }} className="text-slate-500 hover:text-amber-400 transition-colors">
                                                        {wishlist.includes(item.id) ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Preview */}
                                            <div
                                                className="aspect-square bg-[#0c0c0e] rounded-xl flex items-center justify-center border border-white/5 cursor-pointer overflow-hidden relative group"
                                                onClick={() => {
                                                    if (isOwned) {
                                                        handleEquip(activeTab, isEquipped ? null : item.imageKey);
                                                    } else {
                                                        setInspectItem(item);
                                                    }
                                                }}
                                            >
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <ZoomIn className="w-5 h-5 text-white/80" />
                                                </div>
                                                <AvatarRenderer
                                                    gender={gender}
                                                    equippedItems={{ [activeTab]: item }}
                                                    size={110}
                                                    className="border-none bg-transparent"
                                                    animated={false}
                                                />
                                            </div>

                                            <span className="text-[11px] font-bold text-white truncate">{item.name}</span>

                                            {isOwned ? (
                                                <button
                                                    onClick={() => handleEquip(activeTab, isEquipped ? null : item.imageKey)}
                                                    className={cn(
                                                        "w-full py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1",
                                                        isEquipped
                                                            ? "bg-[#7c3aed] text-white"
                                                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                                                    )}
                                                >
                                                    {isEquipped ? <><Check className="w-3 h-3" /> Equipped</> : "Equip"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePurchase(item.id)}
                                                    disabled={isPurchasing || !canAfford}
                                                    className={cn(
                                                        "w-full py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1",
                                                        canAfford
                                                            ? "bg-[#eab308] text-black hover:bg-[#fbbf24]"
                                                            : "bg-white/5 text-slate-500 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isPurchasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Coins className="w-3.5 h-3.5" />}
                                                    <span className="font-mono">{item.price}</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}

                                {visibleShopItems.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl bg-[#09090b]/40">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">No items found in this category</p>
                                        <p className="text-xs text-slate-600 mt-1">Run the seed script to populate shop items</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ==========================================
                    RIGHT PANEL: Pedestal Stage (40%)
                   ========================================== */}
                <div className="lg:col-span-5 bg-[#131317] border border-white/5 rounded-3xl flex flex-col items-center relative overflow-hidden min-h-[480px]">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

                    {/* Spotlight cone */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[300px] bg-gradient-to-b from-white/8 to-transparent blur-xl pointer-events-none" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)" }} />

                    {/* Avatar preview */}
                    <div className="flex-1 flex items-center justify-center w-full pt-8 z-10">
                        <div ref={previewContainerRef} className="relative transition-transform duration-300 hover:scale-[1.02]">
                            <AvatarRenderer
                                gender={gender}
                                equippedItems={previewEquipped}
                                size={260}
                                className="border-none bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Floating action buttons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                        <button
                            onClick={handleDownloadSvg}
                            className="p-2.5 bg-[#1e1e24]/80 hover:bg-[#272730] text-slate-400 hover:text-white rounded-full border border-white/10 shadow-xl transition-all hover:scale-110 active:scale-95"
                            title="Download SVG"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRandomize}
                            className="p-2.5 bg-[#1e1e24]/80 hover:bg-[#272730] text-slate-400 hover:text-white rounded-full border border-white/10 shadow-xl transition-all hover:scale-110 active:scale-95"
                            title="Randomize"
                        >
                            <Dices className="w-4 h-4 text-purple-400" />
                        </button>
                    </div>

                    {/* Pedestal base */}
                    <div className="w-[200px] h-[50px] bg-gradient-to-b from-[#1e1e24] to-[#0a0a0e] border-t border-white/10 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative mb-6 mt-[-8px]">
                        <div className="absolute inset-x-6 top-1 bottom-6 bg-gradient-to-b from-white/10 to-transparent blur-md rounded-full opacity-60 pointer-events-none" />
                    </div>

                    {/* Save button */}
                    <div className="w-full px-4 pb-4 z-10">
                        <button
                            onClick={handleSaveEquipped}
                            disabled={isSavingEquip}
                            className={cn(
                                "w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border shadow-lg",
                                equipSuccess
                                    ? "bg-emerald-500 border-emerald-400/20 text-white"
                                    : "bg-white text-black hover:bg-slate-100 border-transparent"
                            )}
                        >
                            {isSavingEquip ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : equipSuccess ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Shirt className="w-4 h-4" />
                            )}
                            {isSavingEquip ? "Saving..." : equipSuccess ? "Saved!" : "Save My Avatar"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inspect Item Modal */}
            {inspectItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setInspectItem(null)}>
                    <div
                        className="bg-[#18181c] border border-white/5 rounded-3xl p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-200 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setInspectItem(null)}
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>

                        <h3 className="text-base font-black text-white text-center mb-1">{inspectItem.name}</h3>
                        <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-4">
                            {inspectItem.slotType} · {TIER_CONFIG[inspectItem.tier]?.label || inspectItem.tier}
                        </p>

                        <div className="aspect-square bg-[#0c0c0e] rounded-2xl flex items-center justify-center mb-4 overflow-hidden border border-white/5">
                            <AvatarRenderer
                                gender={gender}
                                equippedItems={{ [inspectItem.slotType]: inspectItem }}
                                size={200}
                                className="border-none bg-transparent"
                                animated={true}
                            />
                        </div>

                        <div className="flex justify-between items-center bg-[#09090b]/50 border border-white/5 p-3 rounded-xl mb-4">
                            <span className="text-xs text-slate-400">Price</span>
                            <span className="text-amber-400 font-bold font-mono text-sm flex items-center gap-1">
                                <Coins className="w-4 h-4" /> {inspectItem.price} XP
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                handlePurchase(inspectItem.id);
                                setInspectItem(null);
                            }}
                            className={cn(
                                "w-full py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider",
                                balance >= inspectItem.price
                                    ? "bg-[#eab308] hover:bg-[#fbbf24] text-black"
                                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                            )}
                            disabled={balance < inspectItem.price}
                        >
                            {balance >= inspectItem.price ? "Purchase" : "Insufficient XP"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
