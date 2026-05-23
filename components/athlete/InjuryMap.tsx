"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ShieldAlert, Info, Check, Save } from "lucide-react";

interface InjuryMapProps {
    swimmerId?: string;
    readOnly?: boolean;
    teamHeatMapData?: Record<string, number>; // aggregate soreness, e.g. { shoulderLeft: 3.5 }
    initialBodyMap?: Record<string, number>;
    onSaveSuccess?: () => void;
}

const BODY_PARTS: Record<string, { label: string; coords: string; path: string }> = {
    head: { 
        label: "头部", 
        coords: "50,12", 
        path: "M 46 12 A 4 4 0 1 1 54 12 A 4 4 0 1 1 46 12" 
    },
    neck: { 
        label: "颈部", 
        coords: "50,17", 
        path: "M 48 16.5 L 52 16.5 L 51 20 L 49 20 Z" 
    },
    shoulderLeft: { 
        label: "左肩", 
        coords: "40,22", 
        path: "M 42 20.5 C 38 21 34 23 34 25 C 34 27 38 27 41 24 Z" 
    },
    shoulderRight: { 
        label: "右肩", 
        coords: "60,22", 
        path: "M 58 20.5 C 62 21 66 23 66 25 C 66 27 62 27 59 24 Z" 
    },
    chest: { 
        label: "胸肌/上背", 
        coords: "50,26", 
        path: "M 42 21 L 58 21 L 56 36 L 44 36 Z" 
    },
    lowerBack: { 
        label: "腰腹/下背", 
        coords: "50,42", 
        path: "M 44 37.5 L 56 37.5 L 54 48 L 46 48 Z" 
    },
    elbowLeft: { 
        label: "左肘", 
        coords: "31,34", 
        path: "M 33.5 25 L 30 35 L 27 34 L 31.5 23 Z" 
    },
    elbowRight: { 
        label: "右肘", 
        coords: "69,34", 
        path: "M 66.5 25 L 70 35 L 73 34 L 68.5 23 Z" 
    },
    handLeft: { 
        label: "左手腕/手", 
        coords: "26,45", 
        path: "M 30 35.5 L 26 48 L 23 47 L 27.5 34.5 Z" 
    },
    handRight: { 
        label: "右手腕/手", 
        coords: "74,45", 
        path: "M 70 35.5 L 74 48 L 77 47 L 72.5 34.5 Z" 
    },
    hip: { 
        label: "髋部/臀部", 
        coords: "50,54", 
        path: "M 44 49 L 56 49 L 58 58 L 42 58 Z" 
    },
    kneeLeft: { 
        label: "左膝", 
        coords: "42,70", 
        path: "M 43 59 L 39 74 L 44 74 L 48 59 Z" 
    },
    kneeRight: { 
        label: "右膝", 
        coords: "58,70", 
        path: "M 57 59 L 61 74 L 56 74 L 52 59 Z" 
    },
    ankleLeft: { 
        label: "左踝/脚部", 
        coords: "38,84", 
        path: "M 39.5 75 L 36 86 L 41 87 L 43.5 75 Z" 
    },
    ankleRight: { 
        label: "右踝/脚部", 
        coords: "62,84", 
        path: "M 60.5 75 L 64 86 L 59 87 L 56.5 75 Z" 
    }
};

const PAIN_COLORS = [
    "#06b6d4", // 0: None / Cyan glow
    "#10b981", // 1: Mild / Green
    "#eab308", // 2: Discomfort / Yellow
    "#f97316", // 3: Moderate / Orange
    "#ef4444", // 4: Sore / Dark Orange
    "#dc2626"  // 5: Severe / Red
];

const PAIN_LABELS = [
    "🟢 完美 (Fine - 0)",
    "🔵 轻微酸痛 (Mild - 1)",
    "🟡 紧绷不适 (Tight - 2)",
    "🟠 中度疼痛 (Moderate - 3)",
    "🔴 明显伤痛 (Sore - 4)",
    "💀 严重伤病 (Severe - 5)"
];

