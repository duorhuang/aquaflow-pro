"use client";

import { useStore } from "@/lib/store";
import { Trophy, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export function RecentPerformances() {
    const { performances, swimmers } = useStore();
    const { t } = useLanguage();

    // Get latest 5 performances across all swimmers
    const recentPerfs = [...performances]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getSwimmerName = (id: string) => {
        const s = swimmers.find(sw => sw.id === id);
        return s ? s.name : "未知队员";
    };

    const EVENT_LABELS: Record<string, string> = {
        "50Free": "50m 自由泳", "100Free": "100m 自由泳", "200Free": "200m 自由泳", "400Free": "400m 自由泳", "800Free": "800m 自由泳", "1500Free": "1500m 自由泳",
        "50Back": "50m 仰泳", "100Back": "100m 仰泳", "200Back": "200m 仰泳",
        "50Breast": "50m 蛙泳", "100Breast": "100m 蛙泳", "200Breast": "200m 蛙泳",
        "50Fly": "50m 蝶泳", "100Fly": "100m 蝶泳", "200Fly": "200m 蝶泳",
        "200IM": "200m 混泳", "400IM": "400m 混泳"
    };

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
        <div className="bg-card border border-white/10 rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    最新成绩
                </h3>
            </div>

            <div className="space-y-4">
                {recentPerfs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        暂无成绩记录
                    </div>
                ) : (
                    recentPerfs.map((perf) => (
                        <div key={perf.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                    {getSwimmerName(perf.swimmerId).charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{getSwimmerName(perf.swimmerId)}</span>
                                        <span className="text-xs text-muted-foreground">{perf.date}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>{EVENT_LABELS[perf.event]}</span>
                                        {perf.isPB && (
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 rounded font-bold">PB</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono font-bold text-white">
                                    {formatTime(perf.time)}
                                </div>
                                {perf.improvement !== undefined && (
                                    <div className={cn(
                                        "text-[10px] flex items-center justify-end gap-0.5",
                                        perf.improvement < 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {perf.improvement < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                        {Math.abs(perf.improvement).toFixed(2)}s
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
