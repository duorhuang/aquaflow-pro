"use client";

import { FeedbackForm } from "@/components/athlete/FeedbackForm";
import { AttendanceCalendar } from "@/components/athlete/AttendanceCalendar";
import { ArrowLeft, MessageSquareQuote, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { TrainingPlan, Swimmer } from "@/types";
import { useRouter } from "next/navigation";
import { ProfileUpdateModal } from "@/components/athlete/ProfileUpdateModal";

// Helper: Check if profile is outdated (e.g. > 14 days)
const isProfileStale = (s: Swimmer) => {
    if (!s.lastProfileUpdate) return true;
    const last = new Date(s.lastProfileUpdate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    return diffDays > 14;
};

export default function AthleteWorkoutPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { plans, swimmers } = useStore();
    const [todaysPlan, setTodaysPlan] = useState<TrainingPlan | null>(null);
    const [currentUser, setCurrentUser] = useState<Swimmer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check Login Session
        const storedId = localStorage.getItem("aquaflow_athlete_id");
        if (!storedId) {
            router.push("/login");
            return;
        }

        // 2. Resolve User from Store (Wait for hydration if needed)
        // Note: In a real app we'd wait for store.isLoaded. 
        // For now, we assume store is fast or hydrated.
        const user = swimmers.find(s => s.id === storedId);

        if (user) {
            setCurrentUser(user);
        } else if (swimmers.length > 0) {
            // Only redirect if swimmers are loaded but user not found
            // router.push("/login"); 
        }

    }, [swimmers, router]);

    useEffect(() => {
        if (!currentUser || plans.length === 0) return;

        // 3. Filter Plans by User's Group
        const groupPlans = plans.filter(p => p.group === currentUser.group);

        // 4. Sort by Date Descending
        const sorted = [...groupPlans].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTodaysPlan(sorted.length > 0 ? sorted[0] : null);
        setIsLoading(false);
    }, [currentUser, plans]);

    // Show loading state while checking session/plans
    if (isLoading && !todaysPlan) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground animate-pulse">Loading {currentUser ? `${currentUser.group} Schedule` : "Workout"}...</p>
            </div>
        );
    }

    if (!currentUser) return null; // Or some fallback

    if (!todaysPlan) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Rest Day?</h2>
                <p className="text-muted-foreground">No active plans found for the <span className="text-primary font-bold">{currentUser.group}</span> group.</p>
                <Link href="/login" className="mt-6 text-sm text-primary underline hover:text-primary/80">Switch Profile</Link>
            </div>
        );
    }

    // Gamification & Stats
    const xp = currentUser.xp || 0;
    const level = currentUser.level || 1;
    const nextLevelXp = level * 100;
    const progress = (xp % 100);

    const toNextLevel = 100 - progress;

    const myNote = todaysPlan?.targetedNotes?.[currentUser.id];

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                            {level}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">{currentUser.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground">{xp} XP</p>
                            </div>
                        </div>
                    </div>
                    <LanguageToggle />
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {/* Profile Update Check */}
                {currentUser && isProfileStale(currentUser) && (
                    <ProfileUpdateModal
                        swimmer={currentUser}
                        onClose={() => {
                            // Force refresh or just close
                            const updated = { ...currentUser, lastProfileUpdate: new Date().toISOString() };
                            setCurrentUser(updated);
                        }}
                    />
                )}

                {/* Personal Note Alert */}
                {myNote && (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 animate-in slide-in-from-top-2">
                        <MessageSquareQuote className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Coach Note</p>
                            <p className="text-sm text-primary-foreground/90 italic">"{myNote}"</p>
                        </div>
                    </div>
                )}

                {/* BENTO GRID DASHBOARD */}
                <div className="grid grid-cols-2 gap-4">

                    {/* Card 1: Today's Focus (Large) */}
                    <div className="col-span-2 bg-gradient-to-br from-secondary to-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Distance</p>
                        <div className="text-4xl font-mono font-bold text-white mb-2">{todaysPlan.totalDistance}m</div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white border border-white/10">
                                {todaysPlan.focus}
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/20">
                                {todaysPlan.blocks?.reduce((acc, b) => acc + b.items.length, 0) || 0} Sets
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Attendance (Interactive) */}
                    <div className="col-span-2">
                        <AttendanceCalendar swimmerId={currentUser.id} />
                    </div>

                    {/* Card 3: Monthly Preview (Clickable for full report) */}
                    <Link href="#" className="col-span-1 bg-card border border-border p-4 rounded-3xl hover:bg-card/80 transition-colors flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Monthly Report</p>
                            <p className="text-[10px] text-muted-foreground">View your stats</p>
                        </div>
                    </Link>

                    {/* Card 4: Next Level */}
                    <div className="col-span-1 bg-card border border-border p-4 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="absolute inset-0 bg-yellow-500/5" />
                        <div className="relative z-10">
                            <p className="text-2xl font-bold text-yellow-500">{toNextLevel}</p>
                            <p className="text-[10px] text-yellow-500/70 uppercase">XP to Level {level + 1}</p>
                        </div>
                        <div className="relative z-10 flex justify-end">
                            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                                <div className="text-xs font-bold">Lvl {level}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Workout List (Scroll down to see) */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Session Plan
                        </h2>
                    </div>

                    {/* Blocks Rendering */}
                    {todaysPlan.blocks?.map((block) => (
                        <div key={block.id} className="space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-xs uppercase font-bold text-primary tracking-widest">{block.type}</span>
                                {block.rounds > 1 && <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded">{block.rounds} Rounds</span>}
                                {block.note && <span className="text-xs text-muted-foreground italic">"{block.note}"</span>}
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <div className={cn("space-y-3", block.rounds > 1 && "border-l-2 border-primary/30 pl-3 ml-2")}>
                                {block.items.map((item, idx) => (
                                    <div key={item.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4">
                                        <div className="flex-none w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-mono font-bold text-muted-foreground flex-col">
                                            <span>{idx + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-lg text-white">
                                                    {item.repeats > 1 ? `${item.repeats} x ` : ""}
                                                    {item.distance}m
                                                </span>
                                                <div className="flex flex-col items-end">
                                                    <span className={cn(
                                                        "text-xs font-bold px-2 py-0.5 rounded mb-1",
                                                        item.intensity === "High" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                                    )}>{item.intensity}</span>
                                                    {item.interval && (
                                                        <span className={cn(
                                                            "text-[10px] font-mono px-1 rounded flex items-center gap-1",
                                                            item.intervalMode === 'Rest'
                                                                ? "text-yellow-400 bg-yellow-400/10"
                                                                : "text-primary bg-primary/10"
                                                        )}>
                                                            {item.intervalMode === 'Rest' ? "Rest" : "@"} {item.interval}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="text-sm text-primary font-medium">{item.stroke}</span>
                                                {item.equipment?.map(e => (
                                                    <span key={e} className="text-xs border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">{e}</span>
                                                ))}
                                            </div>

                                            {(!item.segments || item.segments.length === 0) ? (
                                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                            ) : (
                                                <div className="mt-2 space-y-1">
                                                    {item.segments.map((seg, sIdx) => (
                                                        <div key={sIdx} className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-1.5 rounded">
                                                            <span className="font-mono font-bold text-white w-8">{seg.distance}m</span>
                                                            <span className="text-primary">{seg.type}</span>
                                                            <span>{seg.description}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Check-in / Feedback */}
                <FeedbackForm />
            </main>
        </div>
    );
}
