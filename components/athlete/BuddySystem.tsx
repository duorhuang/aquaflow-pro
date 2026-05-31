"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { AvatarRenderer } from "./AvatarRenderer";
import { Swimmer } from "@/types";
import {
    Users,
    Search,
    UserPlus,
    Sparkles,
    Check,
    Trash2,
    UserCheck,
    ShieldAlert,
    Crown,
    Flame,
    Award,
} from "lucide-react";

interface BuddyPair {
    id: string;
    swimmer1Id: string;
    swimmer2Id: string;
    status: string;
    createdAt: string;
}

interface BuddySystemProps {
    swimmerId: string;
    onUpdateSwimmer?: () => void;
}

export function BuddySystem({ swimmerId, onUpdateSwimmer }: BuddySystemProps) {
    const [loading, setLoading] = useState(true);
    const [buddyPair, setBuddyPair] = useState<BuddyPair | null>(null); // active/pending pair
    const [buddySwimmer, setBuddySwimmer] = useState<Swimmer | null>(null); // buddy Swimmer object
    const [swimmers, setSwimmers] = useState<Swimmer[]>([]); // all team members
    const [meSwimmer, setMeSwimmer] = useState<Swimmer | null>(null); // own Swimmer object
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // Load buddy status and roster
    const loadBuddyData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // 1. Get buddy pair
            const res = await api.buddy.get(swimmerId);
            if (res && res.status !== "none") {
                setBuddyPair(res.pair);
                setBuddySwimmer(res.buddy);
            } else {
                setBuddyPair(null);
                setBuddySwimmer(null);
            }

            // 2. Fetch all team members for search
            const allSwimmers = await api.swimmers.getAll();
            if (allSwimmers) {
                const me = allSwimmers.find((s: Swimmer) => s.id === swimmerId);
                if (me) setMeSwimmer(me);

                // Filter out self
                const others = allSwimmers.filter((s: Swimmer) => s.id !== swimmerId);
                setSwimmers(others);
            }

        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "加载死党数据失败";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    }, [swimmerId]);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                loadBuddyData();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [loadBuddyData]);

    // Send buddy request
    const handleSendRequest = async (targetSwimmerId: string) => {
        setError("");
        setSuccess("");
        try {
            const res = await api.buddy.request(swimmerId, targetSwimmerId);
            if (res && res.success) {
                setSuccess("死党申请已成功发送！");
                setTimeout(() => setSuccess(""), 3000);
                loadBuddyData();
            } else {
                setError(res?.error || "发送申请失败");
                setTimeout(() => setError(""), 3000);
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "请求出错";
            setError(errMsg);
            setTimeout(() => setError(""), 3000);
        }
    };

    // Accept request
    const handleAcceptRequest = async (pairId: string) => {
        setError("");
        setSuccess("");
        try {
            const res = await api.buddy.accept(swimmerId, pairId);
            if (res && res.success) {
                setSuccess("你们正式成为死党！每天同步打卡可获得 +20 XP！");
                setTimeout(() => setSuccess(""), 4000);
                loadBuddyData();
                if (onUpdateSwimmer) onUpdateSwimmer();
            } else {
                setError(res?.error || "接受申请失败");
                setTimeout(() => setError(""), 3000);
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "处理请求出错";
            setError(errMsg);
            setTimeout(() => setError(""), 3000);
        }
    };

    // Dissolve buddy connection
    const handleDissolve = async (pairId: string) => {
        if (!window.confirm("确定要解除死党结对关系吗？解除后今天将无法享受打卡加成。")) return;
        setError("");
        setSuccess("");
        try {
            const res = await api.buddy.dissolve(swimmerId, pairId);
            if (res && res.success) {
                setSuccess("结对关系已解除");
                setTimeout(() => setSuccess(""), 3000);
                loadBuddyData();
                if (onUpdateSwimmer) onUpdateSwimmer();
            } else {
                setError(res?.error || "解除结对失败");
                setTimeout(() => setError(""), 3000);
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "解约出错";
            setError(errMsg);
            setTimeout(() => setError(""), 3000);
        }
    };

    // Helper: Filter swimmers by query
    const filteredSwimmers = swimmers.filter(s => {
        if (searchQuery.trim() === "") return false; // Don't show everything until typed
        return s.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Connecting Buddies...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            
            {/* Feedback Alerts */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {buddyPair && buddySwimmer ? (
                // ==========================================
                // CASE A: ACTIVE BUDDY OR PENDING ACTION
                // ==========================================
                buddyPair.status === "active" ? (
                    // ACTIVE BUDDY DETAIL VIEW
                    <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-slate-900 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.05)]">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 blur-3xl rounded-full" />
                        
                        {/* Dual-avatar stack */}
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="flex items-center gap-4 relative">
                                <div className="relative group">
                                    <AvatarRenderer 
                                        gender={buddySwimmer.gender || "male"} 
                                        equippedItems={buddySwimmer.equippedItems} 
                                        size={120} 
                                    />
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-500">
                                        Lv.{buddySwimmer.level || 1}
                                    </span>
                                </div>
                                
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg animate-pulse">
                                    ⚡
                                </div>

                                <div className="bg-slate-950 p-2.5 rounded-3xl border border-white/5 relative">
                                    <div className="text-xs text-muted-foreground uppercase text-center font-bold">ME</div>
                                    <div className="w-[100px] h-[100px] rounded-2xl bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center relative">
                                        {meSwimmer ? (
                                            <AvatarRenderer 
                                                gender={meSwimmer.gender || "male"} 
                                                equippedItems={meSwimmer.equippedItems || {}} 
                                                size={100} 
                                            />
                                        ) : (
                                            <AvatarRenderer 
                                                gender="male" 
                                                equippedItems={{}} 
                                                size={100} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                                    <Crown className="w-4 h-4 text-yellow-400" /> {buddySwimmer.name} <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-white/5 rounded">死党</span>
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono">
                                    <Award className="w-3 h-3 inline" /> {buddySwimmer.totalXp} XP · <Flame className="w-3 h-3 inline text-yellow-400" /> {buddySwimmer.currentStreak || 0} 天连胜
                                </p>
                            </div>
                        </div>

                        {/* Synchronization bonus card */}
                        <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 font-bold animate-pulse text-lg">
                                    🤝
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                                        同步打卡加成
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        你们双方今天都出勤，各得 +20 XP 同步奖励！
                                    </p>
                                </div>
                            </div>
                            
                            <span className="text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full whitespace-nowrap">
                                社交激励生效中
                            </span>
                        </div>

                        {/* Roster actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => handleDissolve(buddySwimmer.id)}
                                className="flex-1 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> 解除死党结对
                            </button>
                        </div>
                    </div>
                ) : buddyPair.swimmer1Id === swimmerId ? (
                    // PENDING OUTGOING REQUEST (SENT BY ME)
                    <div className="bg-card/40 border border-border rounded-3xl p-6 text-center space-y-4">
                        <Users className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
                        <div>
                            <h4 className="text-sm font-bold text-white">死党申请已发送</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                正在等待与 <b>{buddySwimmer.name}</b> 建立契约结对关系...
                            </p>
                        </div>
                        <button
                            onClick={() => handleDissolve(buddySwimmer.id)}
                            className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-white rounded-xl text-xs font-bold transition-all"
                        >
                            取消申请
                        </button>
                    </div>
                ) : (
                    // PENDING INCOMING REQUEST (RECEIVED)
                    <div className="bg-gradient-to-br from-purple-500/10 via-card to-card border border-purple-500/30 rounded-3xl p-6 text-center space-y-4 shadow-lg animate-in slide-in-from-bottom-2">
                        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
                        <div>
                            <span className="text-[9px] uppercase tracking-widest bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                                死党邀请
                            </span>
                            <h4 className="text-base font-bold text-white mt-3"><b>{buddySwimmer.name}</b> 邀请你成为死党</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                结对后，你们每天在训练日同步打卡均可多获得 <b>+20 XP</b> 的同步社交奖励！
                            </p>
                        </div>
                        
                        <div className="flex gap-3 max-w-xs mx-auto pt-2">
                            <button
                                onClick={() => handleDissolve(buddySwimmer.id)}
                                className="flex-1 py-2.5 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all"
                            >
                                婉拒
                            </button>
                            <button
                                onClick={() => handleAcceptRequest(buddySwimmer.id)}
                                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse"
                            >
                                <UserCheck className="w-4 h-4" /> 接受缔结
                            </button>
                        </div>
                    </div>
                )
            ) : (
                // ==========================================
                // CASE B: NO BUDDY (SEARCH & ROSTER DISCOVERY)
                // ==========================================
                <div className="space-y-4">
                    <div className="bg-card/30 border border-border rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">结对死党 (Buddy System)</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    与队友结对为死党，获取同步出勤奖励，共同督促。
                                </p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <label htmlFor="buddy-search" className="sr-only">搜索队友</label>
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
                            <input
                                id="buddy-search"
                                type="text"
                                placeholder="输入队友名字搜索..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                aria-label="搜索队友"
                            />
                        </div>
                    </div>

                    {/* Search Results list */}
                    {searchQuery.trim() !== "" && (
                        <div className="bg-card/40 border border-border rounded-3xl p-4 space-y-3 animate-in fade-in duration-300">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                🔍 搜索到 {filteredSwimmers.length} 名队员
                            </p>

                            <div className="space-y-2">
                                {filteredSwimmers.map(member => (
                                    <div key={member.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center bg-slate-900 relative">
                                                <AvatarRenderer 
                                                    gender={member.gender || "male"} 
                                                    equippedItems={member.equippedItems || {}} 
                                                    size={40} 
                                                />
                                            </div>

                                            <div>
                                                <h5 className="text-xs font-bold text-white">{member.name}</h5>
                                                <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 bg-white/5 rounded">
                                                    Lv.{member.level || 1} · {member.group === "Advanced" ? "高级组" : "普通组"}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSendRequest(member.id)}
                                            className="px-4 py-2.5 min-h-[44px] bg-primary text-primary-foreground hover:brightness-110 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                            aria-label={`申请与${member.name}结成死党`}
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> 申请死党
                                        </button>
                                    </div>
                                ))}

                                {filteredSwimmers.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <Users className="w-8 h-8 opacity-25 mb-2" />
                                        <p className="text-xs italic">未找到匹配该名字的队员</p>
                                        <p className="text-[10px] mt-1 text-muted-foreground/50">试试输入完整姓名</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
