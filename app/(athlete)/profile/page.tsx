"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Waves, LogOut, User, Save, ArrowLeft, ShoppingBag, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Swimmer } from "@/types";
import { ShopAndCloset } from "@/components/athlete/ShopAndCloset";
import { BuddySystem } from "@/components/athlete/BuddySystem";
import { cn } from "@/lib/utils";

export default function AthleteProfilePage() {
    const router = useRouter();
    const { swimmers, updateSwimmer, isLoaded } = useStore();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'shop' | 'buddy' | 'profile'>('shop');
    const [name, setName] = useState("");
    const [mainStroke, setMainStroke] = useState<Swimmer["mainStroke"] | undefined>(undefined);
    const [readiness, setReadiness] = useState(100);
    const [injuryNote, setInjuryNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.auth.me()
            .then((user: any) => {
                if (user.role !== 'athlete') {
                    router.push("/login");
                    return;
                }
                setCurrentUser(user);
                setName(user.name || "");
                setMainStroke((user.mainStroke || undefined) as Swimmer["mainStroke"] | undefined);
                setReadiness(user.readiness || 100);
                setInjuryNote(user.injuryNote || "");
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        setSaved(false);
        try {
            await updateSwimmer(currentUser.id, {
                name,
                mainStroke,
                readiness,
                injuryNote,
                lastProfileUpdate: new Date().toISOString()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save profile:", e);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try { await api.auth.logout(); } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        router.push("/login");
    };

    if (!isLoaded && !currentUser) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/workout" className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary/80">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">个人中心</h1>
                            <p className="text-muted-foreground text-sm">{currentUser?.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                        <LogOut className="w-4 h-4" /> 登出
                    </button>
                </div>

                {/* Stats */}
                {currentUser && (
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-2xl font-bold text-primary">{currentUser.totalXp || 0}</p>
                            <p className="text-[10px] text-muted-foreground">总 XP</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-2xl font-bold text-emerald-400">{currentUser.balance || 0}</p>
                            <p className="text-[10px] text-muted-foreground">XB 余额</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-2xl font-bold text-yellow-400">Lv.{currentUser.level || 1}</p>
                            <p className="text-[10px] text-muted-foreground">等级</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-2xl font-bold text-orange-400">{currentUser.currentStreak || 0}</p>
                            <p className="text-[10px] text-muted-foreground">连胜天数</p>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="grid grid-cols-3 gap-2 bg-card/30 border border-border rounded-xl p-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={cn(
                            "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            activeTab === 'shop'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        衣橱与商店 🛍
                    </button>
                    <button
                        onClick={() => setActiveTab('buddy')}
                        className={cn(
                            "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            activeTab === 'buddy'
                                ? "bg-purple-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        死党系统 🤝
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={cn(
                            "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            activeTab === 'profile'
                                ? "bg-blue-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Settings className="w-4 h-4" />
                        个人资料 👤
                    </button>
                </div>

                {/* Tab Content */}
                {currentUser && activeTab === 'shop' && (
                    <div className="animate-in fade-in duration-300">
                        <ShopAndCloset swimmerId={currentUser.id} />
                    </div>
                )}

                {currentUser && activeTab === 'buddy' && (
                    <div className="animate-in fade-in duration-300">
                        <BuddySystem swimmerId={currentUser.id} />
                    </div>
                )}

                {currentUser && activeTab === 'profile' && (
                    <div className="bg-secondary/20 rounded-2xl p-6 space-y-4 border border-white/5 animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5" /> 个人资料设置
                        </h2>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">姓名</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">主项泳姿</label>
                            <select
                                value={mainStroke}
                                onChange={(e) => setMainStroke((e.target.value || undefined) as Swimmer["mainStroke"] | undefined)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">选择泳姿...</option>
                                <option value="Free">自由泳 (Freestyle)</option>
                                <option value="Back">仰泳 (Backstroke)</option>
                                <option value="Breast">蛙泳 (Breaststroke)</option>
                                <option value="Fly">蝶泳 (Butterfly)</option>
                                <option value="IM">混合泳 (IM)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">今日状态: {readiness}%</label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={readiness}
                                onChange={(e) => setReadiness(Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">伤病备注</label>
                            <textarea
                                value={injuryNote}
                                onChange={(e) => setInjuryNote(e.target.value)}
                                placeholder="如有任何不适或伤病，请在此备注说明..."
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "正在保存..." : saved ? "已成功保存！" : "保存修改"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
