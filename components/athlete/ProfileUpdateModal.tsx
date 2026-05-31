"use client";

import { useState, useEffect, useRef } from "react";
import { Swimmer } from "@/types";
import { useStore } from "@/lib/store";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileUpdateModalProps {
    swimmer: Swimmer;
    onClose: () => void;
}

const COMMON_INJURIES = ["Shoulder", "Knee", "Back", "Ankle", "None"];

export function ProfileUpdateModal({ swimmer, onClose }: ProfileUpdateModalProps) {
    const { updateSwimmer } = useStore();
    const [injuries, setInjuries] = useState<string[]>(swimmer.injuries || []);
    const [bestTimes] = useState<Record<string, string>>(swimmer.bestTimes || {});
    const [free50, setFree50] = useState(swimmer.bestTimes?.["50Free"] || "");
    const [free100, setFree100] = useState(swimmer.bestTimes?.["100Free"] || "");
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    // Escape key handler
    useEffect(() => {
        closeBtnRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const toggleInjury = (injury: string) => {
        if (injury === "None") {
            setInjuries([]);
            return;
        }
        setInjuries(prev =>
            prev.includes(injury) ? prev.filter(i => i !== injury) : [...prev, injury]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="个人资料更新"
        >
            <div ref={modalRef} className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(100,255,218,0.1)] space-y-6 animate-in zoom-in-95 duration-300 relative">
                {/* Close button */}
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                    aria-label="关闭"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                    <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">双周状态更新</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        帮助教练了解你的状态，以便定制训练计划。
                    </p>
                </div>

                {/* Injuries */}
                <fieldset className="space-y-3">
                    <legend className="text-sm font-bold text-white uppercase tracking-wider">当前伤病/疼痛部位</legend>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="选择伤病部位">
                        {COMMON_INJURIES.map(inj => {
                            const isSelected = (inj === "None" && injuries.length === 0) || (inj !== "None" && injuries.includes(inj));
                            return (
                                <button
                                    key={inj}
                                    onClick={() => toggleInjury(inj)}
                                    className={cn(
                                        "px-3 py-2 min-h-[44px] rounded-full text-xs font-bold border transition-all",
                                        isSelected
                                            ? "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-secondary/20 border-white/5 text-muted-foreground hover:border-white/20"
                                    )}
                                    aria-pressed={isSelected}
                                >
                                    {inj}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {/* Times */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">近期最佳成绩 (训练中)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="free50-time" className="text-xs text-muted-foreground">50m 自由泳</label>
                            <input
                                id="free50-time"
                                type="text"
                                value={free50}
                                onChange={e => setFree50(e.target.value)}
                                placeholder="00.00"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center focus:border-primary/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="free100-time" className="text-xs text-muted-foreground">100m 自由泳</label>
                            <input
                                id="free100-time"
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
                    disabled={isSaving}
                    className="w-full py-3 min-h-[48px] bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            保存中...
                        </>
                    ) : (
                        "更新个人资料"
                    )}
                </button>
            </div>
        </div>
    );
}
