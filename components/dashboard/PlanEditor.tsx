"use client";

import { useState } from "react";
import { TrainingPlan, PlanItem, GroupLevel } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Utility to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

interface PlanEditorProps {
    initialPlan?: TrainingPlan;
}

export function PlanEditor({ initialPlan }: PlanEditorProps) {
    const router = useRouter();

    const [plan, setPlan] = useState<TrainingPlan>(initialPlan || {
        id: uid(),
        date: new Date().toISOString().split('T')[0],
        group: "Advanced",
        status: "Draft",
        focus: "",
        totalDistance: 0,
        coachNotes: "",
        items: []
    });

    const [items, setItems] = useState<PlanItem[]>(plan.items);

    // Recalculate total distance whenever items change
    const totalDistance = items.reduce((sum, item) => sum + (item.distance || 0), 0);

    const addItem = () => {
        const newItem: PlanItem = {
            id: uid(),
            order: items.length + 1,
            distance: 100,
            description: "",
            stroke: "Free",
            intensity: "Moderate",
            equipment: []
        };
        setItems([...items, newItem]);
    };

    const updateItem = (id: string, field: keyof PlanItem, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleSave = () => {
        const finalPlan = { ...plan, items, totalDistance, status: "Published" as const };
        console.log("Saving Plan:", finalPlan);
        // TODO: Save to localStorage or API
        // For now, mock save by alerting or just redirecting
        router.push("/dashboard");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        {initialPlan ? "Edit Plan" : "New Training Plan"}
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                >
                    <Save className="w-4 h-4" />
                    Publish Plan
                </button>
            </div>

            {/* Plan Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-card border border-border rounded-2xl">
                <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date</label>
                    <input
                        type="date"
                        value={plan.date}
                        onChange={(e) => setPlan({ ...plan, date: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-2 mt-2 text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Group</label>
                    <select
                        value={plan.group}
                        onChange={(e) => setPlan({ ...plan, group: e.target.value as GroupLevel })}
                        className="w-full bg-background border border-border rounded-lg p-2 mt-2 text-white focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="Junior">Junior</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Volume</label>
                    <div className="text-2xl font-mono font-bold text-primary mt-1">{totalDistance}m</div>
                </div>
            </div>

            {/* Plan Items */}
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="group relative flex items-start gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 transition-colors animate-in fade-in slide-in-from-bottom-2">
                        <div className="mt-3 cursor-grab text-muted-foreground hover:text-white">
                            <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1 grid grid-cols-12 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] text-muted-foreground uppercase">Dist (m)</label>
                                <input
                                    type="number"
                                    value={item.distance}
                                    onChange={(e) => updateItem(item.id, "distance", parseInt(e.target.value) || 0)}
                                    className="w-full bg-background/50 border border-border rounded p-1 text-sm font-mono focus:border-primary outline-none"
                                />
                            </div>

                            <div className="col-span-6">
                                <label className="text-[10px] text-muted-foreground uppercase">Description</label>
                                <textarea
                                    rows={1}
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded p-1 text-sm focus:border-primary outline-none resize-none"
                                    placeholder="e.g. 10 x 100 Free @ 1:20"
                                />
                            </div>

                            <div className="col-span-3">
                                <label className="text-[10px] text-muted-foreground uppercase">Intensity</label>
                                <select
                                    value={item.intensity}
                                    onChange={(e) => updateItem(item.id, "intensity", e.target.value)}
                                    className={cn(
                                        "w-full bg-background/50 border border-border rounded p-1 text-sm outline-none",
                                        item.intensity === "High" ? "text-red-400" : item.intensity === "Low" ? "text-blue-400" : "text-yellow-400"
                                    )}
                                >
                                    <option value="Low">Low (Z1)</option>
                                    <option value="Moderate">Mod (Z2-3)</option>
                                    <option value="High">High (Z4-5)</option>
                                    <option value="Race Pace">RacePace</option>
                                </select>
                            </div>

                            <div className="col-span-1 flex items-end justify-end">
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addItem}
                    className="w-full py-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Set
                </button>
            </div>
        </div>
    );
}
