"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface FeedItem {
    id: string;
    swimmerId: string;
    type: string;
    title: string;
    detail?: string;
    xpAmount?: number;
    isRead: boolean;
    createdAt: string;
}

interface ActivityFeedProps {
    swimmerId: string;
    onFeedUpdated?: () => void;
}

export function ActivityFeed({ swimmerId, onFeedUpdated }: ActivityFeedProps) {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [, setLoading] = useState(true);
    const [showTray, setShowTray] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadFeed = useCallback(async () => {
        try {
            const data = await api.activityFeed.get(swimmerId);
            if (data) {
                setFeedItems(data || []);
                const unread = data.filter((item: FeedItem) => !item.isRead).length;
                setUnreadCount(unread);
            }
        } catch (e) {
            console.error("Failed to load activity feed", e);
        } finally {
            setLoading(false);
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
            console.error("Failed to mark item read", e);
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
            console.error("Failed to mark all read", e);
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

    return (
        <div className="relative">
            {/* TRAY TRIGGER BUTTON WITH FLOATING BADGE */}
            <button
                onClick={() => setShowTray(true)}
                className="relative p-2.5 bg-secondary/50 hover:bg-secondary border border-white/5 rounded-xl transition-colors text-white"
                title="通知信息流"
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-slate-950 border-l border-white/10 h-full flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">
                        
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
                                        className="text-[10px] text-primary hover:underline font-bold"
                                    >
                                        全部已读
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowTray(false)}
                                    className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                                                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                        {item.detail}
                                                    </p>
                                                )}
                                                
                                                <div className="flex justify-between items-center mt-2.5">
                                                    <span className="text-[8px] text-muted-foreground font-mono">
                                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {item.xpAmount !== null && item.xpAmount !== undefined && (
                                                        <span className={cn(
                                                            "text-[10px] font-mono font-bold",
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
