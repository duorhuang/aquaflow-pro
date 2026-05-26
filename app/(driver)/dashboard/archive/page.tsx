"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import {
    FolderOpen, MessageSquare, Target, Calendar, ChevronDown, ChevronUp,
    MessageCircle, ThumbsUp, ThumbsDown, Clock, Filter, Star, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GroupLevel } from "@/types";
import { AnnouncementCard } from "@/components/feed/AnnouncementCard";

const GROUP_LEVELS: GroupLevel[] = ["Junior", "Intermediate", "Advanced", "External"];

function Breadcrumb() {
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-white font-medium">反馈档案</span>
        </nav>
    );
}

type TabType = 'block' | 'weekly' | 'targeted' | 'announcements';

export default function ArchivePage() {
    const { swimmers, announcements, archivedAnnouncements, deleteAnnouncement, starAnnouncement } = useStore();
    const [activeTab, setActiveTab] = useState<TabType>('block');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        blockFeedbacks: any[];
        weeklyFeedbacks: any[];
        targetedFeedbacks: any[];
    }>({ blockFeedbacks: [], weeklyFeedbacks: [], targetedFeedbacks: [] });

    // Filters
    const [selectedSwimmer, setSelectedSwimmer] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Expanded items
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Announcement archive toggle
    const [showArchived, setShowArchived] = useState(false);

    const loadArchive = useCallback(async () => {
        const timer1 = setTimeout(() => {
            setLoading(true);
        }, 0);
        try {
            const res = await api.archive.getFeedbacks({ type: 'all' });
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            const timer2 = setTimeout(() => {
                setLoading(false);
            }, 0);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const timer = setTimeout(() => {
            if (isMounted) {
                loadArchive();
            }
        }, 0);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [loadArchive]);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    // Filter block feedbacks
    const filteredBlock = data.blockFeedbacks.filter((bf: any) => {
        if (selectedSwimmer && bf.swimmerId !== selectedSwimmer) return false;
        if (selectedGroup && bf.swimmer?.group !== selectedGroup) return false;
        if (dateFrom && new Date(bf.createdAt) < new Date(dateFrom)) return false;
        if (dateTo && new Date(bf.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    // Filter weekly feedbacks
    const filteredWeekly = data.weeklyFeedbacks.filter((wf: any) => {
        if (selectedSwimmer && wf.swimmerId !== selectedSwimmer) return false;
        if (selectedGroup && wf.swimmer?.group !== selectedGroup) return false;
        if (dateFrom && new Date(wf.submittedAt || wf.createdAt) < new Date(dateFrom)) return false;
        if (dateTo && new Date(wf.submittedAt || wf.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    // Filter targeted feedbacks
    const filteredTargeted = data.targetedFeedbacks.filter((tf: any) => {
        if (selectedSwimmer && tf.swimmerId !== selectedSwimmer) return false;
        if (selectedGroup && tf.swimmer?.group !== selectedGroup) return false;
        if (dateFrom && new Date(tf.createdAt) < new Date(dateFrom)) return false;
        if (dateTo && new Date(tf.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    // Filter announcements
    const visibleAnnouncements = showArchived ? archivedAnnouncements : announcements;

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">加载反馈档案...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                        <FolderOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">反馈档案</h1>
                        <p className="text-sm text-muted-foreground mt-1">查看所有历史反馈、周总结与动态存档</p>
                    </div>
                </div>
                <button
                    onClick={loadArchive}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-border px-4 py-2 rounded-xl text-muted-foreground flex items-center gap-2 transition-colors"
                >
                    <Clock className="w-3.5 h-3.5" /> 刷新
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-4 gap-2 bg-card/30 border border-border rounded-xl p-1.5">
                {[
                    { key: 'block' as TabType, label: '专项反馈', icon: Target, activeClass: 'bg-blue-500' },
                    { key: 'weekly' as TabType, label: '周总结', icon: Calendar, activeClass: 'bg-purple-500' },
                    { key: 'targeted' as TabType, label: '定向反馈', icon: MessageSquare, activeClass: 'bg-orange-500' },
                    { key: 'announcements' as TabType, label: '动态存档', icon: Star, activeClass: 'bg-yellow-500' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            activeTab === tab.key
                                ? `${tab.activeClass} text-white shadow-lg`
                                : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters (not for announcements tab) */}
            {activeTab !== 'announcements' && (
                <div className="space-y-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {showFilters ? '收起筛选' : '展开筛选'}
                        {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showFilters && (
                        <div className="bg-card/30 border border-border rounded-xl p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Swimmer dropdown */}
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground block mb-1">队员</label>
                                    <select
                                        value={selectedSwimmer}
                                        onChange={e => setSelectedSwimmer(e.target.value)}
                                        className="w-full bg-black/40 border border-border rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="">全部队员</option>
                                        {(swimmers || []).map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.group})</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Group chips */}
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground block mb-1">组别</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => setSelectedGroup('')}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                !selectedGroup
                                                    ? "bg-primary/20 text-primary border-primary/50"
                                                    : "bg-transparent border-white/20 text-muted-foreground hover:bg-white/5"
                                            )}
                                        >
                                            全部
                                        </button>
                                        {GROUP_LEVELS.map(g => {
                                            const count = (swimmers || []).filter(s => s.group === g).length;
                                            if (count === 0) return null;
                                            return (
                                                <button
                                                    key={g}
                                                    onClick={() => setSelectedGroup(selectedGroup === g ? '' : g)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                        selectedGroup === g
                                                            ? "bg-primary/20 text-primary border-primary/50"
                                                            : "bg-transparent border-white/20 text-muted-foreground hover:bg-white/5"
                                                    )}
                                                >
                                                    {g} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground block mb-1">开始日期</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        className="w-full bg-black/40 border border-border rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground block mb-1">结束日期</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        className="w-full bg-black/40 border border-border rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                            {(selectedSwimmer || selectedGroup || dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setSelectedSwimmer(''); setSelectedGroup(''); setDateFrom(''); setDateTo(''); }}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    清除筛选
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: Block Feedback */}
            {activeTab === 'block' && (
                <div className="space-y-3">
                    {filteredBlock.length === 0 && (
                        <div className="text-center py-16 bg-card/30 border border-dashed border-border rounded-3xl">
                            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">没有专项反馈记录</p>
                        </div>
                    )}
                    {filteredBlock.map((bf: any) => {
                        const isExpanded = expandedIds.has(bf.id);
                        return (
                            <div key={bf.id} className="bg-card/30 border border-border rounded-xl overflow-hidden">
                                <div
                                    onClick={() => toggleExpand(bf.id)}
                                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-400">
                                                {bf.swimmer?.name?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{bf.swimmer?.name || "未知队员"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(bf.createdAt).toLocaleDateString()} · {bf.planId?.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {bf.reaction === 'like' && <ThumbsUp className="w-4 h-4 text-green-400 fill-green-400" />}
                                        {bf.reaction === 'dislike' && <ThumbsDown className="w-4 h-4 text-red-400 fill-red-400" />}
                                        {bf.tags?.length > 0 && (
                                            <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">
                                                {bf.tags.length} 标签
                                            </span>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 border-t border-border bg-black/20 space-y-3">
                                        <div className="flex gap-4 text-xs">
                                            <span className="text-muted-foreground">组别: <span className="text-white">{bf.swimmer?.group || "—"}</span></span>
                                        </div>
                                        {bf.comment && (
                                            <p className="text-sm text-white whitespace-pre-wrap bg-white/5 p-3 rounded-lg">{bf.comment}</p>
                                        )}
                                        {bf.tags && bf.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {bf.tags.map((tag: string) => (
                                                    <span key={tag} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab Content: Weekly Feedback */}
            {activeTab === 'weekly' && (
                <div className="space-y-3">
                    {filteredWeekly.length === 0 && (
                        <div className="text-center py-16 bg-card/30 border border-dashed border-border rounded-3xl">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">没有已提交的周总结</p>
                        </div>
                    )}
                    {filteredWeekly.map((wf: any) => {
                        const isExpanded = expandedIds.has(wf.id);
                        return (
                            <div key={wf.id} className="bg-card/30 border border-border rounded-xl overflow-hidden">
                                <div
                                    onClick={() => toggleExpand(wf.id)}
                                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-purple-400">
                                                {wf.swimmer?.name?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                {wf.swimmer?.name || "未知队员"}
                                                {wf.isReplied && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">已批复</span>
                                                )}
                                                {!wf.isReplied && (
                                                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">未批复</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {wf.weekStart} 周 · 提交于 {wf.submittedAt ? new Date(wf.submittedAt).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 border-t border-border bg-black/20 space-y-3">
                                        {wf.summary && (
                                            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                                                <p className="text-xs text-primary font-bold mb-1">周总结</p>
                                                <p className="text-sm text-white whitespace-pre-wrap">{wf.summary}</p>
                                            </div>
                                        )}
                                        {wf.dailyFeedbacks?.filter((df: any) => df.reflection).map((df: any) => (
                                            <div key={df.id} className="bg-white/5 p-3 rounded-lg">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">{df.date}</span>
                                                    <span className="text-xs text-blue-400">RPE: {df.rpe}</span>
                                                    <span className="text-xs text-orange-400">酸痛: {df.soreness}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{df.reflection}</p>
                                            </div>
                                        ))}
                                        {wf.coachReply && (
                                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                                <p className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" /> 教练批复
                                                    {wf.repliedAt && <span className="text-muted-foreground font-normal ml-1">({new Date(wf.repliedAt).toLocaleDateString()})</span>}
                                                </p>
                                                <p className="text-sm text-white whitespace-pre-wrap">{wf.coachReply}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab Content: Targeted Feedback */}
            {activeTab === 'targeted' && (
                <div className="space-y-3">
                    {filteredTargeted.length === 0 && (
                        <div className="text-center py-16 bg-card/30 border border-dashed border-border rounded-3xl">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">没有定向反馈记录</p>
                        </div>
                    )}
                    {filteredTargeted.map((tf: any) => {
                        const isExpanded = expandedIds.has(tf.id);
                        return (
                            <div key={tf.id} className="bg-card/30 border border-border rounded-xl overflow-hidden">
                                <div
                                    onClick={() => toggleExpand(tf.id)}
                                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-orange-400">
                                                {tf.swimmer?.name?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                {tf.swimmer?.name || "未知队员"}
                                                {tf.coachReply && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">已批复</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                Q: {tf.reminderMessage?.substring(0, 40)}{tf.reminderMessage?.length > 40 ? '...' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{new Date(tf.createdAt).toLocaleDateString()}</span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 border-t border-border bg-black/20 space-y-3">
                                        {tf.reminderMessage && (
                                            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                                                <p className="text-xs text-orange-400 font-bold mb-1">教练提问</p>
                                                <p className="text-sm text-white">{tf.reminderMessage}</p>
                                                {tf.periodStart && tf.periodEnd && (
                                                    <p className="text-xs text-muted-foreground mt-1">周期: {tf.periodStart} 至 {tf.periodEnd}</p>
                                                )}
                                            </div>
                                        )}
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-bold text-white">{tf.swimmer?.name || "未知"}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(tf.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-white whitespace-pre-wrap">{tf.content}</p>
                                            <div className="flex gap-3 mt-1">
                                                <span className="text-xs text-blue-400">RPE: {tf.rpe}</span>
                                                <span className="text-xs text-orange-400">酸痛: {tf.soreness}</span>
                                            </div>
                                        </div>
                                        {tf.coachReply && (
                                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                                <p className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" /> 教练批复
                                                    {tf.repliedAt && <span className="text-muted-foreground font-normal ml-1">({new Date(tf.repliedAt).toLocaleDateString()})</span>}
                                                </p>
                                                <p className="text-sm text-white whitespace-pre-wrap">{tf.coachReply}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab Content: Announcements Archive */}
            {activeTab === 'announcements' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-yellow-400" />
                            {showArchived ? '历史存档' : '活跃动态'}
                        </h3>
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                        >
                            {showArchived ? (
                                <>查看活跃 <ChevronDown className="w-3 h-3" /></>
                            ) : (
                                <>查看存档 ({archivedAnnouncements.length}) <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    </div>

                    {visibleAnnouncements.length === 0 && (
                        <div className="text-center py-16 bg-card/30 border border-dashed border-border rounded-3xl">
                            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-muted-foreground">{showArchived ? '没有存档动态' : '没有活跃动态'}</p>
                        </div>
                    )}

                    {visibleAnnouncements.map((a: any) => (
                        <AnnouncementCard
                            key={a.id}
                            announcement={a}
                            isCoach
                            onDelete={deleteAnnouncement}
                            onStar={starAnnouncement}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
