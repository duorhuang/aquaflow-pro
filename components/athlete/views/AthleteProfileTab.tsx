"use client";

import { useState } from "react";
import { User, Activity, Palette, LogOut, Check, Save, ShieldCheck } from "lucide-react";
import { Swimmer } from "@/types";
import { useStore } from "@/lib/store";
import { useTheme, AVAILABLE_THEMES } from "@/lib/theme-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useToast } from "@/components/common/Toast";

const InjuryMap = dynamic(() => import("@/components/athlete/InjuryMap").then(m => ({ default: m.InjuryMap })), { ssr: false });

interface AthleteProfileTabProps {
    currentUser: Swimmer;
}

export function AthleteProfileTab({ currentUser }: AthleteProfileTabProps) {
    const { updateSwimmer } = useStore();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    const [readiness, setReadiness] = useState(currentUser.readiness || 100);
    const [status, setStatus] = useState<string>(currentUser.status || "Active");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveStatus = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await updateSwimmer(currentUser.id, {
                readiness,
                status: status as any,
                lastProfileUpdate: new Date().toISOString(),
            });
            setSaved(true);
            toast("success", "状态已同步至教练端");
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            console.error("Save status error:", e);
            toast("error", "保存失败，请稍后重试");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm("确认要退出当前队员账号吗？")) return;
        try { await api.auth.logout(); } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        window.location.href = "/login";
    };

    const getGroupBadge = (group: string) => {
        switch (group) {
            case "Advanced": return "一线专业组";
            case "Intermediate": return "二线提高组";
            case "Junior": return "基础预备组";
            default: return group || "校游泳队";
        }
    };

    return (
        <div className="space-y-6">
            {/* Athlete Profile Header Card */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl font-mono shadow-inner">
                        {currentUser.name.slice(0, 1)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
                            <span className="text-[11px] font-semibold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                                {getGroupBadge(currentUser.group)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            账号：@{currentUser.username} · 主项：{currentUser.mainStroke || "自由泳"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Daily Physical Readiness & Status */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm text-foreground">身体战备状态 (Readiness)</h3>
                    </div>
                    <span className="text-sm font-mono font-bold text-primary">{readiness}%</span>
                </div>

                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={readiness}
                        onChange={(e) => setReadiness(parseInt(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        aria-label="身体战备状态数值"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>极度疲劳 (0-20%)</span>
                        <span>轻度疲惫 (40%)</span>
                        <span>状态良好 (70%)</span>
                        <span>充沛满电 (100%)</span>
                    </div>
                </div>

                {/* Status Switcher */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                        { id: "Active", label: "正常参训", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                        { id: "Resting", label: "调整休整", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
                        { id: "Injured", label: "身体不适", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setStatus(item.id)}
                            className={cn(
                                "py-2.5 px-2 rounded-2xl text-xs font-semibold border transition-all min-h-[44px]",
                                status === item.id 
                                    ? item.color + " shadow-xs" 
                                    : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary/80"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Injury Body Map */}
                <div className="pt-3 border-t border-border/60">
                    <p className="text-xs font-semibold text-foreground mb-3">伤病与痛点标注图</p>
                    <InjuryMap swimmerId={currentUser.id} />
                </div>

                <button
                    onClick={handleSaveStatus}
                    disabled={saving}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                >
                    {saving ? (
                        <span>正在同步...</span>
                    ) : saved ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>状态已成功保存</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>保存今日状态反馈</span>
                        </>
                    )}
                </button>
            </div>

            {/* Visual Themes Picker (3 Curated Themes) */}
            <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <div>
                        <h3 className="font-bold text-sm text-foreground">视觉风格主题</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">精心调优的 3 种自然视觉风格，随心自选</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {AVAILABLE_THEMES.map((t) => {
                        const isSelected = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={cn(
                                    "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative min-h-[90px]",
                                    isSelected
                                        ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                                        : "border-border bg-secondary/30 hover:bg-secondary/60"
                                )}
                            >
                                {isSelected && (
                                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                                        <Check className="w-3 h-3" />
                                    </span>
                                )}
                                <div>
                                    <span className="font-bold text-sm text-foreground block">{t.name}</span>
                                    <span className="text-[11px] text-muted-foreground mt-1 block">{t.subtitle}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: t.accentColor }} />
                                    <span className="text-[10px] text-muted-foreground font-mono">{t.isDark ? "深色模式" : "浅色模式"}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Account & Security */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>队员数据仅供队内教练及训练分析使用</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-destructive/10 border border-destructive/20 text-destructive font-medium rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-destructive/15 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录当前账号</span>
                </button>
            </div>
        </div>
    );
}
