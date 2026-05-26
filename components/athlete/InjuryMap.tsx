"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ShieldAlert, Info, Check, Save, ImagePlus, Loader2, X } from "lucide-react";

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
        coords: "100,30", 
        path: "M 100 10 L 115 15 L 120 30 L 110 45 L 100 50 L 90 45 L 80 30 L 85 15 Z" 
    },
    neck: { 
        label: "颈部", 
        coords: "100,52", 
        path: "M 90 45 L 100 50 L 110 45 L 115 60 L 85 60 Z" 
    },
    shoulderLeft: { 
        label: "左肩", 
        coords: "65,70", 
        path: "M 85 60 L 35 65 L 55 90 Z" 
    },
    shoulderRight: { 
        label: "右肩", 
        coords: "135,70", 
        path: "M 115 60 L 165 65 L 145 90 Z" 
    },
    chest: { 
        label: "胸部", 
        coords: "100,85", 
        path: "M 85 60 L 115 60 L 145 90 L 100 105 L 55 90 Z" 
    },
    abdomen: { 
        label: "腹部", 
        coords: "100,135", 
        path: "M 80 97 L 100 105 L 120 97 L 115 155 L 100 165 L 85 155 Z" 
    },
    waistLeft: { 
        label: "左腰部", 
        coords: "70,125", 
        path: "M 55 90 L 80 97 L 85 155 L 70 145 Z" 
    },
    waistRight: { 
        label: "右腰部", 
        coords: "130,125", 
        path: "M 145 90 L 120 97 L 115 155 L 130 145 Z" 
    },
    hip: { 
        label: "髋部/臀部", 
        coords: "100,170", 
        path: "M 70 145 L 85 155 L 100 165 L 115 155 L 130 145 L 135 175 L 100 195 L 65 175 Z" 
    },
    armUpperLeft: { 
        label: "左大臂", 
        coords: "40,105", 
        path: "M 35 65 L 55 90 L 45 140 L 25 130 Z" 
    },
    armUpperRight: { 
        label: "右大臂", 
        coords: "160,105", 
        path: "M 165 65 L 145 90 L 155 140 L 175 130 Z" 
    },
    armLowerLeft: { 
        label: "左小臂", 
        coords: "30,160", 
        path: "M 25 130 L 45 140 L 30 190 L 15 180 Z" 
    },
    armLowerRight: { 
        label: "右小臂", 
        coords: "170,160", 
        path: "M 175 130 L 155 140 L 170 190 L 185 180 Z" 
    },
    handLeft: { 
        label: "左手", 
        coords: "20,195", 
        path: "M 15 180 L 30 190 L 20 215 L 5 205 Z" 
    },
    handRight: { 
        label: "右手", 
        coords: "180,195", 
        path: "M 185 180 L 170 190 L 180 215 L 195 205 Z" 
    },
    thighLeft: { 
        label: "左大腿 (含内侧)", 
        coords: "80,230", 
        path: "M 65 175 L 98 195 L 90 280 L 70 280 Z" 
    },
    thighRight: { 
        label: "右大腿 (含内侧)", 
        coords: "120,230", 
        path: "M 135 175 L 102 195 L 110 280 L 130 280 Z" 
    },
    calfLeft: { 
        label: "左小腿", 
        coords: "80,320", 
        path: "M 70 280 L 90 280 L 95 315 L 85 365 L 75 365 L 60 315 Z" 
    },
    calfRight: { 
        label: "右小腿", 
        coords: "120,320", 
        path: "M 130 280 L 110 280 L 105 315 L 115 365 L 125 365 L 140 315 Z" 
    },
    footLeft: { 
        label: "左脚", 
        coords: "75,380", 
        path: "M 75 365 L 85 365 L 85 395 L 65 395 Z" 
    },
    footRight: { 
        label: "右脚", 
        coords: "125,380", 
        path: "M 125 365 L 115 365 L 115 395 L 135 395 Z" 
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
    const [injuryNote, setInjuryNote] = useState("");
    const [injuryImageUrl, setInjuryImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (!isMounted) return;
            if (initialBodyMap) {
                setBodyMap(initialBodyMap);
            } else if (swimmerId && !readOnly) {
                // Load swimmer's initial body map from API
                api.auth.me().then(me => {
                    if (isMounted && me && me.id === swimmerId) {
                        if (me.injuryBodyMap) {
                            try {
                                const parsed = typeof me.injuryBodyMap === "string" 
                                    ? JSON.parse(me.injuryBodyMap) 
                                    : me.injuryBodyMap;
                                setBodyMap(parsed || {});
                            } catch {
                                setBodyMap({});
                            }
                        }
                        if (me.injuryNote) setInjuryNote(me.injuryNote);
                        if (me.injuryImageUrl) setInjuryImageUrl(me.injuryImageUrl);
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
                injuryBodyMap: bodyMap,
                injuryNote,
                injuryImageUrl
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const res = await api.upload.file(file);
            if (res.url) {
                setInjuryImageUrl(res.url);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("图片上传失败，请重试");
        } finally {
            setUploading(false);
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
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:16px_16px] rounded-3xl pointer-events-none" />
                    
                    <svg viewBox="0 0 200 400" className="relative z-10 w-full h-full select-none pointer-events-auto">
                        <defs>
                            <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Symmetric grid markers */}
                        <line x1="100" y1="0" x2="100" y2="400" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="5,5" opacity="0.3" />
                        <line x1="0" y1="200" x2="200" y2="200" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="5,5" opacity="0.3" />

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
                                            strokeWidth="5" 
                                            opacity="0.4"
                                            filter="url(#neonPulse)"
                                        />
                                    )}

                                    {/* Main Filled Region */}
                                    <path 
                                        d={part.path} 
                                        fill={score > 0 ? `${color}40` : "#1e293b50"} 
                                        stroke={isActive ? "#ffd700" : score > 0 ? color : "#475569"} 
                                        strokeWidth={isActive ? "2.5" : "1.5"} 
                                        className="transition-all duration-300"
                                    />
                                    
                                    {/* Hotspot anchor dots */}
                                    <circle 
                                        cx={part.coords.split(",")[0]} 
                                        cy={part.coords.split(",")[1]} 
                                        r="3.5" 
                                        fill={score > 0 ? color : "#94a3b8"} 
                                        className="animate-pulse"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>
                
                {!readOnly && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
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
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">当前选择区域</span>
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

                        {/* Injury Documentation Section */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                            <h5 className="text-sm font-bold text-white mb-2">详细病情与照片记录</h5>
                            <textarea
                                value={injuryNote}
                                onChange={(e) => setInjuryNote(e.target.value)}
                                placeholder="请描述一下疼痛的具体感觉、发生时间或任何其他相关信息..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                            />
                            
                            {/* Image Upload Area */}
                            <div>
                                {injuryImageUrl ? (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                                        <img src={injuryImageUrl} alt="Injury" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => setInjuryImageUrl("")}
                                            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-20 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors text-muted-foreground hover:text-white">
                                        {uploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <ImagePlus className="w-4 h-4" />
                                                <span className="text-xs">上传受伤部位照片</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

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
