"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Waves, LogOut, User, Save, ShoppingBag, Users, Settings, Activity, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Swimmer } from "@/types";
import { ShopAndCloset } from "@/components/athlete/ShopAndCloset";
import { BuddySystem } from "@/components/athlete/BuddySystem";
import { InjuryMap } from "@/components/athlete/InjuryMap";
import { BottomTabBar } from "@/components/athlete/BottomTabBar";
import { BackgroundPicker } from "@/components/athlete/BackgroundPicker";
import { WaveAnimation } from "@/components/common/WaveAnimation";
import { useBackgroundTheme } from "@/hooks/useBackgroundTheme";
import { useLanguage } from "@/lib/i18n";

export default function AthleteProfilePage() {
    const router = useRouter();
    const { swimmers, updateSwimmer, isLoaded } = useStore();
    const { t } = useLanguage();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'shop' | 'buddy' | 'profile' | 'injury'>('shop');
    const [name, setName] = useState("");
    const [mainStroke, setMainStroke] = useState<Swimmer["mainStroke"] | undefined>(undefined);
    const [readiness, setReadiness] = useState(100);
    const [gender, setGender] = useState<"male" | "female">("male");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showBgPicker, setShowBgPicker] = useState(false);

    // Background theme
    const {
        theme: bgTheme,
        mode: bgMode,
        gradientClass,
        setManualTheme: setBgTheme,
        setAutoMode: setBgAuto,
    } = useBackgroundTheme();

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
                setGender(user.gender || "male");
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
                gender,
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
        <div className={cn("min-h-screen pb-24 transition-colors duration-700 ease-in-out bg-gradient-to-br", gradientClass)}>
            {/* Background texture overlay */}
            <div className="fixed inset-0 bg-theme-texture pointer-events-none z-0 opacity-30" aria-hidden="true" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
                    <div>
                        <h1 className="text-lg font-bold text-white">{t.common.profile || "Profile"}</h1>
                        <p className="text-xs text-muted-foreground">{currentUser?.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowBgPicker(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            title="更换背景"
                            aria-label="Change background theme"
                        >
                            <Palette className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push("/workout")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                            aria-label="Back to workout"
                        >
                            <Waves className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 min-h-[44px]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="text-sm hidden sm:inline">{t.common.logout}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                {/* Stats */}
                {currentUser && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-card/50 rounded-2xl p-4 text-center border border-border/50">
                            <p className="text-2xl font-bold text-primary">{currentUser.totalXp || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.archive.totalXp}</p>
                        </div>
                        <div className="bg-card/50 rounded-2xl p-4 text-center border border-border/50">
                            <p className="text-2xl font-bold text-emerald-400">{currentUser.balance || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.archive.xbBalance}</p>
                        </div>
                        <div className="bg-card/50 rounded-2xl p-4 text-center border border-border/50">
                            <p className="text-2xl font-bold text-yellow-400">Lv.{currentUser.level || 1}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.archive.level}</p>
                        </div>
                        <div className="bg-card/50 rounded-2xl p-4 text-center border border-border/50">
                            <p className="text-2xl font-bold text-orange-400">{currentUser.currentStreak || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.archive.streak}</p>
                        </div>
                    </div>
                )}

                {/* Inline Tab Navigation (profile-specific sub-tabs) */}
                <div className="grid grid-cols-4 gap-2 bg-card/50 border border-border/50 rounded-xl p-2">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 min-h-[44px]",
                            activeTab === 'shop'
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t.archive.wardrobe}
                    </button>
                    <button
                        onClick={() => setActiveTab('buddy')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 min-h-[44px]",
                            activeTab === 'buddy'
                                ? "bg-purple-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        {t.archive.buddy}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 min-h-[44px]",
                            activeTab === 'profile'
                                ? "bg-blue-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Settings className="w-4 h-4" />
                        {t.archive.profile}
                    </button>
                    <button
                        onClick={() => setActiveTab('injury')}
                        className={cn(
                            "py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 min-h-[44px]",
                            activeTab === 'injury'
                                ? "bg-red-500 text-white shadow-lg"
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Activity className="w-4 h-4" />
                        {t.archive.injury}
                    </button>
                </div>

                {/* Tab Content */}
                {currentUser && activeTab === 'shop' && (
                    <div className="animate-in fade-in duration-300">
                        <ShopAndCloset swimmerId={currentUser.id} />
                    </div>
                )}

                {currentUser && activeTab === 'injury' && (
                    <div className="animate-in fade-in duration-300">
                        <InjuryMap swimmerId={currentUser.id} readOnly={false} />
                    </div>
                )}

                {currentUser && activeTab === 'buddy' && (
                    <div className="animate-in fade-in duration-300">
                        <BuddySystem swimmerId={currentUser.id} />
                    </div>
                )}

                {currentUser && activeTab === 'profile' && (
                    <div className="bg-card/50 rounded-2xl p-6 space-y-4 border border-border/50 animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <User className="w-5 h-5" /> {t.archive.profileSettings}
                        </h2>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">姓名</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.archive.mainStroke}</label>
                            <select
                                value={mainStroke}
                                onChange={(e) => setMainStroke((e.target.value || undefined) as Swimmer["mainStroke"] | undefined)}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
                            >
                                <option value="">{t.archive.selectStroke}</option>
                                <option value="Free">自由泳 (Freestyle)</option>
                                <option value="Back">仰泳 (Backstroke)</option>
                                <option value="Breast">蛙泳 (Breaststroke)</option>
                                <option value="Fly">蝶泳 (Butterfly)</option>
                                <option value="IM">混合泳 (IM)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.archive.gender}</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as "male" | "female")}
                                className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
                            >
                                <option value="male">男 (Male)</option>
                                <option value="female">女 (Female)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">
                                {t.archive.todayCondition}: {readiness}% — {
                                    readiness <= 20 ? "非常疲劳，建议休息" :
                                    readiness <= 40 ? "疲劳，建议减量" :
                                    readiness <= 60 ? "一般状态" :
                                    readiness <= 80 ? "良好" :
                                    "状态极佳"
                                }
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={readiness}
                                onChange={(e) => setReadiness(Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 min-h-[44px]"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? t.archive.saving : saved ? t.archive.savedSuccess : t.archive.saveChanges}
                        </button>
                    </div>
                )}
            </main>

            {/* Background Picker Modal */}
            <BackgroundPicker
                open={showBgPicker}
                onClose={() => setShowBgPicker(false)}
                currentThemeId={bgTheme.id}
                currentMode={bgMode}
                onThemeSelect={(id) => {
                    setBgTheme(id);
                    setShowBgPicker(false);
                }}
                onAutoMode={() => {
                    setBgAuto();
                    setShowBgPicker(false);
                }}
            />

            {/* Bottom Tab Bar */}
            <BottomTabBar />

            {/* Wave Animation */}
            <WaveAnimation />
        </div>
    );
}
