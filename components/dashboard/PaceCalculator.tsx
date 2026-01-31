"use client";

import { useState, useMemo } from "react";
import { Timer, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// Time Helper
const parseTime = (str: string): number => {
    // text to seconds. e.g. "1:30" -> 90
    if (!str) return 0;
    const parts = str.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(str);
};

const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export function PaceCalculator() {
    const [baseDistance, setBaseDistance] = useState(100);
    const [baseTimeStr, setBaseTimeStr] = useState("1:30");
    const [mode, setMode] = useState<"Base" | "CSS">("Base");

    const baseSeconds = useMemo(() => parseTime(baseTimeStr), [baseTimeStr]);
    const pacePer100 = useMemo(() => {
        if (baseDistance === 0) return 0;
        return (baseSeconds / baseDistance) * 100;
    }, [baseSeconds, baseDistance]);

    const TARGET_DISTANCES = [50, 100, 200, 300, 400, 800, 1500];

    return (
        <div className="p-4 space-y-6">
            <div className="bg-secondary/30 rounded-xl p-3 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                    <Calculator className="w-3 h-3" />
                    设定基准
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">距离 (m)</label>
                        <select
                            value={baseDistance}
                            onChange={(e) => setBaseDistance(parseInt(e.target.value))}
                            className="w-full bg-black/20 text-white text-xs p-2 rounded-lg outline-none border border-transparent focus:border-primary/50"
                        >
                            <option value={50}>50m</option>
                            <option value={100}>100m</option>
                            <option value={200}>200m</option>
                            <option value={400}>400m</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">包干时间 (mm:ss)</label>
                        <input
                            type="text"
                            value={baseTimeStr}
                            onChange={(e) => setBaseTimeStr(e.target.value)}
                            placeholder="1:30"
                            className="w-full bg-black/20 text-white text-xs p-2 rounded-lg outline-none border border-transparent focus:border-primary/50"
                        />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">每百米配速</p>
                    <p className="text-xl font-bold text-primary font-mono">{formatTime(pacePer100)}</p>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase">推算表</h4>
                <div className="grid grid-cols-2 gap-2">
                    {TARGET_DISTANCES.map(dist => {
                        const time = formatTime((pacePer100 / 100) * dist);
                        return (
                            <div key={dist} className="bg-white/5 p-2 rounded-lg flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">{dist}m</span>
                                <span className="text-sm font-mono font-bold text-white max-w-[50%] truncate ml-2">
                                    {time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-[10px] text-yellow-200 leading-relaxed">
                    💡 提示: 输入您的 "Base Interval" (如 100m 包干 1:40)，此处即显示长距离对应的包干时间。
                </p>
            </div>
        </div>
    );
}
