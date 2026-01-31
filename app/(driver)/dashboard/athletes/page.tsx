"use client";

import { useStore } from "@/lib/store";
import { User, UserPlus, Activity, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SwimmerModal } from "@/components/dashboard/SwimmerModal";
import { cn } from "@/lib/utils";

export default function AthletesPage() {
    const { swimmers } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSwimmer, setEditingSwimmer] = useState<typeof swimmers[0] | null>(null);

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
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                isActive ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
            )}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Team Roster</h1>
                <button
                    onClick={handleAddSwimmer}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Swimmer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {swimmers.map((s) => (
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
                                            <span className="text-xs font-bold text-yellow-400">
                                                🔥 {s.currentStreak} days
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
