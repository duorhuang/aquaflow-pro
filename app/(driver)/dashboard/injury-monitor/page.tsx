"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { InjuryMap } from "@/components/athlete/InjuryMap";
import { ArrowLeft, Activity, ShieldAlert, Heart, RefreshCw, UserCheck, ChevronRight, Flame, Zap, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
            <Link href="/dashboard" className="hover:text-white transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white font-medium">{t.common.injuryMonitor}</span>
        </nav>
    );
}

interface Swimmer {
    id: string;
    name: string;
    group: string;
    status: string;
    readiness: number;
    injuryNote?: string;
    injuryImageUrl?: string;
    injuryBodyMap?: string | Record<string, number>;
}

export default function CoachInjuryMonitorPage() {
    const { swimmers: storeSwimmers, isLoaded } = useStore();
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
    const [loading, setLoading] = useState(!isLoaded);
    const [heatMapData, setHeatMapData] = useState<Record<string, number>>({});
    const [injuredSwimmers, setInjuredSwimmers] = useState<Swimmer[]>([]);

    const [selectedHeatmapPart, setSelectedHeatmapPart] = useState<string | null>(null);
    const [selectedHeatmapLabel, setSelectedHeatmapLabel] = useState<string | null>(null);

    const calculateAnalytics = (list: Swimmer[]) => {
        // 1. Filter injured/sore swimmers
        const injured = list.filter(
            (s) => s.status === "Injured" || (s.injuryNote && s.injuryNote.trim().length > 0)
        ).sort((a, b) => a.readiness - b.readiness); // lowest readiness first
        setInjuredSwimmers(injured);

        // 2. Aggregate body map soreness scores
        const counts: Record<string, number> = {};
        const sums: Record<string, number> = {};

        list.forEach((s) => {
            if (s.injuryBodyMap) {
                try {
                    const parsed = typeof s.injuryBodyMap === "string" 
                        ? JSON.parse(s.injuryBodyMap) 
                        : s.injuryBodyMap;

                    if (parsed && typeof parsed === "object") {
                        Object.entries(parsed).forEach(([part, score]) => {
                            const val = Number(score);
                            if (!isNaN(val) && val > 0) {
                                sums[part] = (sums[part] || 0) + val;
                                counts[part] = (counts[part] || 0) + 1;
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error parsing swimmer body map data", e);
                }
            }
        });

        // Compute averages: sum / count
        const averages: Record<string, number> = {};
        Object.keys(sums).forEach((part) => {
            averages[part] = sums[part] / counts[part];
        });

        setHeatMapData(averages);
    };

    // Use store data directly — no duplicate fetch needed
    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => {
                setLoading(false);
                setSwimmers(storeSwimmers);
                calculateAnalytics(storeSwimmers);
            }, 0);
        }
    }, [isLoaded, storeSwimmers]);

    // Timeout fallback: if store never loads, show empty state after 15s
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLoaded) {
                setLoading(false);
                setSwimmers([]);
            }
        }, 15000);
        return () => clearTimeout(timer);
    }, []);

    const loadData = async () => {
        setLoading(true);
        // Re-calculate from store data on manual refresh
        if (isLoaded) {
            setSwimmers(storeSwimmers);
            calculateAnalytics(storeSwimmers);
        }
        setLoading(false);
    };

    const handleRegionClick = (partKey: string, partLabel: string) => {
        setSelectedHeatmapPart(partKey);
        setSelectedHeatmapLabel(partLabel);
    };

    const getSwimmersForRegion = (partKey: string) => {
        return swimmers.filter(s => {
            if (!s.injuryBodyMap) return false;
            try {
                const parsed = typeof s.injuryBodyMap === "string" 
                    ? JSON.parse(s.injuryBodyMap) 
                    : s.injuryBodyMap;
                return parsed && Number(parsed[partKey]) > 0;
            } catch {
                return false;
            }
        }).map(s => {
            const parsed = typeof s.injuryBodyMap === "string" 
                ? JSON.parse(s.injuryBodyMap) 
                : s.injuryBodyMap;
            return {
                ...s,
                partPain: Number(parsed[partKey])
            };
        }).sort((a, b) => b.partPain - a.partPain); // highest pain level first
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 relative">
            <div className="max-w-5xl mx-auto space-y-6">
                <Breadcrumb />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Activity className="w-6 h-6 text-red-500" />
                                队员伤病与身体负荷监测
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">全队 2D 伤病热力图谱汇总与身体异常指标实时预警。</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-secondary/40 border border-white/5 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                        aria-label="刷新数据"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">正在分析队员健康状况...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Heat Map Column */}
                        <div className="lg:col-span-7">
                            <InjuryMap 
                                readOnly={true} 
                                teamHeatMapData={heatMapData} 
                                onPartClick={handleRegionClick}
                            />
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Readiness Overview Panel */}
                            <div className="bg-card/40 border border-white/5 rounded-3xl p-5 space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Heart className="w-4 h-4 text-emerald-400" /> 全队精力准备度
                                </h3>
                                
                                {swimmers.length > 0 ? (
                                    (() => {
                                        const avgReadiness = Math.round(
                                            swimmers.reduce((acc, s) => acc + s.readiness, 0) / swimmers.length
                                        );
                                        return (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-3xl font-mono font-bold text-white">{avgReadiness}%</span>
                                                    <p className="text-xs text-muted-foreground mt-1">全队平均精神与状态准备值</p>
                                                </div>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                                                    avgReadiness >= 85
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : avgReadiness >= 65
                                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                )}>
                                                    {avgReadiness >= 85 ? <Flame className="w-4 h-4" /> : avgReadiness >= 65 ? <Zap className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">暂无队员数据</p>
                                )}
                            </div>

                            {/* Injured Swimmers Report Panel */}
                            <div className="bg-card/40 border border-white/5 rounded-3xl p-5 space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4 text-red-400" /> 受伤/异常报告 ({injuredSwimmers.length})
                                </h3>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                    {injuredSwimmers.map((swimmer) => (
                                        <div 
                                            key={swimmer.id} 
                                            className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">{swimmer.name}</h4>
                                                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{swimmer.group}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={cn(
                                                        "text-xs font-mono font-bold",
                                                        swimmer.readiness <= 60 ? "text-red-400" : "text-yellow-400"
                                                    )}>
                                                        Ready: {swimmer.readiness}%
                                                    </span>
                                                    <p className="text-[9px] text-red-400 mt-0.5 uppercase tracking-wide">
                                                        {swimmer.status === "Injured" ? "🔴 受伤中" : "🟠 有酸痛"}
                                                    </p>
                                                </div>
                                            </div>

                                            {swimmer.injuryNote && (
                                                <p className="text-xs text-muted-foreground bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 italic leading-relaxed">
                                                    &ldquo; {swimmer.injuryNote} &rdquo;
                                                </p>
                                            )}

                                            {swimmer.injuryImageUrl && (
                                                <div className="mt-2 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-white/20 transition-colors bg-black/40"
                                                     onClick={() => window.open(swimmer.injuryImageUrl, '_blank')}>
                                                    <img src={swimmer.injuryImageUrl} alt="Injury Image" className="w-full h-32 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {injuredSwimmers.length === 0 && (
                                        <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                            <UserCheck className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">完美！全队身体无重大伤病报告 🎉</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Clickable Injury Detail Drawer Overlay */}
            {selectedHeatmapPart && (
                <div
                    className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-slate-950/95 border-l border-white/10 backdrop-blur-md shadow-2xl p-6 z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-label="伤病详情"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">区域病灶细分 (Zone telemetry)</span>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                                {selectedHeatmapLabel}
                            </h3>
                        </div>
                        <button
                            onClick={() => setSelectedHeatmapPart(null)}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                            aria-label="关闭详情"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {getSwimmersForRegion(selectedHeatmapPart).map(swimmer => (
                            <div key={swimmer.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{swimmer.name}</h4>
                                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{swimmer.group}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono font-bold text-red-400">
                                            痛感: {swimmer.partPain} / 5
                                        </span>
                                        <p className="text-[9px] text-muted-foreground mt-0.5">
                                            Readiness: {swimmer.readiness}%
                                        </p>
                                    </div>
                                </div>

                                {swimmer.injuryNote && (
                                    <p className="text-xs text-muted-foreground bg-black/40 p-2.5 rounded-xl border border-white/5 italic leading-relaxed">
                                        &ldquo; {swimmer.injuryNote} &rdquo;
                                    </p>
                                )}

                                {swimmer.injuryImageUrl && (
                                    <div className="rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-white/20 transition-colors bg-black/40"
                                         onClick={() => window.open(swimmer.injuryImageUrl, '_blank')}>
                                        <img src={swimmer.injuryImageUrl} alt="Injury" className="w-full h-32 object-cover opacity-85 hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {getSwimmersForRegion(selectedHeatmapPart).length === 0 && (
                            <div className="text-center py-12 text-muted-foreground italic text-xs">
                                完美！该区域目前没有队员报告不适 🏊
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
