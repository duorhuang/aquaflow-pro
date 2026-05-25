"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { AvatarRenderer } from "./AvatarRenderer";
import { 
    ShoppingBag, 
    Shirt, 
    Coins, 
    Sparkles, 
    Check, 
    Plus, 
    Trash2, 
    ShieldAlert, 
    Bookmark, 
    BookmarkCheck,
    ZoomIn,
    X,
    Sparkle,
    Download,
    Dices,
    Sun,
    Smile,
    Wand2,
    Layers,
    ChevronLeft,
    ChevronRight
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
    gender: string; // Restricts character bases: 'unisex' | 'shinchan' | 'minion' | ...
    description?: string;
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    basic: { label: "Common", color: "text-[#60a5fa]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20" },
    entry: { label: "Common", color: "text-[#60a5fa]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20" },
    advanced: { label: "Rare", color: "text-[#c084fc]", bg: "bg-[#7c3aed]/10", border: "border-[#7c3aed]/20" },
    rare: { label: "Rare", color: "text-[#c084fc]", bg: "bg-[#7c3aed]/10", border: "border-[#7c3aed]/20" },
    premium: { label: "Rare", color: "text-[#c084fc]", bg: "bg-[#7c3aed]/10", border: "border-[#7c3aed]/20" },
    legendary: { label: "Legendary", color: "text-[#fbcfe8]", bg: "bg-[#db2777]/10", border: "border-[#db2777]/20" },
    ultimate: { label: "Legendary", color: "text-[#fcd34d]", bg: "bg-[#ea580c]/10", border: "border-[#ea580c]/20" }
};

const SLOT_LABELS: Record<string, string> = {
    base: "预设",
    head: "帽子",
    eyes: "眼罩",
    body: "上装",
    lower: "裤子",
    feet: "鞋子",
    hand: "手持",
    background: "背景"
};

const CARTOON_BASES = [
    { id: "shinchan", name: "蜡笔小新", emoji: "🧒" },
    { id: "minion", name: "小黄人", emoji: "🍌" },
    { id: "loggervick", name: "光头强", emoji: "🌲" },
    { id: "ggbond", name: "猪猪侠", emoji: "🐷" },
    { id: "conan", name: "柯南", emoji: "👓" },
    { id: "octonauts", name: "巴克队长", emoji: "🐻" }
];

