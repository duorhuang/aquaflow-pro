"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Calendar, MapPin, Trophy, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meet {
    id: string;
    name: string;
    date: string;
    time?: string | null;
    location?: string | null;
    description?: string | null;
    isActive: boolean;
}

export function MeetCountdown() {
    const [loading, setLoading] = useState(true);
    const [meet, setMeet] = useState<Meet | null>(null);
    const [isDarkGold, setIsDarkGold] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback((targetMeet: Meet) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        const updateClock = () => {
            const meetDateStr = targetMeet.date; // YYYY-MM-DD
            const meetTimeStr = targetMeet.time || '00:00'; // HH:MM
            const meetDateTime = new Date(`${meetDateStr}T${meetTimeStr}:00`).getTime();
            const now = new Date().getTime();
            const diff = meetDateTime - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 100) % 60), // Keep high fidelity or standard seconds
            });
        };

        updateClock();
        intervalRef.current = setInterval(updateClock, 1000);
    }, []);

    const fetchCountdown = useCallback(async () => {
        try {
            const data = await api.meets.getCountdown();
            if (data && data.closestMeet) {
                setMeet(data.closestMeet);
                setIsDarkGold(data.isDarkGoldActive);
                
                // Inject dark gold theme class globally to document.documentElement
                if (data.isDarkGoldActive) {
                    document.documentElement.classList.add("theme-dark-gold");
                } else {
                    document.documentElement.classList.remove("theme-dark-gold");
                }
                
                startTimer(data.closestMeet);
            } else {
                setMeet(null);
                document.documentElement.classList.remove("theme-dark-gold");
            }
        } catch (e) {
            console.error("Failed to load meet countdown", e);
        } finally {
            setLoading(false);
        }
    }, [startTimer]);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                fetchCountdown();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.documentElement.classList.remove("theme-dark-gold");
        };
    }, [fetchCountdown]);

    if (loading || !meet) return null;

    return (
        <div 
            className={cn(
                "glass-panel border rounded-3xl p-6 relative overflow-hidden transition-all duration-500",
                isDarkGold 
                    ? "gold-glow border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-600/5 to-slate-950 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-pulse-slow" 
                    : "border-white/5 bg-slate-900/40"
            )}
        >
            {/* Ambient gold glow decoration */}
            {isDarkGold && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-2xl rounded-full pointer-events-none" />
            )}

            <div className="flex flex-col space-y-4">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                    <span 
                        className={cn(
                            "text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold border",
                            isDarkGold 
                                ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 font-sans" 
                                : "bg-primary/20 border-primary/30 text-primary"
                        )}
                    >
                        {isDarkGold ? "🏆 倒计时备战 · 战鼓擂响" : "📅 下一战赛事预告"}
                    </span>
                    {isDarkGold && (
                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> 黄金备战主题已激活
                        </span>
                    )}
                </div>

                {/* Meet Details */}
                <div>
                    <h3 
                        className={cn(
                            "text-xl font-bold leading-tight line-clamp-1",
                            isDarkGold ? "gold-text-gradient" : "text-white"
                        )}
                    >
                        {meet.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary/70" />
                            {meet.date} {meet.time || ""}
                        </span>
                        {meet.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                {meet.location}
                            </span>
                        )}
                    </div>
                    {meet.description && (
                        <p className="text-xs text-muted-foreground/80 mt-2 bg-white/5 p-2 rounded-xl border border-white/5 leading-relaxed">
                            {meet.description}
                        </p>
                    )}
                </div>

                {/* Countdown Time Display (Split Cards Style) */}
                <div className="grid grid-cols-4 gap-3 pt-2">
                    {[
                        { label: "DAYS", val: timeLeft.days },
                        { label: "HOURS", val: timeLeft.hours },
                        { label: "MINS", val: timeLeft.minutes },
                        { label: "SECS", val: timeLeft.seconds },
                    ].map((item, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "flex flex-col items-center p-3 rounded-2xl border text-center transition-all",
                                isDarkGold 
                                    ? "bg-slate-950/80 border-yellow-500/20 shadow-[inset_0_1px_3px_rgba(212,175,55,0.1)]" 
                                    : "bg-slate-950/40 border-white/5"
                            )}
                        >
                            <span 
                                className={cn(
                                    "text-2xl font-mono font-bold leading-none tracking-tight",
                                    isDarkGold ? "text-yellow-400" : "text-white"
                                )}
                            >
                                {String(item.val).padStart(2, "0")}
                            </span>
                            <span className="text-[8px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
