"use client";

import { PerformanceRecord, SwimEvent } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
    performances: PerformanceRecord[];
    event: SwimEvent;
}

const EVENT_LABELS: Record<SwimEvent, string> = {
    "50Free": "50m 自由泳",
    "100Free": "100m 自由泳",
    "200Free": "200m 自由泳",
    "400Free": "400m 自由泳",
    "800Free": "800m 自由泳",
    "1500Free": "1500m 自由泳",
    "50Back": "50m 仰泳",
    "100Back": "100m 仰泳",
    "200Back": "200m 仰泳",
    "50Breast": "50m 蛙泳",
    "100Breast": "100m 蛙泳",
    "200Breast": "200m 蛙泳",
    "50Fly": "50m 蝶泳",
    "100Fly": "100m 蝶泳",
    "200Fly": "200m 蝶泳",
    "200IM": "200m 混合泳",
    "400IM": "400m 混合泳"
};

export function PerformanceChart({ performances, event }: PerformanceChartProps) {
    const eventPerfs = performances
        .filter(p => p.event === event)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (eventPerfs.length === 0) {
        return (
            <div className="bg-card/30 border border-border rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    暂无 {EVENT_LABELS[event]} 成绩记录
                </p>
            </div>
        );
    }

    // Calculate chart dimensions
    const times = eventPerfs.map(p => parseFloat(p.time));
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const timeRange = maxTime - minTime || 1;

    const chartWidth = 300;
    const chartHeight = 150;
    const padding = 20;

    // Calculate points
    const points = eventPerfs.map((p, i) => {
        const x = padding + (i / Math.max(eventPerfs.length - 1, 1)) * (chartWidth - 2 * padding);
        const y = chartHeight - padding - ((parseFloat(p.time) - minTime) / timeRange) * (chartHeight - 2 * padding);
        return { x, y, perf: p };
    });

    // Calculate improvement
    const firstTime = parseFloat(eventPerfs[0].time);
    const lastTime = parseFloat(eventPerfs[eventPerfs.length - 1].time);
    const totalImprovement = firstTime - lastTime;
    const improvementPercent = (totalImprovement / firstTime) * 100;

    const formatTime = (timeStr: string) => {
        const time = parseFloat(timeStr);
        if (time >= 60) {
            const minutes = Math.floor(time / 60);
            const seconds = (time % 60).toFixed(2);
            return `${minutes}:${seconds.padStart(5, '0')}`;
        }
        return `${time.toFixed(2)}s`;
    };

    return (
        <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white">{EVENT_LABELS[event]}</h4>
                <div className={cn(
                    "flex items-center gap-1 text-sm font-bold",
                    totalImprovement > 0 ? "text-green-400" :
                        totalImprovement < 0 ? "text-red-400" : "text-muted-foreground"
                )}>
                    {totalImprovement > 0 ? (
                        <>
                            <TrendingDown className="w-4 h-4" />
                            <span>↓{totalImprovement.toFixed(2)}s ({improvementPercent.toFixed(1)}%)</span>
                        </>
                    ) : totalImprovement < 0 ? (
                        <>
                            <TrendingUp className="w-4 h-4" />
                            <span>↑{Math.abs(totalImprovement).toFixed(2)}s</span>
                        </>
                    ) : (
                        <span>持平</span>
                    )}
                </div>
            </div>

            {/* SVG Chart */}
            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto mb-4"
                style={{ maxHeight: '200px' }}
            >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => {
                    const y = padding + (i / 4) * (chartHeight - 2 * padding);
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={chartWidth - padding}
                            y2={y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Line */}
                {points.length > 1 && (
                    <polyline
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                    />
                )}

                {/* Points */}
                {points.map((point, i) => (
                    <g key={i}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={point.perf.isPB ? "var(--primary)" : "rgba(100,255,218,0.5)"}
                            stroke={point.perf.isPB ? "#fff" : "none"}
                            strokeWidth="2"
                        />
                        {point.perf.isPB && (
                            <text
                                x={point.x}
                                y={point.y - 10}
                                textAnchor="middle"
                                fill="var(--primary)"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                PB
                            </text>
                        )}
                    </g>
                ))}
            </svg>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground mb-1">最佳</p>
                    <p className="text-sm font-mono font-bold text-green-400">
                        {formatTime(minTime.toString())}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground mb-1">最新</p>
                    <p className="text-sm font-mono font-bold text-white">
                        {formatTime(lastTime.toString())}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground mb-1">记录数</p>
                    <p className="text-sm font-bold text-primary">
                        {eventPerfs.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
