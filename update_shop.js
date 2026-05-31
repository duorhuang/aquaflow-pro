const fs = require('fs');

const code = `"use client";

import { useState, useEffect } from "react";
import { Coins, ChevronLeft, Download, RotateCcw, Save } from "lucide-react";
import { AvatarRenderer } from "./AvatarRenderer";

interface ShopItem {
    id: string;
    name: string;
    category: string;
    price: number;
    imageKey: string;
    slotType: string;
}

export function ShopAndCloset({ swimmerId, onUpdateSwimmer }: { swimmerId: string, onUpdateSwimmer?: () => void }) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState<string[]>([]);
    const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
    const [previewEquipped, setPreviewEquipped] = useState<Record<string, string>>({});
    
    const [mainTab, setMainTab] = useState<"个人装扮" | "同桌空间">("个人装扮");
    const [subTab, setSubTab] = useState<string>("衣服");

    useEffect(() => {
        const fetchShop = async () => {
            try {
                // Using relative path for the API call
                const res = await fetch(\`/api/shop?swimmerId=\${swimmerId}\`).then(r => r.json());
                setItems(res.items || []);
                setBalance(res.balance || 0);
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

    const handlePurchase = async (item: ShopItem) => {
        if (balance < item.price) {
            alert("金币不足！");
            return;
        }
        if (confirm(\`确定花费 \${item.price} 金币兑换【\${item.name}】吗？\`)) {
            try {
                const res = await fetch('/api/shop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'purchase', swimmerId, itemId: item.id })
                }).then(r => r.json());
                
                if (res.error) throw new Error(res.error);
                
                setBalance(res.balance);
                setInventory(res.inventory);
                setPreviewEquipped({ ...previewEquipped, [item.slotType]: item.id });
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleEquip = (item: ShopItem) => {
        setPreviewEquipped({ ...previewEquipped, [item.slotType]: item.id });
    };

    const handleSave = async () => {
        try {
            await fetch(\`/api/swimmers/\${swimmerId}\`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equippedItems: JSON.stringify(previewEquipped) })
            });
            setEquippedItems(previewEquipped);
            alert("保存成功！");
            if (onUpdateSwimmer) onUpdateSwimmer();
        } catch (e) {
            console.error(e);
        }
    };

    const isOwned = (itemId: string) => inventory.includes(itemId);
    const isEquipped = (itemId: string, slot: string) => previewEquipped[slot] === itemId;

    const subTabs = mainTab === "个人装扮" 
        ? ["衣服", "头发", "头饰", "脸型"]
        : ["壁纸", "家具", "装饰", "窗户"];

    const displayedItems = items.filter(i => {
        if (mainTab === "个人装扮") return ["衣服", "头发", "头饰", "脸型"].includes(i.category) && i.category === subTab;
        if (mainTab === "同桌空间") return ["壁纸", "家具", "装饰", "窗户"].includes(i.category) && i.category === subTab;
        return false;
    });

    return (
        <div className="fixed inset-0 bg-[#e7f0d6] z-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#b5d382] shadow-sm z-10 relative">
                <button className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-[#4a5d23]" />
                </button>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border-2 border-[#4a5d23] shadow-sm">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-yellow-800">C</span>
                    </div>
                    <span className="font-bold text-[#4a5d23]">{balance}</span>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center px-4">
                <div className="bg-white rounded-xl shadow-md border-2 border-[#4a5d23] flex overflow-hidden w-full max-w-md">
                    {["个人装扮", "同桌空间", "校牌", "道具卡"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setMainTab(tab as any)}
                            className={\`flex-1 py-2 text-sm font-bold transition-colors \${mainTab === tab ? 'bg-[#c5e6f3] text-[#2c4e5e]' : 'text-[#666] hover:bg-gray-50'}\`}
                        >
                            {tab}{mainTab === tab && "✨"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scene Area (Classroom) */}
            <div className="flex-1 relative bg-[#e7f0d6] overflow-hidden">
                {/* Background Wallpapers */}
                <div className="absolute inset-0">
                    {/* Placeholder for dynamic wallpaper based on equippedItems.wallpaper */}
                    <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                </div>

                {/* Desk and Characters */}
                <div className="absolute bottom-0 left-0 right-0 h-[60%] flex items-end justify-center">
                    <AvatarRenderer equippedItems={previewEquipped} />
                </div>
                
                {/* Action Buttons Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => setPreviewEquipped(equippedItems)} className="bg-[#c5e6f3] p-2 rounded border-2 border-[#2c4e5e] shadow-sm">
                        <RotateCcw className="w-5 h-5 text-[#2c4e5e]" />
                    </button>
                    <button onClick={handleSave} className="bg-[#9cd4e6] px-6 py-2 rounded border-2 border-[#2c4e5e] shadow-sm font-bold text-[#2c4e5e]">
                        保存
                    </button>
                </div>
            </div>

            {/* Bottom Drawer */}
            <div className="h-[40%] bg-[#fffde7] rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t-2 border-l-2 border-r-2 border-[#d0c99f] flex flex-col relative z-30">
                {/* Sub Tabs */}
                <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar border-b-2 border-[#d0c99f]/30">
                    {subTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSubTab(tab)}
                            className={\`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all \${subTab === tab ? 'bg-white border-2 border-[#d0c99f] shadow-sm text-[#5d5537]' : 'text-[#a39b7d] hover:bg-white/50'}\`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Item Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-4">
                        {displayedItems.map(item => {
                            const owned = isOwned(item.id);
                            const equipped = isEquipped(item.id, item.slotType);

                            return (
                                <div key={item.id} className={\`bg-white rounded-xl border-2 \${equipped ? 'border-[#8bc34a]' : 'border-[#e0dabc]'} shadow-sm flex flex-col overflow-hidden relative\`}>
                                    {equipped && (
                                        <div className="absolute top-0 left-0 bg-[#8bc34a] text-white text-[10px] px-2 py-0.5 rounded-br-lg z-10">
                                            装扮中
                                        </div>
                                    )}
                                    <div className="h-24 bg-gray-50 flex items-center justify-center p-2">
                                        <div className="w-full h-full bg-[#f0f0f0] rounded flex items-center justify-center text-xs text-gray-400">
                                            {item.imageKey}
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-col items-center">
                                        <p className="text-[10px] font-bold text-gray-700 truncate w-full text-center mb-1">{item.name}</p>
                                        {!owned ? (
                                            <button 
                                                onClick={() => handlePurchase(item)}
                                                className="w-full py-1 bg-[#fff3e0] text-[#e65100] border border-[#ffb74d] rounded text-[10px] font-bold"
                                            >
                                                {item.price} 兑换
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleEquip(item)}
                                                className={\`w-full py-1 rounded text-[10px] font-bold transition-colors \${equipped ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#e3f2fd] text-[#1976d2] border border-[#90caf9]'}\`}
                                                disabled={equipped}
                                            >
                                                {equipped ? '已装扮' : '穿戴'}
                                            </button>
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
`;

fs.writeFileSync('components/athlete/ShopAndCloset.tsx', code);
console.log('ShopAndCloset.tsx replaced successfully.');
