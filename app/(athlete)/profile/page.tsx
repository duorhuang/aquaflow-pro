"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Waves, LogOut, User, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Swimmer } from "@/types";

export default function AthleteProfilePage() {
    const router = useRouter();
    const { swimmers, updateSwimmer, isLoaded } = useStore();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [mainStroke, setMainStroke] = useState<Swimmer["mainStroke"] | undefined>(undefined);
    const [readiness, setReadiness] = useState(100);
    const [injuryNote, setInjuryNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.auth.me()
            .then((user: any) => {
                if (user.role !== 'athlete') {
                    router.push("/login");
                    return;
                }
                setCurrentUser(user);
                setName(user.name || "");
                setMainStroke((user.mainStroke || undefined) as Swimmer["mainStroke"] | undefined);
                setReadiness(user.readiness || 100);
                setInjuryNote(user.injuryNote || "");
            })
            .catch(() => router.push("/login"));
    }, [router]);

    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        setSaved(false);
        try {
            await updateSwimmer(currentUser.id, {
                name,
                mainStroke,
                readiness,
                injuryNote,
                lastProfileUpdate: new Date().toISOString()
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save profile:", e);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try { await api.auth.logout(); } catch {}
        localStorage.removeItem("aquaflow_athlete_id");
        router.push("/login");
    };

    if (!isLoaded && !currentUser) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/workout" className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary/80">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Profile</h1>
                            <p className="text-muted-foreground text-sm">{currentUser?.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                {/* Stats */}
                {currentUser && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-3xl font-bold text-primary">{currentUser.xp || 0}</p>
                            <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-3xl font-bold text-yellow-400">Lv.{currentUser.level || 1}</p>
                            <p className="text-xs text-muted-foreground">Level</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-3xl font-bold text-orange-400">{currentUser.currentStreak || 0}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-secondary/20 rounded-2xl p-6 space-y-4 border border-white/5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5" /> Personal Info
                    </h2>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Main Stroke</label>
                        <select
                            value={mainStroke}
                            onChange={(e) => setMainStroke((e.target.value || undefined) as Swimmer["mainStroke"] | undefined)}
                            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Select...</option>
                            <option value="Free">Freestyle</option>
                            <option value="Back">Backstroke</option>
                            <option value="Breast">Breaststroke</option>
                            <option value="Fly">Butterfly</option>
                            <option value="IM">IM</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Readiness: {readiness}%</label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={readiness}
                            onChange={(e) => setReadiness(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Injury Note</label>
                        <textarea
                            value={injuryNote}
                            onChange={(e) => setInjuryNote(e.target.value)}
                            placeholder="Any current injuries or limitations..."
                            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
