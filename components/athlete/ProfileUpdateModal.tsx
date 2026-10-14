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

        try {
            await updateSwimmer(swimmer.id, {
                injuries,
                bestTimes: updatedBestTimes,
                lastProfileUpdate: new Date().toISOString()
            });
            onClose();
        } catch (err) {
            console.error('Failed to save profile:', err);
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 animate-in fade-in duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="个人资料更新"
        >
            <div ref={modalRef} className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl space-y-6 animate-in zoom-in-95 duration-300 relative">
                {/* Close button */}
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="关闭"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">双周状态更新</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        帮助教练了解你的状态，以便定制训练计划。
                    </p>
                </div>

                {/* Injuries */}
                <fieldset className="space-y-3">
                    <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">当前伤病/疼痛部位</legend>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="选择伤病部位">
                        {COMMON_INJURIES.map(inj => {
                            const isSelected = (inj === "None" && injuries.length === 0) || (inj !== "None" && injuries.includes(inj));
                            return (
                                <button
                                    key={inj}
                                    onClick={() => toggleInjury(inj)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                        isSelected
                                            ? "bg-destructive/15 border-destructive/30 text-destructive font-semibold"
                                            : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
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
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">近期最佳成绩 (训练中)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="free50-time" className="text-xs text-muted-foreground">50m 自由泳</label>
                            <input
                                id="free50-time"
                                type="text"
                                value={free50}
                                onChange={e => setFree50(e.target.value)}
                                placeholder="00.00"
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-mono text-center focus:border-primary outline-none text-sm"
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
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-mono text-center focus:border-primary outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 min-h-[44px] bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-xs"
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
