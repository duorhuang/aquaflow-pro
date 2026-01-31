"use client";

import { Swimmer, TrainingPlan } from "@/types";
import { AlertTriangle, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightProps {
    plan: TrainingPlan;
    swimmers: Swimmer[];
}

export function AIInsight({ plan, swimmers }: AIInsightProps) {
    // 1. Filter swimmers in this group
    const groupSwimmers = swimmers.filter(s => s.group === plan.group);

    // 2. Calculate Plan Stats
    const totalDist = plan.totalDistance;
    const hasEquipment = plan.blocks.some(b => b.items.some(i => i.equipment?.length > 0));
    const hasPaddles = plan.blocks.some(b => b.items.some(i => i.equipment?.includes("Paddles")));
    const hasFly = plan.blocks.some(b => b.items.some(i => i.stroke === "Fly" && i.distance >= 50 && i.intensity === "High"));

    // 3. Analyze Risks
    const risks: { swimmer: Swimmer; reason: string; level: "high" | "medium" }[] = [];
    const opportunities: { swimmer: Swimmer; reason: string }[] = [];

    groupSwimmers.forEach(s => {
        // Rule: Shoulder Injury + Paddles/Fly
        const hasShoulderIssue = s.injuries?.some(i => i.toLowerCase().includes("shoulder"));
        if (hasShoulderIssue && (hasPaddles || hasFly)) {
            risks.push({
                swimmer: s,
                reason: `Shoulder risk! Plan has ${hasPaddles ? "Paddles" : ""} ${hasFly ? "hard Fly" : ""}. Consider modification.`,
                level: "high"
            });
        }

        // Rule: Low Readiness + High Volume (Mock threshold: >3000m for this example)
        if (s.readiness < 40 && totalDist > 3000) {
            risks.push({
                swimmer: s,
                reason: `Fatigued (RPE Base). Volume (${totalDist}m) might be too high.`,
                level: "medium"
            });
        }

        // Rule: High Readiness + Good Streak -> Suggest push
        if (s.readiness > 85 && (s.currentStreak || 0) > 3) {
            opportunities.push({
                swimmer: s,
                reason: "High readiness & active streak. Can handle extra intensity."
            });
        }
    });

    if (risks.length === 0 && opportunities.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-bold text-white/50 uppercase tracking-widest">
                <Activity className="w-4 h-4 text-primary" />
                AI Load Analysis
            </div>

            {/* High Risks */}
            {risks.map(r => (
                <div key={r.swimmer.id} className={cn(
                    "p-3 rounded-xl border flex items-start gap-3",
                    r.level === "high" ? "bg-red-500/10 border-red-500/50" : "bg-orange-500/10 border-orange-500/30"
                )}>
                    <AlertTriangle className={cn("w-5 h-5 shrink-0", r.level === "high" ? "text-red-500" : "text-orange-400")} />
                    <div>
                        <div className="font-bold text-white text-sm">{r.swimmer.name}</div>
                        <div className="text-xs text-white/70">{r.reason}</div>
                    </div>
                </div>
            ))}

            {/* Opportunities */}
            {opportunities.map(o => (
                <div key={o.swimmer.id} className="p-3 rounded-xl border border-green-500/30 bg-green-500/10 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400 shrink-0" />
                    <div>
                        <div className="font-bold text-white text-sm">{o.swimmer.name}</div>
                        <div className="text-xs text-white/70">{o.reason}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