export function InjuryMap({ swimmerId, readOnly = false, teamHeatMapData, initialBodyMap, onSaveSuccess }: InjuryMapProps) {
    const [bodyMap, setBodyMap] = useState<Record<string, number>>({});
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (!isMounted) return;
            if (initialBodyMap) {
                setBodyMap(initialBodyMap);
            } else if (swimmerId && !readOnly) {
                // Load swimmer's initial body map from API
                api.auth.me().then(me => {
                    if (isMounted && me && me.id === swimmerId && me.injuryBodyMap) {
                        try {
                            const parsed = typeof me.injuryBodyMap === "string" 
                                ? JSON.parse(me.injuryBodyMap) 
                                : me.injuryBodyMap;
                            setBodyMap(parsed || {});
                        } catch {
                            setBodyMap({});
                        }
                    }
                });
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [swimmerId, initialBodyMap, readOnly]);

    // Handle map click
    const handlePartClick = (part: string) => {
        if (readOnly) return;
        setSelectedPart(part);
    };

    // Update pain scale
    const handlePainChange = (level: number) => {
        if (!selectedPart) return;
        setBodyMap(prev => ({
            ...prev,
            [selectedPart]: level
        }));
    };

    // Save changes
    const handleSave = async () => {
        if (!swimmerId) return;
        setSaving(true);
        setSaved(false);
        try {
            await api.swimmers.update(swimmerId, {
                injuryBodyMap: bodyMap
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            if (onSaveSuccess) onSaveSuccess();
        } catch (e) {
            console.error("Failed to save body injury map", e);
        } finally {
            setSaving(false);
        }
    };

    // Helper to get pain color for a part
    const getPartColor = (part: string): string => {
        if (readOnly && teamHeatMapData) {
            const score = teamHeatMapData[part] || 0;
            const index = Math.min(5, Math.round(score));
            return PAIN_COLORS[index];
        }
        const level = bodyMap[part] || 0;
        return PAIN_COLORS[level];
    };

    return (
        <div className="bg-card/40 border border-border rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6">
            
            {/* Left: Interative SVG Body Canvas */}
            <div className="flex-1 flex flex-col items-center">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">
                    {readOnly ? "📊 团队伤病热力图谱" : "👤 2D 互动伤病图谱"}
                </h4>
                
                <div className="relative w-64 aspect-[1/2] bg-slate-950/60 rounded-3xl border border-white/5 p-4 flex items-center justify-center">
                    {/* Glowing grid wires */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:16px_16px] rounded-3xl" />
                    
                    <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                        <defs>
                            <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Symmetric grid markers */}
                        <line x1="50" y1="5" x2="50" y2="95" stroke="#3b82f6" strokeWidth="0.1" strokeDasharray="2,2" opacity="0.3" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="#3b82f6" strokeWidth="0.1" strokeDasharray="2,2" opacity="0.3" />

                        {/* Interactive Body Path Regions */}
                        {Object.entries(BODY_PARTS).map(([key, part]) => {
                            const color = getPartColor(key);
                            const isActive = selectedPart === key;
                            const score = readOnly && teamHeatMapData ? (teamHeatMapData[key] || 0) : (bodyMap[key] || 0);

                            return (
                                <g 
                                    key={key} 
                                    className={cn("cursor-pointer transition-all", readOnly ? "pointer-events-none" : "hover:opacity-90")}
                                    onClick={() => handlePartClick(key)}
                                >
                                    {/* Glowing back outline path for severity */}
                                    {score > 0 && (
                                        <path 
                                            d={part.path} 
                                            fill="none" 
                                            stroke={color} 
                                            strokeWidth="2.5" 
                                            opacity="0.4"
                                            filter="url(#neonPulse)"
                                        />
                                    )}

                                    {/* Main Filled Region */}
                                    <path 
                                        d={part.path} 
                                        fill={score > 0 ? `${color}40` : "#1e293b50"} 
                                        stroke={isActive ? "#ffd700" : score > 0 ? color : "#475569"} 
                                        strokeWidth={isActive ? "1" : "0.5"} 
                                        className="transition-all duration-300"
                                    />
                                    
                                    {/* Hotspot anchor dots */}
                                    <circle 
                                        cx={part.coords.split(",")[0]} 
                                        cy={part.coords.split(",")[1]} 
                                        r="1.2" 
                                        fill={score > 0 ? color : "#94a3b8"} 
                                        className="animate-pulse"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>
                
                {!readOnly && (
                    <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-primary" /> 点击身体各个关节/肌肉区域来上报酸痛度
                    </p>
                )}
            </div>

            {/* Right: Pain Scale Selector panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
                {readOnly ? (
                    // COACH HEATMAP INSIGHT
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-primary" /> 热力负荷监测
                        </h5>
                        <p className="text-xs text-muted-foreground">
                            热力图表结合队员上传的伤病报告，红色区域表示高负荷痛感积累区（如肩膀、膝盖），建议调整今日训练强度或进行防拉伤指导。
                        </p>

                        <div className="space-y-2 pt-2">
                            {Object.entries(BODY_PARTS).map(([key, part]) => {
                                const score = teamHeatMapData?.[key] || 0;
                                const index = Math.min(5, Math.round(score));
                                if (score === 0) return null;

                                return (
                                    <div key={key} className="flex justify-between items-center text-xs p-2.5 bg-white/5 rounded-xl border border-white/5">
                                        <span className="font-medium text-white">{part.label}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full" 
                                                    style={{ width: `${(score / 5) * 100}%`, backgroundColor: PAIN_COLORS[index] }} 
                                                />
                                            </div>
                                            <span className="font-mono font-bold" style={{ color: PAIN_COLORS[index] }}>
                                                {score.toFixed(1)} / 5.0
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.values(teamHeatMapData || {}).every(s => s === 0) && (
                                <div className="text-center py-6 text-xs text-muted-foreground italic">
                                    🎉 全队身体状态极佳，无异常伤病积累
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // SWIMMER INDIVIDUAL EDITING
                    <div className="space-y-4">
                        {selectedPart ? (
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">当前选择区域</span>
                                    <h5 className="text-base font-bold text-white">{BODY_PARTS[selectedPart]?.label}</h5>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground block">选择您的酸痛/疼痛指数:</label>
                                    <div className="space-y-1.5">
                                        {PAIN_LABELS.map((label, idx) => {
                                            const isSelected = (bodyMap[selectedPart] || 0) === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePainChange(idx)}
                                                    className={cn(
                                                        "w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex justify-between items-center border",
                                                        isSelected 
                                                            ? "bg-white/10 border-white/20 text-white shadow-md" 
                                                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <span>{label}</span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-2xl h-48 text-center text-muted-foreground">
                                <span className="text-3xl mb-2">🤖</span>
                                <p className="text-xs">请在左侧人体图上点击任一肌肉或关节部位，对其当前的酸痛痛感进行打分。</p>
                            </div>
                        )}

                        {/* Save Button for Athlete */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                "w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                saved 
                                    ? "bg-green-500 text-white" 
                                    : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-[0_0_15px_rgba(100,255,218,0.2)]"
                            )}
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? "正在更新云端档案..." : saved ? "状态图谱已成功保存" : "同步提交至教练监测端"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
