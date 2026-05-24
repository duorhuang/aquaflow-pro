"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    Sparkle
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    gender: string; // The character restriction: 'unisex' | 'shinchan' | 'minion' | ...
    description?: string;
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    basic: { label: "🟢 普通档", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    entry: { label: "🔵 入门档", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    advanced: { label: "🟣 进阶档", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    premium: { label: "🟠 高级档", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    legendary: { label: "🔴 传说档", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    ultimate: { label: "👑 殿堂档", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
};

const SLOT_LABELS: Record<string, string> = {
    base: "🎭 皮肤",
    head: "🧢 头部",
    eyes: "🥽 眼部",
    body: "👕 身体",
    lower: "🩳 下肢",
    feet: "🦶 脚部",
    hand: "✋ 手持",
    background: "🏊 背景"
};

const CARTOON_BASES = [
    { id: "shinchan", name: "蜡笔小新", emoji: "🧒", desc: "经典粗眉，活泼调皮" },
    { id: "minion", name: "小黄人", emoji: "🍌", desc: "呆萌单眼，超能胶囊" },
    { id: "loggervick", name: "光头强", emoji: "🌲", desc: "安全帽强哥，伐木达人" },
    { id: "ggbond", name: "猪猪侠", emoji: "🐷", desc: "红衣大侠，正义之光" },
    { id: "conan", name: "柯南", emoji: "👓", desc: "智商超群，蓝衣侦探" },
    { id: "octonauts", name: "巴克队长", emoji: "🐻", desc: "英勇舰长，极地白熊" }
];

export function ShopAndCloset({ swimmerId, onUpdateSwimmer }: ShopAndClosetProps) {
    const [activeTab, setActiveTab] = useState<"shop" | "closet">("shop");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Loaded data from api.shop.get()
    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [totalXp, setTotalXp] = useState(0);
    const [inventory, setInventory] = useState<string[]>([]);
    const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [gender, setGender] = useState("shinchan"); // The Swimmer.gender field stores active base character!
    const [activeCharacter, setActiveCharacter] = useState<string>("shinchan"); // Closet active base preview

    // Filtering states
    const [selectedSlot, setSelectedSlot] = useState<string>("all");
    const [selectedTier, setSelectedTier] = useState<string>("all");

    // Temporary equip state (for closet preview, containing prefixed keys like 'shinchan_head')
    const [previewEquipped, setPreviewEquipped] = useState<Record<string, string>>({});
    const [isSavingEquip, setIsSavingEquip] = useState(false);
    const [equipSuccess, setEquipSuccess] = useState(false);

    // Purchase feedback states
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState("");
    
    // Inspect item state
    const [inspectItem, setInspectItem] = useState<ShopItem | null>(null);

    // Fetch shop data
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
                
                // Get active character base from Swimmer profile (gender column)
                const me = await api.auth.me();
                if (me) {
                    const baseChar = me.gender || "shinchan";
                    setGender(baseChar);
                    setActiveCharacter(baseChar);
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
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                loadShopData();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [loadShopData]);

    // Handle purchase
    const handlePurchase = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        if (balance < item.price) {
            setPurchaseError("XP余额不足，加油训练攒经验吧！");
            setTimeout(() => setPurchaseError(""), 3000);
            return;
        }

        setPurchasingId(itemId);
        try {
            const res = await api.shop.purchase(swimmerId, itemId);
            if (res && res.success) {
                // Update local state
                setBalance(res.balance);
                setInventory(res.inventory);
                if (onUpdateSwimmer) onUpdateSwimmer();
            } else {
                setPurchaseError(res?.error || "购买失败");
                setTimeout(() => setPurchaseError(""), 3000);
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setPurchaseError(err.message || "购买失败");
            setTimeout(() => setPurchaseError(""), 3000);
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
                    setPurchaseError("心愿单已满 (最多3件)");
                    setTimeout(() => setPurchaseError(""), 3000);
                    return;
                }
                const res = await api.shop.wishlistAdd(swimmerId, itemId);
                if (res && res.success) setWishlist(res.wishlist);
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setPurchaseError(err.message || "操作心愿单失败");
            setTimeout(() => setPurchaseError(""), 3000);
        }
    };

    // Closet: Select item to preview (character prefixed mapping)
    const handlePreviewItem = (slot: string, itemId: string) => {
        const key = `${activeCharacter}_${slot}`;
        setPreviewEquipped(prev => ({
            ...prev,
            [key]: prev[key] === itemId ? "" : itemId // Toggle equip
        }));
    };

    // Closet: Save equipped items & active base character to database
    const handleSaveEquipped = async () => {
        setIsSavingEquip(true);
        try {
            // 1. Save equipped mapping (with character-prefixed keys)
            const res = await api.shop.equip(swimmerId, previewEquipped);
            
            // 2. Save active base character selection in swimmer profile (gender column)
            await api.swimmers.update(swimmerId, { gender: activeCharacter });
            
            if (res && res.success) {
                setEquippedItems(res.equippedItems);
                setGender(activeCharacter);
                setEquipSuccess(true);
                setTimeout(() => setEquipSuccess(false), 2000);
                if (onUpdateSwimmer) onUpdateSwimmer();
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setPurchaseError(err.message || "保存搭配方案失败");
            setTimeout(() => setPurchaseError(""), 3000);
        } finally {
            setIsSavingEquip(false);
        }
    };

    // Map character-prefixed database item IDs to full ShopItem objects for AvatarRenderer
    const getEquippedItemsFull = (characterId: string) => {
        const fullEquipped: Record<string, ShopItem> = {};
        const slots = ["base", "head", "eyes", "body", "lower", "feet", "hand", "background"];
        slots.forEach(slot => {
            // First look up specific key: e.g. 'shinchan_head'
            let itemId = previewEquipped[`${characterId}_${slot}`];
            // Fall back to generic key (for simple legacy/universal support)
            if (!itemId) {
                itemId = previewEquipped[slot];
            }
            if (itemId) {
                const item = items.find(i => i.id === itemId);
                if (item) fullEquipped[slot] = item;
            }
        });
        return fullEquipped;
    };

    // Filter Shop Items to only show unisex items OR items matching currently activeCharacter
    const visibleShopItems = items.filter(item => {
        // 1. Slot Filter
        if (selectedSlot !== "all" && item.slotType !== selectedSlot) return false;
        // 2. Tier Filter
        if (selectedTier !== "all" && item.tier !== selectedTier) return false;
        
        // 3. Skins/Characters filter: base skins only show for activeCharacter
        if (item.slotType === "base") {
            return item.gender === activeCharacter;
        }
        
        // 4. Character exclusive check: unisex OR active character exclusive items
        return item.gender === "unisex" || item.gender === activeCharacter;
    });

    // Filter Closet Items (Owned) to show items matching activeCharacter or unisex
    const visibleClosetItems = items.filter(item => {
        // 1. Must be owned (in swimmer inventory)
        if (!inventory.includes(item.id)) return false;
        // 2. Slot Filter
        if (selectedSlot !== "all" && item.slotType !== selectedSlot) return false;
        
        // 3. Base skins only show for activeCharacter
        if (item.slotType === "base") {
            return item.gender === activeCharacter;
        }
        
        // 4. Matches active character base
        return item.gender === "unisex" || item.gender === activeCharacter;
    });

    // Wishlist details
    const wishlistItems = items.filter(item => wishlist.includes(item.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">正在进入水下商城...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-3xl flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                    <h5 className="font-bold">加载商城失败</h5>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header: XP & Gold balance dashboard */}
            <div className="bg-gradient-to-br from-yellow-500/10 via-amber-600/10 to-slate-900 border border-yellow-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.05)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                            <Coins className="w-4 h-4" /> 账户资产
                        </h3>
                        <p className="text-3xl font-mono font-bold text-white flex items-baseline gap-1">
                            {balance} <span className="text-xs font-sans text-muted-foreground font-normal">可用 XP 余额</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">累计荣誉值</span>
                        <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                            🏅 {totalXp} Total XP
                        </p>
                    </div>
                </div>

                {purchaseError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                        <span>{purchaseError}</span>
                    </div>
                )}
            </div>

            {/* 3-slot Wishlist Progress Cards */}
            {wishlistItems.length > 0 && activeTab === "shop" && (
                <div className="space-y-3">
                    <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 我的心愿单 ({wishlistItems.length}/3)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {wishlistItems.map(item => {
                            const needed = item.price - balance;
                            const progress = Math.min(100, Math.round((balance / item.price) * 100));
                            const tier = TIER_LABELS[item.tier] || { label: "普通", color: "text-white", bg: "bg-white/5", border: "border-white/10" };

                            return (
                                <div key={item.id} className="bg-card/40 border border-border rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={cn("text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold", tier.color, tier.bg, tier.border)}>
                                                {tier.label}
                                            </span>
                                            <h5 className="text-xs font-bold text-white mt-2 truncate max-w-[120px]">{item.name}</h5>
                                        </div>
                                        <button 
                                            onClick={() => handleToggleWishlist(item.id)}
                                            className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded-lg"
                                            title="移出心愿单"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-muted-foreground">心愿达成率</span>
                                            <span className="font-mono text-white font-bold">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] pt-1">
                                            <span className="text-muted-foreground">价格: {item.price} XP</span>
                                            {needed > 0 ? (
                                                <span className="text-amber-500 font-bold">还差 {needed} XP</span>
                                            ) : (
                                                <span className="text-green-400 font-bold flex items-center gap-0.5">
                                                    <Check className="w-2.5 h-2.5" /> 可购买
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {needed <= 0 && !inventory.includes(item.id) && (
                                        <button 
                                            onClick={() => handlePurchase(item.id)}
                                            className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            <ShoppingBag className="w-3 h-3" /> 立即兑换
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 bg-card/30 border border-border p-1.5 rounded-2xl shrink-0">
                <button
                    onClick={() => setActiveTab("shop")}
                    className={cn(
                        "py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === "shop"
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "text-muted-foreground hover:text-white"
                    )}
                >
                    <ShoppingBag className="w-4 h-4" />
                    🛒 积分商城 (Avatar Shop)
                </button>
                <button
                    onClick={() => setActiveTab("closet")}
                    className={cn(
                        "py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === "closet"
                            ? "bg-purple-500 text-white shadow-lg"
                            : "text-muted-foreground hover:text-white"
                    )}
                >
                    <Shirt className="w-4 h-4" />
                    👕 我的衣橱 (Wardrobe)
                </button>
            </div>

            {/* 6 CARTOON BASES SELECTOR (卡通角色选择器 - 商城和衣橱均显示，提供极速动态切换) */}
            <div className="space-y-2">
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Sparkle className="w-3.5 h-3.5 text-purple-400" /> 选择你的动漫伙伴 (Select Cartoon Base)
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {CARTOON_BASES.map(cb => {
                        const isCurrentBase = activeCharacter === cb.id;
                        const isEquippedBase = gender === cb.id;
                        return (
                            <button
                                key={cb.id}
                                onClick={() => {
                                    setActiveCharacter(cb.id);
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all relative overflow-hidden group hover:scale-[1.03] duration-150",
                                    isCurrentBase 
                                        ? "border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-white"
                                )}
                            >
                                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{cb.emoji}</span>
                                <span className="text-xs font-bold truncate max-w-full">{cb.name}</span>
                                {isEquippedBase && (
                                    <span className="absolute bottom-1 right-2 text-[7px] text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/20">
                                        已选定
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENT VIEWS */}
            {activeTab === "shop" ? (
                // ====================
                // 1. SHOP FRONTEND SCREEN
                // ====================
                <div className="space-y-4">
                    {/* Filters (Slot & Price Tier) */}
                    <div className="flex flex-wrap gap-2 items-center bg-card/20 border border-border/50 rounded-2xl p-4">
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedSlot("all")}
                                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", selectedSlot === "all" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                            >
                                全部槽位
                            </button>
                            {Object.entries(SLOT_LABELS).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSlot(key)}
                                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", selectedSlot === key ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="w-full border-t border-border/20 my-1.5" />

                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedTier("all")}
                                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", selectedTier === "all" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                            >
                                全部档位
                            </button>
                            {Object.entries(TIER_LABELS).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTier(key)}
                                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-transparent", selectedTier === key ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shop Grid list */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {visibleShopItems.map(item => {
                            const isOwned = inventory.includes(item.id);
                            const isInWishlist = wishlist.includes(item.id);
                            const tier = TIER_LABELS[item.tier] || { label: "普通", color: "text-white", bg: "bg-white/5", border: "border-white/10" };
                            const canAfford = balance >= item.price;
                            const isPurchasing = purchasingId === item.id;

                            return (
                                <div 
                                    key={item.id} 
                                    className={cn(
                                        "bg-card/30 border rounded-3xl p-4 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all relative overflow-hidden group",
                                        isOwned ? "opacity-75" : ""
                                    )}
                                >
                                    {/* Slot & Wishlist Badge */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-muted-foreground px-2 py-0.5 bg-white/5 rounded-full">
                                            {SLOT_LABELS[item.slotType] || item.category}
                                        </span>
                                        {!isOwned && (
                                            <button 
                                                onClick={() => handleToggleWishlist(item.id)}
                                                className="text-muted-foreground hover:text-amber-400 transition-colors p-1"
                                                title={isInWishlist ? "移出心愿单" : "加入心愿单"}
                                            >
                                                {isInWishlist ? (
                                                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Preview Renderer (Single Item Preview Box) */}
                                    <div 
                                        className="aspect-square bg-slate-950/50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5 cursor-pointer hover:border-white/20 transition-all group/inspect"
                                        onClick={() => setInspectItem(item)}
                                    >
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/inspect:opacity-100 transition-opacity z-30 backdrop-blur-sm">
                                            <div className="flex flex-col items-center text-white/90">
                                                <ZoomIn className="w-8 h-8 mb-2" />
                                                <span className="text-xs font-bold">点击放大查看细节</span>
                                            </div>
                                        </div>
                                        <AvatarRenderer 
                                            gender={activeCharacter} 
                                            equippedItems={{ [item.slotType]: item }} 
                                            size={120} 
                                            className="border-none bg-transparent"
                                            animated={false}
                                        />
                                        
                                        {/* Golden shine on Tier tags */}
                                        <div className="absolute top-2 left-2 z-20">
                                            <span className={cn("text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border", tier.color, tier.bg, tier.border)}>
                                                {tier.label.split(" ")[1] || tier.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Name & price detail */}
                                    <div>
                                        <h4 className="text-xs font-bold text-white line-clamp-1" title={item.name}>{item.name}</h4>
                                        <div className="flex items-center gap-1 mt-1 text-amber-400 font-mono text-xs font-bold">
                                            <span>⚡ {item.price} XP</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isOwned ? (
                                        <div className="text-[10px] text-green-400 font-bold text-center py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> 已拥有
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item.id)}
                                            disabled={isPurchasing}
                                            className={cn(
                                                "w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                                canAfford 
                                                    ? "bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-[1.02]" 
                                                    : "bg-white/5 text-muted-foreground cursor-not-allowed"
                                            )}
                                        >
                                            {isPurchasing ? (
                                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                            )}
                                            {isPurchasing ? "兑换中..." : "购买并入库"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {visibleShopItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">没有找到适配 {CARTOON_BASES.find(c => c.id === activeCharacter)?.name} 的该类别商品 🛒</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // ====================
                // 2. WARDROBE / CLOSET SCREEN
                // ====================
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Avatar Live preview card */}
                    <div className="md:col-span-1 bg-card/30 border border-border rounded-3xl p-6 flex flex-col items-center space-y-4">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">👚 3D 试衣镜 PREVIEW</h4>
                        
                        <AvatarRenderer 
                            gender={activeCharacter} 
                            equippedItems={getEquippedItemsFull(activeCharacter)} 
                            size={240} 
                        />

                        {/* Equipped list readout */}
                        <div className="w-full space-y-1.5 pt-2">
                            {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                                const itemId = previewEquipped[`${activeCharacter}_${slot}`] || previewEquipped[slot];
                                const item = items.find(i => i.id === itemId);
                                return (
                                    <div key={slot} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-bold text-white truncate max-w-[120px]">
                                            {item ? item.name : <span className="text-muted-foreground/30 font-normal">默认</span>}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save outfit button */}
                        <button
                            onClick={handleSaveEquipped}
                            disabled={isSavingEquip}
                            className={cn(
                                "w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                equipSuccess 
                                    ? "bg-green-500 text-white" 
                                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg"
                            )}
                        >
                            {isSavingEquip ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : equipSuccess ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Shirt className="w-4 h-4" />
                            )}
                            {isSavingEquip ? "保存穿戴中..." : equipSuccess ? "搭配已同步至服务器" : "保存当前角色搭配"}
                        </button>
                    </div>

                    {/* Right: Owned inventory categorized list */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-card/20 border border-border/50 rounded-2xl p-4 flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedSlot("all")}
                                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", selectedSlot === "all" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                            >
                                全部拥有
                            </button>
                            {Object.entries(SLOT_LABELS).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSlot(key)}
                                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", selectedSlot === key ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {/* Default basic items reset (for head & eyes) */}
                            {(selectedSlot === "all" || selectedSlot === "head") && (
                                <div 
                                    onClick={() => handlePreviewItem("head", "")}
                                    className={cn(
                                        "bg-card/10 border rounded-2xl p-3 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-white/20 transition-all text-center h-28 relative",
                                        !previewEquipped[`${activeCharacter}_head`] ? "border-purple-500/50 bg-purple-500/5" : "border-white/5"
                                    )}
                                >
                                    <span className="text-xl">🧢</span>
                                    <h5 className="text-[10px] font-bold text-white">默认泳帽</h5>
                                    <span className="text-[8px] text-muted-foreground uppercase">队服标准件</span>
                                    {!previewEquipped[`${activeCharacter}_head`] && <Check className="w-3.5 h-3.5 text-purple-400 absolute top-1 right-2" />}
                                </div>
                            )}

                            {(selectedSlot === "all" || selectedSlot === "eyes") && (
                                <div 
                                    onClick={() => handlePreviewItem("eyes", "")}
                                    className={cn(
                                        "bg-card/10 border rounded-2xl p-3 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-white/20 transition-all text-center h-28 relative",
                                        !previewEquipped[`${activeCharacter}_eyes`] ? "border-purple-500/50 bg-purple-500/5" : "border-white/5"
                                    )}
                                >
                                    <span className="text-xl">🥽</span>
                                    <h5 className="text-[10px] font-bold text-white">默认泳镜</h5>
                                    <span className="text-[8px] text-muted-foreground uppercase">队服标准件</span>
                                    {!previewEquipped[`${activeCharacter}_eyes`] && <Check className="w-3.5 h-3.5 text-purple-400 absolute top-1 right-2" />}
                                </div>
                            )}

                            {/* Owned purchased items matching the active character base */}
                            {visibleClosetItems.map(item => {
                                const isEquippedInPreview = previewEquipped[`${activeCharacter}_${item.slotType}`] === item.id;
                                const tier = TIER_LABELS[item.tier] || { label: "普通", color: "text-white", bg: "bg-white/5", border: "border-white/10" };

                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => handlePreviewItem(item.slotType, item.id)}
                                        className={cn(
                                            "bg-card/30 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:border-white/20 transition-all relative overflow-hidden h-28 group",
                                            isEquippedInPreview ? "border-purple-500 bg-purple-500/5" : "border-white/5"
                                        )}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] text-muted-foreground">
                                                {SLOT_LABELS[item.slotType]?.split(" ")[1] || item.category}
                                            </span>
                                            {isEquippedInPreview && <Check className="w-3.5 h-3.5 text-purple-400" />}
                                        </div>

                                        <h5 className="text-[10px] font-bold text-white truncate max-w-[100px]">{item.name}</h5>

                                        <div className="flex justify-between items-center mt-1">
                                            <span className={cn("text-[7px] uppercase font-bold px-1 rounded", tier.color, tier.bg, tier.border)}>
                                                {tier.label.split(" ")[1]}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {visibleClosetItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                                <Shirt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">你目前没有适配 {CARTOON_BASES.find(c => c.id === activeCharacter)?.name} 的已购装备 👕</p>
                                <button 
                                    onClick={() => setActiveTab("shop")}
                                    className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
                                >
                                    去商城逛逛
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Inspect Item Modal */}
            {inspectItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setInspectItem(null)}>
                    <div 
                        className="bg-card/90 border border-border rounded-3xl p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            onClick={() => setInspectItem(null)}
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                        
                        <h3 className="text-xl font-bold text-white text-center mb-1">{inspectItem.name}</h3>
                        <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-wider">{SLOT_LABELS[inspectItem.slotType]} · {TIER_LABELS[inspectItem.tier]?.label.split(" ")[1]}</p>
                        
                        <div className="aspect-square bg-slate-950/50 rounded-3xl flex items-center justify-center mb-6 overflow-hidden border border-white/10">
                            <AvatarRenderer 
                                gender={activeCharacter} 
                                equippedItems={{ [inspectItem.slotType]: inspectItem }} 
                                size={400} 
                                className="border-none bg-transparent"
                                animated={true}
                            />
                        </div>
                        
                        <p className="text-center text-sm text-muted-foreground mb-6">
                            这是物品的高清细节展示。你可以清楚地看到该物品装备后的质感与轮廓设计。
                        </p>
                        
                        <button
                            onClick={() => setInspectItem(null)}
                            className="w-full py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            关闭展示
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
