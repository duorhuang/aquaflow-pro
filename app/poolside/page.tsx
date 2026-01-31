"use client";

import { MOCK_PLAN } from "@/lib/data";
import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PoolsidePage() {
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Safe access to items, assuming Main Set is present or just flattening for display
    const allItems = MOCK_PLAN.blocks.flatMap(b => b.items);
    const currentSet = allItems[currentSetIndex] || allItems[0];

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col">
            {/* Top Bar: Clock & Info */}
            <div className="flex justify-between items-center p-6 bg-white/5 border-b border-white/10">
                <h1 className="text-4xl font-mono font-bold text-primary">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <div className="text-right">
                    <p className="text-2xl font-bold">{MOCK_PLAN.group} Group</p>
                    <p className="text-muted-foreground">{MOCK_PLAN.focus}</p>
                </div>
            </div>

            {/* Main Content: Current Set */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />

                <div className="z-10 text-center space-y-8 max-w-5xl">
                    <div className="text-[150px] font-bold leading-none tracking-tighter text-primary font-mono glow">
                        {currentSet.distance}m
                    </div>

                    <div className="text-6xl font-medium uppercase tracking-wide text-white/90">
                        {currentSet.stroke}
                    </div>

                    <div className="text-4xl text-muted-foreground bg-black/50 p-6 rounded-2xl border border-white/10">
                        {currentSet.description}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="h-32 bg-white/5 flex items-center justify-between px-12 border-t border-white/10">
                <div className="flex items-center gap-4 text-2xl text-muted-foreground">
                    <span className="font-mono text-primary">Set {currentSetIndex + 1}</span>
                    <span>/</span>
                    <span>{allItems.length}</span>
                </div>

                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                            "p-6 rounded-full transition-all",
                            isPlaying ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        )}
                    >
                        {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
                    </button>

                    <button
                        onClick={() => setCurrentSetIndex((prev) => (prev + 1) % allItems.length)}
                        className="p-6 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                        <SkipForward className="w-12 h-12" />
                    </button>
                </div>

                <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground">
                    <Maximize2 className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
