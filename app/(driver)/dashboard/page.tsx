import { MOCK_PLAN, MOCK_SWIMMERS } from "@/lib/data";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { AlertTriangle, Plus, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const lowReadinessSwimmers = MOCK_SWIMMERS.filter(s => s.readiness < 80);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Morning Coach</h1>
                    <p className="text-muted-foreground">Tuesday, Jan 28 • T-2 Hours to Practice</p>
                </div>
                <Link
                    href="/dashboard/new-plan"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(100,255,218,0.4)]"
                >
                    <Plus className="w-5 h-5" />
                    Create Plan
                </Link>
            </div>

            {/* Timeline Status Bar (The "T-Minus" System) */}
            <div className="p-1 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 flex relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[80%] h-full bg-gradient-to-r from-blue-900/20 to-primary/10 -z-10" />
                {["T-24 Preview", "T-12 Feedback", "T-2 Processing", "T-0 Execution"].map((step, idx) => (
                    <div key={step} className={cn(
                        "flex-1 py-3 text-center text-sm font-mono border-r border-border/50 last:border-0",
                        idx === 2 ? "text-primary font-bold bg-primary/10" : "text-muted-foreground opacity-50"
                    )}>
                        {step}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Plans */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        Active Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PlanCard plan={MOCK_PLAN} />
                        <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-white/5 transition-colors cursor-pointer group">
                            <Plus className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100" />
                            <span>Draft Tomorrow&apos;s Plan</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Alerts & Readiness */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Team Radar</h2>

                    <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Low Readiness Alerts</h3>
                        <div className="space-y-3">
                            {lowReadinessSwimmers.length > 0 ? (
                                lowReadinessSwimmers.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-500">
                                                {s.readiness}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-red-200">{s.name}</p>
                                                <p className="text-xs text-red-400/70">{s.status}</p>
                                            </div>
                                        </div>
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-green-400">All systems go.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/5 rounded-2xl border border-primary/20">
                        <h3 className="text-lg font-bold text-primary mb-2">AI Insight</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Based on yesterday&apos;s 4,500m session, expecting high fatigue in the Intermediate group. Consider reducing intensity for the warmup set today.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
