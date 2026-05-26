"use client";

import { useStore } from "@/lib/store";
import { User, UserPlus, Activity, TrendingUp, Search, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SwimmerModal } from "@/components/dashboard/SwimmerModal";
import { cn } from "@/lib/utils";
import { GROUP_LEVEL_ORDER } from "@/lib/group-constants";

export default function AthletesPage() {
    const { swimmers } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSwimmer, setEditingSwimmer] = useState<typeof swimmers[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

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
                "text-xs px-2 py-0.5 rounded-full font-bold",
                isActive ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
            )}>
                {status}
            </span>
        );
    };

    const [activeTab, setActiveTab] = useState<typeof GROUP_LEVEL_ORDER[number]>("All");

    const filteredSwimmers = swimmers.filter(s =>
        (activeTab === "All" || s.group === activeTab) &&
        (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-medium">队员管理</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Team Roster</h1>
                    <p className="text-sm text-muted-foreground">Manage your squad and class assignments</p>
                </div>
                <button
                    onClick={handleAddSwimmer}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Swimmer
                </button>
            </div>

            {/* Group Filter Tabs */}
            <div className="flex p-1 bg-card/30 border border-border rounded-xl overflow-x-auto no-scrollbar">
                {GROUP_LEVEL_ORDER.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all",
                            activeTab === tab
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        {tab === "All" ? "All Swimmers" : `${tab} Group`}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="搜索队员姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSwimmers.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => handleEditSwimmer(s)}
                        className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(100,255,218,0.1)]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <User className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-white">{s.name}</p>
                                    {getStatusBadge(s.status)}
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{s.group} Group</p>

                                {/* Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Readiness:</span>
                                        <span className={cn("text-xs font-bold", getReadinessColor(s.readiness))}>
                                            {s.readiness}%
                                        </span>
                                    </div>
                                    {s.level && (
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Level:</span>
                                            <span className="text-xs font-bold text-primary">
                                                {s.level} ({s.xp || 0} XP)
                                            </span>
                                        </div>
                                    )}
                                    {s.currentStreak && s.currentStreak > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Streak:</span>
                                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
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
