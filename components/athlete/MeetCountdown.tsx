"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

import { Meet } from "@/types";

export function MeetCountdown() {
    const { t } = useLanguage();
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
                seconds: Math.floor((diff / 1000) % 60),
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
                setIsDarkGold(data.isDarkGoldActive || false);
                
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
                "border rounded-xl p-5 relative overflow-hidden transition-all",
                isDarkGold 
                    ? "border-amber-500/30 bg-amber-500/5" 
                    : "border-border bg-card shadow-xs"
            )}
        >
            <div className="flex flex-col space-y-3.5">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                    <span 
                        className={cn(
                            "text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-semibold border",
                            isDarkGold 
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-sans" 
                                : "bg-primary/10 border-primary/20 text-primary"
                        )}
                    >
                        {isDarkGold ? "备战倒计时" : "下一场赛事"}
                    </span>
                    {isDarkGold && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> 备战周期中
                        </span>
                    )}
                </div>

                {/* Meet Details */}
                <div>
                    <h3 className="text-base font-bold text-foreground leading-tight line-clamp-1">
                        {meet.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {meet.date} {meet.time || ""}
                        </span>
                        {meet.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                {meet.location}
                            </span>
                        )}
                    </div>
                    {meet.description && (
                        <p className="text-xs text-muted-foreground mt-2 bg-secondary p-2.5 rounded-lg border border-border leading-relaxed">
                            {meet.description}
                        </p>
                    )}
                </div>

                {/* Countdown Time Display (Split Cards Style) */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                        { label: "天", val: timeLeft.days },
                        { label: "时", val: timeLeft.hours },
                        { label: "分", val: timeLeft.minutes },
                        { label: "秒", val: timeLeft.seconds },
                    ].map((item, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "flex flex-col items-center py-2 px-1 rounded-lg border text-center transition-all",
                                isDarkGold 
                                    ? "bg-amber-500/10 border-amber-500/20" 
                                    : "bg-secondary border-border"
                            )}
                        >
                            <span 
                                className={cn(
                                    "text-xl sm:text-2xl font-mono font-bold leading-none tracking-tight",
                                    isDarkGold ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                )}
                            >
                                {String(item.val).padStart(2, "0")}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium mt-1">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
