"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, fetchAPI } from "@/lib/api-client";

const GROUPS = ["Junior", "Intermediate", "Advanced", "External"];

interface PoolsidePlan {
    group: string;
    focus: string;
    allItems: Array<{ distance: number; stroke: string; description: string; intensity?: string }>;
}

export default function PoolsidePage() {
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(new Date());
    const [selectedGroup, setSelectedGroup] = useState(GROUPS[0]);
    const [plan, setPlan] = useState<PoolsidePlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let isMounted = true;
        setError(null);

        fetchAPI<any[]>(`/plans?group=${selectedGroup}`)
            .then((plans: any[]) => {
                if (!isMounted) return;
                const today = new Date().toISOString().split('T')[0];
                const todayPlan = plans?.find((p: any) => p.date === today);
                const fallback = plans?.[0];
                const p = todayPlan || fallback;
                if (p && p.blocks) {
                    const items = p.blocks.flatMap((b: any) => b.items || []);
                    setPlan({ group: p.group, focus: p.focus, allItems: items });
                } else {
                    setPlan(null);
                }
            })
            .catch((e) => {
                if (!isMounted) return;
                setError(e.message || 'Failed to load plan');
                setPlan(null);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [selectedGroup]);

    const items = plan?.allItems || [];
    const currentSet = items[currentSetIndex] || items[0];

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-6 bg-white/5 border-b border-white/10">
                <h1 className="text-4xl font-mono font-bold text-primary">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <div className="flex items-center gap-4">
                    {GROUPS.map(g => (
                        <button
                            key={g}
                            onClick={() => setSelectedGroup(g)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                selectedGroup === g
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white/10 text-muted-foreground hover:text-white"
                            )}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">{plan?.group || "—"}</p>
                    <p className="text-muted-foreground">{plan?.focus || ""}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {loading ? (
                    <div className="text-3xl text-muted-foreground animate-pulse">加载中...</div>
                ) : error ? (
                    <div className="text-center space-y-4">
                        <div className="text-2xl text-red-400">加载失败</div>
                        <div className="text-lg text-muted-foreground">{error}</div>
                        <button
                            onClick={() => { setLoading(true); setError(null); }}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:brightness-110"
                        >
                            重试
                        </button>
                    </div>
                ) : !currentSet ? (
                    <div className="text-3xl text-muted-foreground">今日暂无训练计划</div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        <div className="z-10 text-center space-y-8 max-w-5xl">
                            <div className="text-[150px] font-bold leading-none tracking-tighter text-primary font-mono">
                                {currentSet.distance}m
                            </div>
                            <div className="text-6xl font-medium uppercase tracking-wide text-white/90">
                                {currentSet.stroke}
                            </div>
                            <div className="text-4xl text-muted-foreground bg-black/50 p-6 rounded-2xl border border-white/10">
                                {currentSet.description}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="h-32 bg-white/5 flex items-center justify-between px-12 border-t border-white/10">
                <div className="flex items-center gap-4 text-2xl text-muted-foreground">
                    <span className="font-mono text-primary">Set {currentSetIndex + 1}</span>
                    <span>/</span>
                    <span>{items.length}</span>
                </div>
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className={cn(
                            "p-6 rounded-full transition-all",
                            isPlaying ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        )}
                    >
                        {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
                    </button>
                    <button
                        onClick={() => setCurrentSetIndex((prev) => (prev + 1) % items.length)}
                        aria-label="下一组训练"
                        className="p-6 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                        <SkipForward className="w-12 h-12" />
                    </button>
                </div>
                <div className="w-12" />
            </div>
        </div>
    );
}
