"use client";

import { useState, useEffect } from "react";
import { Swimmer } from "@/types";
import { useStore } from "@/lib/store";
import { X, Save, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileUpdateModalProps {
    swimmer: Swimmer;
    onClose: () => void;
}

const COMMON_INJURIES = ["Shoulder", "Knee", "Back", "Ankle", "None"];

export function ProfileUpdateModal({ swimmer, onClose }: ProfileUpdateModalProps) {
    const { updateSwimmer } = useStore();
    const [injuries, setInjuries] = useState<string[]>(swimmer.injuries || []);
    const [bestTimes, setBestTimes] = useState<Record<string, string>>(swimmer.bestTimes || {});
    // Simple state for a few key events
    const [free50, setFree50] = useState(swimmer.bestTimes?.["50Free"] || "");
    const [free100, setFree100] = useState(swimmer.bestTimes?.["100Free"] || "");

    const toggleInjury = (injury: string) => {
        if (injury === "None") {
            setInjuries([]);
            return;
        }
        setInjuries(prev =>
            prev.includes(injury) ? prev.filter(i => i !== injury) : [...prev, injury]
        );
    };

    const handleSave = () => {
        const updatedBestTimes = {
            ...bestTimes,
            "50Free": free50,
            "100Free": free100,
        };

        updateSwimmer(swimmer.id, {
            injuries,
            bestTimes: updatedBestTimes,
            lastProfileUpdate: new Date().toISOString()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(100,255,218,0.1)] space-y-6 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Bi-Weekly Check-in</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Help Coach customize your training by updating your status.
                    </p>
                </div>

                {/* Injuries */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Current Injuries / Pain</label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_INJURIES.map(inj => (
                            <button
                                key={inj}
                                onClick={() => toggleInjury(inj)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                                    (inj === "None" && injuries.length === 0) || (inj !== "None" && injuries.includes(inj))
                                        ? "bg-red-500/20 border-red-500 text-red-400"
                                        : "bg-secondary/20 border-white/5 text-muted-foreground hover:border-white/20"
                                )}
                            >
                                {inj}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Times */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">Recent Best Times (Practice)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">50m Free</span>
                            <input
                                type="text"
                                value={free50}
                                onChange={e => setFree50(e.target.value)}
                                placeholder="00.00"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center focus:border-primary/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">100m Free</span>
                            <input
                                type="text"
                                value={free100}
                                onChange={e => setFree100(e.target.value)}
                                placeholder="00:00.00"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center focus:border-primary/50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all"
                >
                    Update Profile
                </button>
            </div>
        </div>
    );
}
