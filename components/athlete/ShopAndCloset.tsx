"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { AvatarRenderer } from "./AvatarRenderer";
import { 
    ShoppingBag, 
    Shirt, 
    Coins, 
    Sparkles, 
    Heart, 
    Check, 
    Plus, 
    Trash2, 
    ShieldAlert, 
    Bookmark, 
    BookmarkCheck 
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
    description?: string;
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    basic: { label: "🟢 白菜档", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    entry: { label: "🔵 入门档", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    advanced: { label: "🟣 进阶档", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    premium: { label: "🟠 高级档", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    legendary: { label: "🔴 传说档", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    ultimate: { label: "👑 殿堂档", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }
};

const SLOT_LABELS: Record<string, string> = {
    head: "🧢 头部",
    eyes: "🥽 眼部",
    body: "👕 身体",
    lower: "🩳 下肢",
    feet: "🦶 脚部",
    hand: "✋ 手持",
    background: "🏊 背景"
};

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
    const [gender, setGender] = useState("male");

    // Filtering states
    const [selectedSlot, setSelectedSlot] = useState<string>("all");
    const [selectedTier, setSelectedTier] = useState<string>("all");

    // Temporary equip state (for closet preview)
    const [previewEquipped, setPreviewEquipped] = useState<Record<string, string>>({});
    const [isSavingEquip, setIsSavingEquip] = useState(false);
    const [equipSuccess, setEquipSuccess] = useState(false);

    // Purchase feedback states
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState("");

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
                
                // Get gender from state/swimmers database
                const me = await api.auth.me();
                if (me) {
                    setGender(me.gender || "male");
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

    // Closet: Select item to preview
    const handlePreviewItem = (slot: string, itemId: string) => {
        setPreviewEquipped(prev => ({
            ...prev,
            [slot]: prev[slot] === itemId ? "" : itemId // Toggle equip
        }));
    };

    // Closet: Save equipped items to database
    const handleSaveEquipped = async () => {
        setIsSavingEquip(true);
        try {
            const res = await api.shop.equip(swimmerId, previewEquipped);
            if (res && res.success) {
                setEquippedItems(res.equippedItems);
                setEquipSuccess(true);
                setTimeout(() => setEquipSuccess(false), 2000);
                if (onUpdateSwimmer) onUpdateSwimmer();
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            setPurchaseError(err.message || "保存试穿失败");
            setTimeout(() => setPurchaseError(""), 3000);
        } finally {
            setIsSavingEquip(false);
        }
    };

    // Get item info for equipped item keys
    const getEquippedItemsFull = () => {
        const fullEquipped: Record<string, ShopItem> = {};
        Object.entries(previewEquipped).forEach(([slot, itemId]) => {
            if (itemId) {
                const item = items.find(i => i.id === itemId);
                if (item) fullEquipped[slot] = item;
            }
        });
        return fullEquipped;
    };

    // Filtering lists
    const filteredItems = items.filter(item => {
        if (selectedSlot !== "all" && item.slotType !== selectedSlot) return false;
        if (selectedTier !== "all" && item.tier !== selectedTier) return false;
        return true;
    });

    // Wishlist details
    const wishlistItems = items.filter(item => wishlist.includes(item.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Shop & Wardrobe...</p>
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
                        {filteredItems.map(item => {
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
                                    <div className="aspect-square bg-slate-950/50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
                                        <AvatarRenderer 
                                            gender={gender} 
                                            equippedItems={{ [item.slotType]: item }} 
                                            size={100} 
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

                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">没有找到该槽位或档位的商品 🛒</p>
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
                            gender={gender} 
                            equippedItems={getEquippedItemsFull()} 
                            size={240} 
                        />

                        {/* Equipped list readout */}
                        <div className="w-full space-y-1.5 pt-2">
                            {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                                const itemId = previewEquipped[slot];
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
                            {isSavingEquip ? "保存穿戴中..." : equipSuccess ? "穿戴方案已存入数据库" : "保存当前搭配穿戴"}
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
                            {/* Base Uniform starter clothes for gender */}
                            {selectedSlot === "all" || selectedSlot === "head" ? (
                                <div 
                                    onClick={() => handlePreviewItem("head", "")}
                                    className={cn(
                                        "bg-card/10 border rounded-2xl p-3 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-white/20 transition-all text-center h-28 relative",
                                        !previewEquipped["head"] ? "border-purple-500/50 bg-purple-500/5" : "border-white/5"
                                    )}
                                >
                                    <span className="text-xl">🧢</span>
                                    <h5 className="text-[10px] font-bold text-white">默认泳帽</h5>
                                    <span className="text-[8px] text-muted-foreground uppercase">队服标准件</span>
                                    {!previewEquipped["head"] && <Check className="w-3.5 h-3.5 text-purple-400 absolute top-1 right-2" />}
                                </div>
                            ) : null}

                            {selectedSlot === "all" || selectedSlot === "eyes" ? (
                                <div 
                                    onClick={() => handlePreviewItem("eyes", "")}
                                    className={cn(
                                        "bg-card/10 border rounded-2xl p-3 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-white/20 transition-all text-center h-28 relative",
                                        !previewEquipped["eyes"] ? "border-purple-500/50 bg-purple-500/5" : "border-white/5"
                                    )}
                                >
                                    <span className="text-xl">🥽</span>
                                    <h5 className="text-[10px] font-bold text-white">默认泳镜</h5>
                                    <span className="text-[8px] text-muted-foreground uppercase">队服标准件</span>
                                    {!previewEquipped["eyes"] && <Check className="w-3.5 h-3.5 text-purple-400 absolute top-1 right-2" />}
                                </div>
                            ) : null}

                            {/* Owned purchased items */}
                            {items.filter(item => inventory.includes(item.id) && (selectedSlot === "all" || item.slotType === selectedSlot)).map(item => {
                                const isEquippedInPreview = previewEquipped[item.slotType] === item.id;
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
                    </div>
                </div>
            )}
        </div>
    );
}