export function ShopAndCloset({ swimmerId, onUpdateSwimmer }: ShopAndClosetProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Loaded data from DB
    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [totalXp, setTotalXp] = useState(0);
    const [inventory, setInventory] = useState<string[]>([]);
    const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
    const [wishlist, setWishlist] = useState<string[]>([]);
    
    const [gender, setGender] = useState("shinchan"); // Active base character
    const [activeCharacter, setActiveCharacter] = useState<string>("shinchan"); // Preview active base
    const [swimmerName, setSwimmerName] = useState(""); // Swimmer name
    
    // Active Customizer Tab (Presets, Seasonal, Face, Cap, Shirt, Pants, Handheld)
    const [activeSlotTab, setActiveSlotTab] = useState<string>("base");

    // Temporary preview equipped state
    const [previewEquipped, setPreviewEquipped] = useState<Record<string, string>>({});
    const [isSavingEquip, setIsSavingEquip] = useState(false);
    const [equipSuccess, setEquipSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Purchase feedback state
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [inspectItem, setInspectItem] = useState<ShopItem | null>(null);

    // Ref to container for SVG download
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Show toast message helper
    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
    };

    // Load shop data
    const loadShopData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.shop.get(swimmerId);
            if (data) {
                setItems(data.items || []);
                setBalance(data.balance || 0);
                setTotalXp(data.totalXp || 0);
                setInventory(data.inventory || []);
                setEquippedItems(data.equippedItems || {});
                setPreviewEquipped(data.equippedItems || {});
                setWishlist(data.wishlist || []);
                
                // Get active character base & name from Swimmer profile
                const me = await api.auth.me();
                if (me) {
                    const baseChar = me.gender || "shinchan";
                    setGender(baseChar);
                    setActiveCharacter(baseChar);
                    setSwimmerName(me.name || "Swimmer");
                }
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err.message || "加载商城数据失败");
        } finally {
            setLoading(false);
        }
    }, [swimmerId]);

    useEffect(() => {
        loadShopData();
    }, [loadShopData]);

    // Handle purchase
    const handlePurchase = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (balance < item.price) {
            triggerToast("金币不足，赶紧完成训练攒XP吧！⚡");
            return;
        }

        setPurchasingId(itemId);
        try {
            const res = await api.shop.purchase(swimmerId, itemId);
            if (res && res.success) {
                setBalance(res.balance);
                setInventory(res.inventory);
                triggerToast(`成功兑换: ${item.name}！🎉`);
                if (onUpdateSwimmer) onUpdateSwimmer();
            } else {
                triggerToast(res?.error || "购买失败");
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            triggerToast(err.message || "购买失败");
        } finally {
            setPurchasingId(null);
        }
    };

    // Toggle items on Wishlist
    const handleToggleWishlist = async (itemId: string) => {
        const isInWishlist = wishlist.includes(itemId);
        try {
            if (isInWishlist) {
                const res = await api.shop.wishlistRemove(swimmerId, itemId);
                if (res && res.success) setWishlist(res.wishlist);
            } else {
                if (wishlist.length >= 3) {
                    triggerToast("心愿单已满 (最多3件)");
                    return;
                }
                const res = await api.shop.wishlistAdd(swimmerId, itemId);
                if (res && res.success) setWishlist(res.wishlist);
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            triggerToast(err.message || "操作心愿单失败");
        }
    };

    // Toggle equip item in preview
    const handlePreviewItem = (slot: string, itemId: string) => {
        const key = `${activeCharacter}_${slot}`;
        setPreviewEquipped(prev => ({
            ...prev,
            [key]: prev[key] === itemId ? "" : itemId // Toggle
        }));
    };

    // Save equipped layout to database
    const handleSaveEquipped = async () => {
        setIsSavingEquip(true);
        try {
            const res = await api.shop.equip(swimmerId, previewEquipped);
            await api.swimmers.update(swimmerId, { gender: activeCharacter });
            
            if (res && res.success) {
                setEquippedItems(res.equippedItems);
                setGender(activeCharacter);
                setEquipSuccess(true);
                triggerToast("装扮保存成功，已同步到主舞台！✨");
                setTimeout(() => setEquipSuccess(false), 2000);
                if (onUpdateSwimmer) onUpdateSwimmer();
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            triggerToast(err.message || "保存搭配方案失败");
        } finally {
            setIsSavingEquip(false);
        }
    };

    // Dynamic randomizer (Dices)
    const handleRandomize = () => {
        const slots = ["head", "eyes", "body", "lower", "feet", "hand"];
        const randomized: Record<string, string> = { ...previewEquipped };
        
        // Randomly select one active character base
        const randomBase = CARTOON_BASES[Math.floor(Math.random() * CARTOON_BASES.length)].id;
        setActiveCharacter(randomBase);
        
        slots.forEach(slot => {
            // Find owned items for this slot and character base
            const matchingOwned = items.filter(item => {
                if (!inventory.includes(item.id)) return false;
                if (item.slotType !== slot) return false;
                return item.gender === "unisex" || item.gender === randomBase;
            });
            
            const key = `${randomBase}_${slot}`;
            if (matchingOwned.length > 0 && Math.random() > 0.3) {
                const randomItem = matchingOwned[Math.floor(Math.random() * matchingOwned.length)];
                randomized[key] = randomItem.id;
            } else {
                randomized[key] = ""; // Keep default
            }
        });
        
        setPreviewEquipped(randomized);
        triggerToast("生成了趣味随机穿搭！🎲");
    };

    // Download dynamic SVG vector file
    const handleDownloadSvg = () => {
        if (!previewContainerRef.current) return;
        const svgElement = previewContainerRef.current.querySelector("svg");
        if (!svgElement) {
            triggerToast("导出失败，未找到矢量画布");
            return;
        }

        try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);
            
            // Add xml namespaces
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
            downloadLink.download = `qbit_swimmer_${swimmerName}_${activeCharacter}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
            triggerToast("专属 Qbit 矢量小人下载成功！📥");
        } catch (e) {
            triggerToast("导出失败，请重试");
        }
    };

    // Map character-prefixed DB items for AvatarRenderer
    const getEquippedItemsFull = (characterId: string) => {
        const fullEquipped: Record<string, ShopItem> = {};
        const slots = ["base", "head", "eyes", "body", "lower", "feet", "hand", "background"];
        slots.forEach(slot => {
            let itemId = previewEquipped[`${characterId}_${slot}`];
            if (!itemId) itemId = previewEquipped[slot];
            if (itemId) {
                const item = items.find(i => i.id === itemId);
                if (item) fullEquipped[slot] = item;
            }
        });
        return fullEquipped;
    };

    // Filter Items by Slot Tab
    const visibleShopItems = items.filter(item => {
        // Presets tab
        if (activeSlotTab === "base") {
            return item.slotType === "base";
        }
        // Seasonal / Summer Drop tab
        if (activeSlotTab === "seasonal") {
            return item.tier === "legendary" || item.tier === "ultimate";
        }
        // Faces / Skin tab (shows skin tone mock cards)
        if (activeSlotTab === "smile") {
            return false; // Rendered statically
        }
        
        // standard slot filter
        if (item.slotType !== activeSlotTab) return false;
        
        // base skin filter
        if (item.slotType === "base") return item.gender === activeCharacter;
        
        // unisex OR character exclusive
        return item.gender === "unisex" || item.gender === activeCharacter;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-[#0c0c0e] min-h-screen">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse text-yellow-500/80">正在进入 Qbit 创意工坊...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-3xl flex items-center gap-3 max-w-xl mx-auto my-12">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                    <h5 className="font-bold text-white">创意工坊连线失败</h5>
                    <p className="text-xs mt-1 text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-white p-4 md:p-6 flex flex-col justify-between font-sans relative overflow-hidden">
            {/* Top glowing ambient dots */}
            <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Custom Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#18181c] border border-yellow-500/30 text-white font-bold text-xs py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* HEADER BAR */}
            <div className="flex items-center justify-between py-2 border-b border-white/5 mb-6 z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent uppercase">
                        {swimmerName || "Yizi"}'s Qbit
                    </h1>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Currency XP Badges */}
                    <div className="flex items-center gap-1.5 bg-[#22170f]/90 border border-[#d97706]/35 text-[#fbbf24] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.15)] text-sm font-black transition-all hover:border-[#d97706]/60">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-base">{balance}</span>
                        <button 
                            className="w-5 h-5 flex items-center justify-center bg-[#f59f00] text-black hover:bg-[#ffe066] font-bold rounded-full ml-1.5 shadow transition-transform active:scale-90"
                            onClick={() => triggerToast("🏋️‍♂️ 努力训练并完成每日反馈，即可获得大量 XP 奖励！")}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Exit Close Button */}
                    <Link 
                        href="/workout" 
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all border border-white/5"
                        title="返回训练台"
                    >
                        <X className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* MAIN CORE DUAL-PANEL CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow z-10">
                
                {/* ==========================================
                    LEFT PANEL: SHOP & CLOSET CUSTOMIZER (60% Width)
                   ========================================== */}
                <div className="lg:col-span-7 bg-[#131317]/90 border border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden relative">
                    
                    {/* Themed Event Banner */}
                    <div className="bg-gradient-to-r from-[#201c38] via-[#1d263f] to-[#121c2c] border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">极速水下季正在进行中 (Summer Drop)</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">水下机甲与动漫精选装备限时开启 · 5月31日截止</p>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Icon-Driven Tab Bar */}
                    <div className="flex items-center gap-1.5 bg-[#09090b]/60 border border-white/5 p-1 rounded-2xl mb-5 overflow-x-auto scrollbar-none relative">
                        <button
                            onClick={() => setActiveSlotTab("base")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "base"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="角色预设"
                        >
                            <Wand2 className="w-4 h-4" />
                            <span>小人预设</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("seasonal")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "seasonal"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="限时特供"
                        >
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span>限时特供</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("smile")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "smile"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="肤色与表情"
                        >
                            <Smile className="w-4 h-4" />
                            <span>表情肤色</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("head")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "head"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="头部饰品"
                        >
                            <Sparkle className="w-4 h-4" />
                            <span>头部泳帽</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("body")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "body"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="上衣短袖"
                        >
                            <Shirt className="w-4 h-4" />
                            <span>时尚上装</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("lower")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "lower"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="裤子短裙"
                        >
                            <Layers className="w-4 h-4" />
                            <span>下肢泳裤</span>
                        </button>

                        <button
                            onClick={() => setActiveSlotTab("hand")}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl gap-1.5 transition-all text-xs font-bold shrink-0",
                                activeSlotTab === "hand"
                                    ? "bg-[#27272a] text-white shadow-lg border border-white/10"
                                    : "text-slate-400 hover:text-white"
                            )}
                            title="手持配件"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>手持训练</span>
                        </button>
                    </div>

                    {/* Grid list of customizer cards */}
                    <div className="flex-grow overflow-y-auto max-h-[50vh] lg:max-h-[55vh] pr-1 space-y-4">
                        {activeSlotTab === "smile" ? (
                            /* STATIC EXPRESSION & SKIN SELECTION (100% Quizizz Replica) */
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">肤色调整 (Skin tone)</h4>
                                    <div className="grid grid-cols-6 gap-3">
                                        {["#fdd1a2", "#fed7aa", "#fcc082", "#e2a970", "#b47a46", "#7c4e2b"].map((color, idx) => (
                                            <button 
                                                key={idx}
                                                className="aspect-square rounded-xl border border-white/10 transition-transform active:scale-95 shadow"
                                                style={{ backgroundColor: color }}
                                                onClick={() => triggerToast(`已完美适配 ${CARTOON_BASES.find(c => c.id === activeCharacter)?.name} 的经典手绘漫画肤色！🎨`)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-white/5 my-4" />

                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 font-sans">表情选择 (Expressions)</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { name: "经典专注", emoji: "🧒", desc: "专属专注姿态" },
                                            { name: "开心眨眼", emoji: "😉", desc: "俏皮眨眼姿态" },
                                            { name: "咧嘴坏笑", emoji: "😈", desc: "调皮搞怪姿态" },
                                            { name: "傲娇小猫", emoji: "😸", desc: "猫咪软萌姿态" }
                                        ].map((exp, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => triggerToast(`已自动匹配小人的经典漫画线描，确保百分百神还原！✨`)}
                                                className="bg-[#18181c] hover:bg-[#202025] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95"
                                            >
                                                <span className="text-3xl mb-2">{exp.emoji}</span>
                                                <h5 className="text-xs font-bold text-white">{exp.name}</h5>
                                                <span className="text-[9px] text-slate-500 mt-1 uppercase">{exp.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* DINAMIC SHOP GRID CARDS */
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                {visibleShopItems.map(item => {
                                    const isOwned = inventory.includes(item.id);
                                    const isEquippedInPreview = previewEquipped[`${activeCharacter}_${item.slotType}`] === item.id;
                                    const tier = TIER_LABELS[item.tier] || { label: "Common", color: "text-[#60a5fa]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20" };
                                    const canAfford = balance >= item.price;
                                    const isPurchasing = purchasingId === item.id;

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={cn(
                                                "bg-[#18181c]/60 border rounded-2xl p-3 flex flex-col justify-between space-y-3.5 transition-all group relative overflow-hidden",
                                                isEquippedInPreview ? "border-purple-500 bg-[#7c3aed]/5 shadow-[0_0_15px_rgba(124,58,237,0.1)]" : "border-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {/* Rarity Tag */}
                                            <div className="flex justify-between items-center z-10">
                                                <span className={cn("text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border shadow-sm", tier.color, tier.bg, tier.border)}>
                                                    {tier.label}
                                                </span>
                                                {!isOwned && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleWishlist(item.id);
                                                        }}
                                                        className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                                                        title="加入心愿单"
                                                    >
                                                        {wishlist.includes(item.id) ? (
                                                            <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                                        ) : (
                                                            <Bookmark className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dynamic Item Preview inside detailed container */}
                                            <div 
                                                className="aspect-square bg-[#0c0c0e] rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5 cursor-pointer transition-all hover:border-white/10 group/item"
                                                onClick={() => {
                                                    if (isOwned) {
                                                        handlePreviewItem(item.slotType, item.id);
                                                    } else {
                                                        setInspectItem(item);
                                                    }
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center text-white/90">
                                                        <ZoomIn className="w-6 h-6 mb-1 text-yellow-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">点击查看细节</span>
                                                    </div>
                                                </div>

                                                <AvatarRenderer 
                                                    gender={activeCharacter} 
                                                    equippedItems={{ [item.slotType]: item }} 
                                                    size={110} 
                                                    className="border-none bg-transparent shadow-none"
                                                    animated={false}
                                                />
                                            </div>

                                            {/* Item Name */}
                                            <div className="text-left">
                                                <h4 className="text-xs font-bold text-white line-clamp-1" title={item.name}>{item.name}</h4>
                                            </div>

                                            {/* Purchase/Equip Button */}
                                            {isOwned ? (
                                                <button
                                                    onClick={() => handlePreviewItem(item.slotType, item.id)}
                                                    className={cn(
                                                        "w-full py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1",
                                                        isEquippedInPreview
                                                            ? "bg-[#7c3aed] text-white shadow"
                                                            : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    {isEquippedInPreview ? (
                                                        <>
                                                            <Check className="w-3 h-3" />
                                                            <span>穿戴中</span>
                                                        </>
                                                    ) : (
                                                        <span>试穿</span>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePurchase(item.id)}
                                                    disabled={isPurchasing}
                                                    className={cn(
                                                        "w-full py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1",
                                                        canAfford 
                                                            ? "bg-[#eab308] hover:bg-[#fca5a5] hover:scale-[1.02] text-black" 
                                                            : "bg-white/5 text-slate-500 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isPurchasing ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Coins className="w-3.5 h-3.5" />
                                                    )}
                                                    <span className="font-mono">{isPurchasing ? "兑换中..." : `${item.price}`}</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}

                                {visibleShopItems.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl bg-[#09090b]/40">
                                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-20 text-yellow-500" />
                                        <p className="text-xs">未找到适配当前小人或对应选项卡的商品 🛒</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ==========================================
                    RIGHT PANEL: PEDESTAL STAGE (40% Width)
                   ========================================== */}
                <div className="lg:col-span-5 bg-[#131317]/90 border border-white/5 rounded-3xl p-6 flex flex-col justify-between items-center relative overflow-hidden min-h-[480px]">
                    {/* Stage background glow */}
                    <div className="absolute inset-0 bg-radial-gradient-stage opacity-20 pointer-events-none" />

                    {/* Spotlight light cone shining from top */}
                    <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-[240px] h-[360px] bg-gradient-to-b from-white/10 to-transparent blur-xl pointer-events-none" style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />

                    {/* 6 Cartoon Bases select bar (at the top of right stage panel for fast preview switching) */}
                    <div className="w-full flex items-center justify-between gap-1 p-1 bg-[#09090b]/60 border border-white/5 rounded-2xl z-10 mb-4 overflow-x-auto scrollbar-none">
                        {CARTOON_BASES.map(cb => {
                            const isCurrentBase = activeCharacter === cb.id;
                            const isEquippedBase = gender === cb.id;
                            return (
                                <button
                                    key={cb.id}
                                    onClick={() => setActiveCharacter(cb.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center px-3 py-2 rounded-xl text-center transition-all shrink-0 hover:scale-[1.03]",
                                        isCurrentBase 
                                            ? "bg-[#27272a] text-white shadow border border-white/10" 
                                            : "text-slate-400 hover:text-white"
                                    )}
                                    title={cb.name}
                                >
                                    <span className="text-xl mb-0.5">{cb.emoji}</span>
                                    <span className="text-[9px] font-black truncate max-w-[50px]">{cb.name}</span>
                                    {isEquippedBase && (
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Spotlight showcase space (The Pedestal) */}
                    <div className="relative flex-grow flex flex-col items-center justify-center mt-6 w-full z-10">
                        {/* Live Avatar Preview Container */}
                        <div ref={previewContainerRef} className="relative z-20 flex items-center justify-center transform hover:scale-[1.02] duration-300">
                            <AvatarRenderer 
                                gender={activeCharacter} 
                                equippedItems={getEquippedItemsFull(activeCharacter)} 
                                size={260} 
                                className="border-none bg-transparent shadow-none"
                            />
                        </div>

                        {/* Floating Action Buttons (Right side of the stage) */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
                            <button
                                onClick={handleDownloadSvg}
                                className="p-3 bg-[#1e1e24]/80 hover:bg-[#272730] text-slate-300 hover:text-white rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
                                title="下载我的 Qbit (SVG 矢量文件)"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRandomize}
                                className="p-3 bg-[#1e1e24]/80 hover:bg-[#272730] text-slate-300 hover:text-white rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
                                title="随机装扮"
                            >
                                <Dices className="w-4 h-4 text-purple-400 animate-pulse" />
                            </button>
                        </div>

                        {/* Pedestal Structure */}
                        <div className="w-[250px] h-[65px] bg-gradient-to-b from-[#18181c] to-[#08080a] border-t border-white/15 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative mt-[-10px]">
                            {/* Inner metallic layer highlight */}
                            <div className="absolute inset-1 border border-white/5 rounded-full opacity-60 pointer-events-none" />
                            {/* Stage spotlight glow underneath */}
                            <div className="absolute inset-x-8 top-1 bottom-8 bg-gradient-to-b from-white/15 to-transparent blur-md rounded-full opacity-70 pointer-events-none" />
                        </div>
                    </div>

                    {/* CONFIRM / SAVE BUTTON */}
                    <div className="w-full mt-6 z-10">
                        <button
                            onClick={handleSaveEquipped}
                            disabled={isSavingEquip}
                            className={cn(
                                "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border shadow-lg duration-150",
                                equipSuccess 
                                    ? "bg-emerald-500 border-emerald-400/20 text-white" 
                                    : "bg-white text-black hover:bg-slate-100 hover:scale-[1.02] border-transparent active:scale-98"
                            )}
                        >
                            {isSavingEquip ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : equipSuccess ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Shirt className="w-4 h-4" />
                            )}
                            {isSavingEquip ? "正在保存穿戴搭配..." : equipSuccess ? "搭配保存成功" : "保存我的搭配 (Save my Qbit)"}
                        </button>
                    </div>
                </div>

            </div>

            {/* Inspect Item Modal */}
            {inspectItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setInspectItem(null)}>
                    <div 
                        className="bg-[#18181c] border border-white/5 rounded-3xl p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-200 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
                            onClick={() => setInspectItem(null)}
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                        
                        <h3 className="text-lg font-black text-white text-center mb-1">{inspectItem.name}</h3>
                        <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest mb-6">
                            {SLOT_LABELS[inspectItem.slotType]} · {TIER_LABELS[inspectItem.tier]?.label}
                        </p>
                        
                        <div className="aspect-square bg-[#0c0c0e] rounded-2xl flex items-center justify-center mb-6 overflow-hidden border border-white/5">
                            <AvatarRenderer 
                                gender={activeCharacter} 
                                equippedItems={{ [inspectItem.slotType]: inspectItem }} 
                                size={300} 
                                className="border-none bg-transparent shadow-none"
                                animated={true}
                            />
                        </div>

                        {/* Price details inside modal */}
                        <div className="flex justify-between items-center bg-[#09090b]/50 border border-white/5 p-4 rounded-xl mb-6">
                            <span className="text-xs text-slate-400">兑换价格</span>
                            <span className="text-amber-400 font-bold font-mono text-base flex items-center gap-1">
                                <Coins className="w-4 h-4" /> {inspectItem.price} XP
                            </span>
                        </div>
                        
                        <button
                            onClick={() => {
                                handlePurchase(inspectItem.id);
                                setInspectItem(null);
                            }}
                            className={cn(
                                "w-full py-3 rounded-xl font-black text-xs transition-all uppercase tracking-wider",
                                balance >= inspectItem.price
                                    ? "bg-[#eab308] hover:bg-[#fbbf24] text-black"
                                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                            )}
                            disabled={balance < inspectItem.price}
                        >
                            {balance >= inspectItem.price ? "立即兑换入库" : "金币不足，赶紧去训练"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
