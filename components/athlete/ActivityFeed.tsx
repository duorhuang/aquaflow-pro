"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
    Bell,
    Sparkles,
    TrendingUp,
    Coins,
    Gift,
    Calendar,
    X,
    UserCheck
} from "lucide-react";

import { ActivityFeedItem } from "@/types";

interface ActivityFeedProps {
    swimmerId: string;
    onFeedUpdated?: () => void;
}

export function ActivityFeed({ swimmerId, onFeedUpdated }: ActivityFeedProps) {
    const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
    const [, setLoading] = useState(true);
    const fetchingRef = React.useRef(false);
    const [showTray, setShowTray] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const trayRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    // Load feed
    const loadFeed = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            const data = await api.activityFeed.get(swimmerId);
            if (data) {
                setFeedItems(data || []);
                const unread = data.filter((item: ActivityFeedItem) => !item.isRead).length;
                setUnreadCount(unread);
            }
        } catch (e) {
            console.warn("Failed to load activity feed", e);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [swimmerId]);

    useEffect(() => {
        let isMounted = true;
        const safeLoadFeed = () => {
            if (isMounted) {
                loadFeed();
            }
        };
        const delayTimer = setTimeout(safeLoadFeed, 0);
        // Set up periodic reload every 30 seconds for real-time gold coin rains / coach star awards
        const interval = setInterval(safeLoadFeed, 30000);
        return () => {
            isMounted = false;
            clearTimeout(delayTimer);
            clearInterval(interval);
        };
    }, [loadFeed]);

    // Mark one item as read
    const handleReadOne = async (itemId: string) => {
        try {
            await api.activityFeed.readOne(swimmerId, itemId);
            // Instantly update local state
            setFeedItems(prev => prev.map(item => item.id === itemId ? { ...item, isRead: true } : item));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (onFeedUpdated) onFeedUpdated();
        } catch (e) {
            console.warn("Failed to mark item read", e);
        }
    };

    // Mark all as read
    const handleReadAll = async () => {
        try {
            await api.activityFeed.readAll(swimmerId);
            setFeedItems(prev => prev.map(item => ({ ...item, isRead: true })));
            setUnreadCount(0);
            if (onFeedUpdated) onFeedUpdated();
        } catch (e) {
            console.warn("Failed to mark all read", e);
        }
    };

    // Get item styling/icon
    const getItemVisuals = (type: string) => {
        switch (type) {
            case "coach_reward":
                return {
                    icon: <Gift className="w-4 h-4 text-yellow-400" />,
                    bg: "bg-yellow-500/10 border-yellow-500/20",
                    indicator: "bg-yellow-400"
                };
            case "buddy_sync":
                return {
                    icon: <UserCheck className="w-4 h-4 text-purple-400" />,
                    bg: "bg-purple-500/10 border-purple-500/20",
                    indicator: "bg-purple-400"
                };
            case "levelup":
                return {
                    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                    indicator: "bg-emerald-400"
                };
            case "meet_reminder":
                return {
                    icon: <Calendar className="w-4 h-4 text-blue-400" />,
                    bg: "bg-blue-500/10 border-blue-500/20",
                    indicator: "bg-blue-400"
                };
            case "purchase":
                return {
                    icon: <Coins className="w-4 h-4 text-pink-400" />,
                    bg: "bg-pink-500/10 border-pink-500/20",
                    indicator: "bg-pink-400"
                };
            default:
                return {
                    icon: <Sparkles className="w-4 h-4 text-primary" />,
                    bg: "bg-primary/10 border-primary/20",
                    indicator: "bg-primary"
                };
        }
    };

    // Focus trap + Escape key for drawer
    useEffect(() => {
        if (!showTray) return;

        // Focus the close button when drawer opens
        setTimeout(() => closeBtnRef.current?.focus(), 100);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowTray(false);
                return;
            }

            // Basic focus trap: if focus leaves the tray, bring it back
            if (e.key === 'Tab' && trayRef.current) {
                const focusable = trayRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const firstEl = focusable[0] as HTMLElement;
                const lastEl = focusable[focusable.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showTray]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowTray(false);
        }
    };

    return (
        <div className="relative">
            {/* TRAY TRIGGER BUTTON WITH FLOATING BADGE */}
            <button
                onClick={() => setShowTray(true)}
                className="relative p-3 min-w-[48px] min-h-[48px] flex items-center justify-center bg-secondary/50 hover:bg-secondary border border-white/5 rounded-xl transition-colors text-white"
                aria-label="通知信息流"
            >
                <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-wiggle")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[9px] font-bold w-4.5 h-4.5 rounded-full border border-background flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* FLOATING NOTIFICATION TRAY SLIDEOUT */}
            {showTray && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-label="互动通知流"
                >
                    <div ref={trayRef} className="w-full max-w-sm bg-slate-950 border-l border-white/10 h-screen max-h-[100dvh] flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">

                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">互动通知流</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleReadAll}
                                        className="text-xs text-primary hover:underline font-bold px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors"
                                        aria-label="全部标记为已读"
                                    >
                                        全部已读
                                    </button>
                                )}
                                <button
                                    ref={closeBtnRef}
                                    onClick={() => setShowTray(false)}
                                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
                                    aria-label="关闭通知"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                            {feedItems.length > 0 ? (
                                feedItems.map(item => {
                                    const styles = getItemVisuals(item.type);
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => !item.isRead && handleReadOne(item.id)}
                                            className={cn(
                                                "p-4 border rounded-2xl transition-all cursor-pointer relative overflow-hidden flex gap-3",
                                                styles.bg,
                                                !item.isRead ? "shadow-md hover:scale-[1.01]" : "opacity-60"
                                            )}
                                        >
                                            {/* Unread dot indicator */}
                                            {!item.isRead && (
                                                <span className={cn("absolute top-2 right-2 w-1.5 h-1.5 rounded-full", styles.indicator)} />
                                            )}

                                            {/* Icon */}
                                            <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                {styles.icon}
                                            </div>

                                            {/* Description */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                                                {item.detail && (
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                        {item.detail}
                                                    </p>
                                                )}
                                                
                                                <div className="flex justify-between items-center mt-2.5">
                                                    <span className="text-[8px] text-muted-foreground font-mono">
                                                        {new Date(item.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {item.xpAmount !== null && item.xpAmount !== undefined && (
                                                        <span className={cn(
                                                            "text-xs font-mono font-bold",
                                                            item.xpAmount > 0 ? "text-yellow-400" : "text-pink-400"
                                                        )}>
                                                            {item.xpAmount > 0 ? `+${item.xpAmount}` : item.xpAmount} XP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
                                    <Bell className="w-12 h-12 opacity-25 mb-2" />
                                    <p className="text-xs">暂无任何通知动态 🏖</p>
                                </div>
                            )}
                        </div>

                        {/* Footer tip */}
                        <div className="p-4 bg-slate-900/40 border-t border-white/5 text-center text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                            ✨ Real-time coaching system feed
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ActivityFeed;
