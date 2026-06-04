"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, RotateCcw, ChevronDown, Check, Sparkles } from "lucide-react";
import { AvatarRenderer, ItemPreview } from "./AvatarRenderer";
import { calculateLevel } from "@/lib/date-utils";
import { useToast } from "@/components/common/Toast";
import { useLanguage } from "@/lib/i18n";

const TIER_REQUIRED_LEVEL: Record<string, number> = {
    basic: 1,
    common: 1,
    rare: 2,
    advanced: 3,
    legendary: 4,
    ultimate: 5
};

interface ShopItem {
    id: string;
    name: string;
    category: string;
    price: number;
    imageKey: string;
    slotType: string;
    previewColor?: string;
    tier: string;
}

export function ShopAndCloset({ swimmerId, onUpdateSwimmer, onClose }: { swimmerId: string, onUpdateSwimmer?: () => void, onClose?: () => void }) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [totalXp, setTotalXp] = useState(0);
    const [inventory, setInventory] = useState<string[]>([]);
    const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
    const [previewEquipped, setPreviewEquipped] = useState<Record<string, string>>({});
    
    const [mainTab, setMainTab] = useState<"个人装扮" | "同桌空间" | "校牌" | "道具卡">("同桌空间");
    const [subTab, setSubTab] = useState<string>("摆件");

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const res = await fetch(`/api/shop?swimmerId=${swimmerId}`).then(r => r.json());
                setItems(res.items || []);
                setBalance(res.balance || 0);
                setTotalXp(res.totalXp || 0);
                setInventory(res.inventory || []);
                const eq = res.equippedItems || {};
                setEquippedItems(eq);
                setPreviewEquipped(eq);
            } catch (err) {
                console.error(err);
            }
        };
        fetchShop();
    }, [swimmerId]);

    const handleMainTabChange = (tab: "个人装扮" | "同桌空间" | "校牌" | "道具卡") => {
        setMainTab(tab);
        if (tab === "个人装扮") setSubTab("衣服");
        else if (tab === "同桌空间") setSubTab("摆件");
        else if (tab === "校牌") setSubTab("边框");
    };

    const handlePurchase = async (item: ShopItem) => {
        const requiredLevel = TIER_REQUIRED_LEVEL[item.tier] || 1;
        const swimmerLevel = calculateLevel(totalXp);
        if (swimmerLevel < requiredLevel) {
            toast("error", `等级不足！需要达到 Lv.${requiredLevel} 才能兑换。继续训练升级吧！`);
            return;
        }
        if (balance < item.price) {
            toast("error", `金币不足！需要 ${item.price} 金币。通过打卡获取更多！`);
            return;
        }
        if (confirm(`确定花费 ${item.price} 金币兑换【${item.name}】吗？`)) {
            try {
                const res = await fetch('/api/shop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'purchase', swimmerId, itemId: item.id })
                }).then(r => r.json());

                if (res.error) throw new Error(res.error);

                setBalance(res.balance);
                setInventory(res.inventory);
                setPreviewEquipped({ ...previewEquipped, [item.slotType]: item.imageKey });
                toast("success", `成功兑换【${item.name}】！`);
            } catch (err: any) {
                toast("error", err.message || "兑换失败，请重试");
            }
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (previewEquipped[item.slotType] === item.imageKey) {
            // Re-clicking equipped item -> toggle off if optional slot
            if (item.slotType !== 'body' && item.slotType !== 'hair') {
                const nextPreview = { ...previewEquipped };
                delete nextPreview[item.slotType];
                setPreviewEquipped(nextPreview);
                return;
            }
        }
        setPreviewEquipped({ ...previewEquipped, [item.slotType]: item.imageKey });
    };

    const handleSave = async () => {
        try {
            const equippedPayload: Record<string, { id: string, imageKey: string } | null> = {};
            const allSlots = ['body', 'hair', 'hat', 'face', 'desk_acc', 'wallpaper', 'window', 'desk_ornament', 'wall_hanging', 'plant', 'cabinet', 'badge_frame'];
            
            for (const slot of allSlots) {
                const imageKey = previewEquipped[slot];
                if (imageKey) {
                    const item = items.find(i => i.imageKey === imageKey);
                    if (item) {
                        if (!isOwned(item.id)) {
                            toast("error", `您当前试穿的【${item.name}】还未拥有，请先购买再保存！`);
                            return;
                        }
                        equippedPayload[slot] = { id: item.id, imageKey: item.imageKey };
                    }
                } else {
                    equippedPayload[slot] = null;
                }
            }

            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'equip',
                    swimmerId,
                    equipped: equippedPayload
                })
            }).then(r => r.json());

            if (res.error) throw new Error(res.error);

            setEquippedItems(res.equippedItems || previewEquipped);
            toast("success", "保存成功！");
            if (onUpdateSwimmer) onUpdateSwimmer();
        } catch (e: any) {
            toast("error", e.message || "保存失败，请重试");
            console.error(e);
        }
    };

    const isOwned = (itemId: string) => inventory.includes(itemId);
    const isEquipped = (item: ShopItem) => previewEquipped[item.slotType] === item.imageKey;

    const getSubTabsData = () => {
        switch (mainTab) {
            case "个人装扮": 
                return [
                    { id: "衣服", icon: "👕" },
                    { id: "头发", icon: "👦" },
                    { id: "头饰", icon: "🧢" },
                    { id: "脸部", icon: "😶" },
                    { id: "桌面配件", icon: "🥤" },
                ];
            case "同桌空间": 
                return [
                    { id: "绿植", icon: "🪴" },
                    { id: "墙饰", icon: "🖼️" },
                    { id: "摆件", icon: "💻" },
                    { id: "柜子", icon: "🗄️" },
                    { id: "壁纸", icon: "🔲" },
                    { id: "窗户", icon: "🪟" },
                ];
            case "校牌": 
                return [{ id: "边框", icon: "📛" }];
            default: return [];
        }
    };

    const subTabsData = getSubTabsData();
    const validCategories = subTabsData.map(t => t.id);

    const displayedItems = items.filter(i => {
        return validCategories.includes(i.category) && i.category === subTab;
    });

    const parseMeta = (color?: string) => {
        if (!color) return {};
        try { return JSON.parse(color); } catch { return {}; }
    };

    return (
        <div className="fixed inset-0 bg-[#e7efcc] z-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 z-10 relative">
                <button 
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-[#333]" />
                </button>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border-2 border-[#333] shadow-sm">
                    <div className="w-5 h-5 bg-[#ffca28] rounded-full border-2 border-[#ff8f00] flex items-center justify-center">
                        <span className="text-[10px] font-black text-[#fff]">C</span>
                    </div>
                    <span className="font-bold text-[#333]">{balance}</span>
                </div>
            </div>

            {/* Main Tabs (Pill style) */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center px-4">
                <div className="bg-white rounded-full shadow-sm border-2 border-[#333] flex overflow-hidden w-full max-w-sm">
                    {["个人装扮", "同桌空间", "校牌", "道具卡"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleMainTabChange(tab as any)}
                            className={`flex-1 py-2 text-xs font-bold transition-colors relative ${mainTab === tab ? 'bg-[#d8effa] text-[#333]' : 'text-[#666] hover:bg-gray-50'}`}
                        >
                            {tab}
                            {mainTab === tab && <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-500" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scene Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {/* Wallpaper */}
                <div className="absolute inset-0 z-0">
                    {/* Baicizhan default floral green background if no wallpaper is equipped */}
                    <div className="w-full h-full bg-[#dcf3b1] bg-[url('https://www.transparenttextures.com/patterns/floral-flourish.png')] opacity-80 mix-blend-multiply"></div>
                    {previewEquipped['wallpaper'] && (
                        <div className="absolute inset-0 bg-opacity-30 bg-blue-100 flex items-center justify-center">
                            <span className="text-gray-400 font-mono opacity-50">{items.find(i => i.id === previewEquipped['wallpaper'])?.name}</span>
                        </div>
                    )}
                </div>

                {/* Engine Wrapper */}
                <div className="w-full h-full absolute inset-0 z-10 flex flex-col items-center justify-end pb-4">
                    {mainTab === "个人装扮" ? (
                        /* In Personal Avatar mode, show a single centered avatar */
                        <AvatarRenderer equippedItems={previewEquipped} mode="single" />
                    ) : (
                        /* In Desk Space mode, show the environment or the desk mate */
                        <AvatarRenderer equippedItems={previewEquipped} mode="environment" />
                    )}
                </div>
                
                {/* Action Buttons Overlay (Middle Row) */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-20 items-end">
                    <button 
                        onClick={() => setPreviewEquipped(equippedItems)} 
                        className="bg-[#d8effa] w-10 h-10 rounded border-2 border-[#333] shadow-sm flex items-center justify-center"
                    >
                        <RotateCcw className="w-5 h-5 text-[#333]" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-[#d8efcc] w-10 h-10 rounded border-2 border-[#333] shadow-sm flex items-center justify-center"
                    >
                        <ChevronDown className="w-5 h-5 text-[#333]" />
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-[#8ad6f5] px-6 h-10 rounded border-2 border-[#333] shadow-sm font-bold text-[#333] text-sm"
                    >
                        保存
                    </button>
                </div>
            </div>

            {/* Bottom Drawer */}
            <div className="h-[45%] bg-[#fffde7] rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t-2 border-[#333] flex flex-col relative z-30">
                {/* Sub Tabs (Icons) */}
                <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar border-b-2 border-[#d0c99f]/30">
                    {subTabsData.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${subTab === tab.id ? 'bg-[#ffedc0] border-2 border-[#333] shadow-[0_2px_0_#333]' : 'bg-transparent text-[#a39b7d] hover:bg-black/5'}`}
                        >
                            {tab.icon}
                        </button>
                    ))}
                </div>

                {/* Item Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-3">
                        {displayedItems.map(item => {
                            const owned = isOwned(item.id);
                            const equipped = isEquipped(item);
                            const meta = parseMeta(item.previewColor);
                            const requiredLevel = TIER_REQUIRED_LEVEL[item.tier] || 1;
                            const swimmerLevel = calculateLevel(totalXp);
                            const isLocked = swimmerLevel < requiredLevel;

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleEquip(item)}
                                    className={`bg-white rounded-xl border-2 ${equipped ? 'border-[#8bc34a] bg-[#f1f8e9]' : 'border-[#333]'} shadow-[0_2px_0_#333] flex flex-col overflow-hidden relative cursor-pointer hover:scale-[1.02] active:scale-95 transition-all`}
                                >
                                    
                                    {/* Equipped Badge (Top Left for Avatar, Blue Check for Desk) */}
                                    {equipped && (
                                        <div className="absolute top-0 left-0 bg-[#8bc34a] text-white text-[10px] px-1.5 py-0.5 rounded-br z-10 font-bold">
                                            装扮中
                                        </div>
                                    )}

                                    {/* Gated Level Badge (Top Right) */}
                                    {isLocked && !owned && (
                                        <div className="absolute top-0 right-0 bg-[#ff9800] text-white text-[9px] px-1.5 py-0.5 rounded-bl z-10 font-bold flex items-center gap-0.5">
                                            <span>Lv.{requiredLevel}</span>
                                        </div>
                                    )}

                                    {/* The Image Area */}
                                    <div className={`h-24 flex items-center justify-center p-2 relative ${equipped ? 'bg-[#f1f8e9]' : 'bg-[#f5f5f5]'} ${isLocked && !owned ? 'opacity-75 bg-gray-100' : ''}`}>
                                        <ItemPreview slotType={item.slotType} imageKey={item.imageKey} size={80} />
                                        {/* Padlock icon overlay if locked */}
                                        {isLocked && !owned && (
                                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                                <span className="text-lg">🔒</span>
                                            </div>
                                        )}
                                        {/* Baicizhan equipped blue checkmark corner */}
                                        {equipped && (
                                            <div className="absolute bottom-0 right-0 bg-[#8ad6f5] border-l-2 border-t-2 border-[#333] rounded-tl flex items-center justify-center w-6 h-6">
                                                <Check className="w-4 h-4 text-[#333]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* The Title / Action Area */}
                                    <div className="border-t-2 border-[#333] bg-white p-2 flex flex-col items-center">
                                        <p className="text-xs font-bold text-[#333] truncate w-full text-center mb-1">{item.name}</p>
                                        {!owned ? (
                                            isLocked ? (
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); toast("info", `等级不足！需要达到 Lv.${requiredLevel} 才能兑换。继续训练以获得更多 XP 并升级！`); }}
                                                    className="w-full py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded text-center border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
                                                >
                                                    Lv.{requiredLevel} 解锁
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handlePurchase(item); }}
                                                    className="w-full py-1 bg-transparent text-[#333] text-[10px] font-bold flex flex-col items-center leading-tight hover:bg-black/5 rounded transition-colors"
                                                >
                                                    {meta.originalPrice && (
                                                        <span className="text-[8px] line-through text-red-500 -mt-1">{meta.originalPrice}</span>
                                                    )}
                                                    <span>{item.price} 兑换</span>
                                                </button>
                                            )
                                        ) : (
                                            <div className="h-4 flex items-center justify-center">
                                                <span className="text-[10px] text-gray-400 font-bold">已拥有</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
