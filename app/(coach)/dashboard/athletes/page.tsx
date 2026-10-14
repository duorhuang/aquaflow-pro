"use client";

import { useStoreSelector } from "@/lib/store";
import { useLanguage } from "@/lib/i18n";
import { User, UserPlus, Activity, TrendingUp, Search, ChevronRight, Flame, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SwimmerModal } from "@/components/dashboard/SwimmerModal";
import { cn } from "@/lib/utils";
import { GROUP_LEVEL_ORDER } from "@/lib/group-constants";

export default function AthletesPage() {
    const { swimmers, isLoaded } = useStoreSelector(s => ({ swimmers: s.swimmers, isLoaded: s.isLoaded }));
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSwimmer, setEditingSwimmer] = useState<typeof swimmers[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<typeof GROUP_LEVEL_ORDER[number]>("All");

    // Show skeleton while store is loading
    if (!isLoaded) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-4 w-64 bg-white/5 rounded mt-2 animate-pulse" />
                    </div>
                    <div className="h-12 w-36 bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="flex p-1 bg-card/30 border border-border rounded-xl gap-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-9 flex-1 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-card border border-border p-6 rounded-2xl animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-secondary rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 w-32 bg-white/5 rounded" />
                                    <div className="h-3 w-20 bg-white/5 rounded" />
                                    <div className="h-3 w-24 bg-white/5 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const handleEditSwimmer = (swimmer: typeof swimmers[0]) => {
        setEditingSwimmer(swimmer);
        setIsModalOpen(true);
    };

    const handleAddSwimmer = () => {
        setEditingSwimmer(null);
        setIsModalOpen(true);
    };

    const getReadinessColor = (readiness: number) => {
        if (readiness >= 80) return "text-green-400";
        if (readiness >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getStatusBadge = (status: string) => {
        const isActive = status === "Active";
        return (
            <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}>
                {status}
            </span>
        );
    };

    const filteredSwimmers = swimmers.filter(s =>
        (activeTab === "All" || s.group === activeTab) &&
        (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2" aria-label="面包屑导航">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">{t.common.dashboard}</Link>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span className="text-foreground font-medium">{t.common.athletes}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">{t.dashboard.teamRoster || "Team Roster"}</h1>
                    <p className="text-xs text-muted-foreground">{t.dashboard.manageSquad || "Manage your squad and class assignments"}</p>
                </div>
                <button
                    onClick={handleAddSwimmer}
                    className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs"
                >
                    <UserPlus className="w-4 h-4" />
                    {t.dashboard.addSwimmer || "Add Swimmer"}
                </button>
            </div>

            {/* Group Filter Tabs */}
            <div className="flex p-1 bg-secondary border border-border rounded-lg overflow-x-auto no-scrollbar">
                {GROUP_LEVEL_ORDER.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                            activeTab === tab
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                        )}
                    >
                        {tab === "All" ? (t.dashboard.allSwimmers || "All") : `${tab} ${t.common.group || "Group"}`}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t.dashboard.searchSwimmer || "搜索队员姓名..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSwimmers.length === 0 && swimmers.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-card border border-dashed border-border rounded-xl">
                        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <h3 className="text-base font-semibold text-foreground mb-1">暂无队员数据</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5">
                            数据库中没有队员记录。点击下方按钮添加第一名队员。
                        </p>
                        <button
                            onClick={handleAddSwimmer}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                            <UserPlus className="w-4 h-4" />
                            添加队员
                        </button>
                    </div>
                )}
                {filteredSwimmers.length === 0 && swimmers.length > 0 && (
                    <div className="col-span-full text-center py-12 bg-card border border-border rounded-xl">
                        <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <h3 className="text-sm font-semibold text-foreground mb-1">未找到匹配的队员</h3>
                        <p className="text-xs text-muted-foreground">
                            没有符合筛选条件的队员。尝试更改搜索或分组。
                        </p>
                    </div>
                )}
                {filteredSwimmers.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => handleEditSwimmer(s)}
                        className="bg-card border border-border p-4 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group shadow-xs"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                                    {getStatusBadge(s.status)}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2.5">{s.group} {t.common.group || "Group"}</p>

                                {/* Stats */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{t.dashboard.readiness || "Readiness"}:</span>
                                        <span className={cn("text-xs font-semibold font-mono", getReadinessColor(s.readiness))}>
                                            {s.readiness || 100}%
                                        </span>
                                    </div>
                                    {s.level && (
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">{t.dashboard.level || "Level"}:</span>
                                            <span className="text-xs font-semibold font-mono text-primary">
                                                {s.level} ({s.xp || 0} XP)
                                            </span>
                                        </div>
                                    )}
                                    {s.currentStreak && s.currentStreak > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{t.dashboard.streak || "Streak"}:</span>
                                            <span className="text-xs font-semibold font-mono text-amber-500 flex items-center gap-1">
                                                <Flame className="w-3 h-3" /> {s.currentStreak} days
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <SwimmerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSwimmer(null);
                }}
                swimmerToEdit={editingSwimmer}
            />
        </div>
    );
}
