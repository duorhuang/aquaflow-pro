"use client";

import { useState } from "react";
import { TrainingPlan, PlanItem, GroupLevel, Equipment, TrainingBlock, PlanSegment } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Waves, Info, Layers, Clock, List, Copy, Timer, Hourglass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { AIInsight } from "@/components/dashboard/AIInsight";

// UID Helper (Deterministic-ish for client)
const uid = () => {
    if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substr(2, 9);
};


const DISTANCE_PRESETS = [50, 100, 200, 400, 800];
const STROKES_KEYS = ["Free", "Back", "Breast", "Fly", "IM", "Choice"] as const;
const EQUIPMENT: Equipment[] = ["Fins", "Paddles", "Snorkel", "Kickboard", "Pullbuoy"];
const BLOCK_TYPES = ["Warmup", "Pre-Set", "Main Set", "Drill Set", "Cool Down"] as const;

interface PlanEditorProps {
    initialPlan?: TrainingPlan;
}

export function PlanEditor({ initialPlan }: PlanEditorProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const { addPlan, updatePlan, swimmers } = useStore();

    // Initialize State
    const [plan, setPlan] = useState<TrainingPlan>(initialPlan || {
        id: uid(),
        date: new Date().toISOString().split('T')[0],
        group: "Advanced",
        status: "Draft",
        focus: "",
        totalDistance: 0,
        coachNotes: "",
        blocks: [], // New Structure
        targetedNotes: {}
    });

    const [batchNote, setBatchNote] = useState("");
    const [selectedSwimmers, setSelectedSwimmers] = useState<string[]>([]);

    const toggleSwimmerSelection = (id: string) => {
        setSelectedSwimmers(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const applyBatchNote = () => {
        if (!batchNote.trim() || selectedSwimmers.length === 0) return;

        const newNotes = { ...plan.targetedNotes };
        selectedSwimmers.forEach(id => {
            const existing = newNotes[id];
            newNotes[id] = existing ? `${existing} | ${batchNote}` : batchNote;
        });

        setPlan({ ...plan, targetedNotes: newNotes });
        setBatchNote("");
        setSelectedSwimmers([]);
    };

    // Helper: Recalculate Total Distance
    const calculateTotalDistance = (blocks: TrainingBlock[]) => {
        return blocks.reduce((total, block) => {
            const blockDist = block.items.reduce((bSum, item) => {
                const segDist = item.segments?.reduce((s, seg) => s + seg.distance, 0) || 0;
                const itemDist = (segDist > 0 ? segDist : item.distance) * item.repeats;
                return bSum + itemDist;
            }, 0);
            return total + (blockDist * block.rounds);
        }, 0);
    };

    // Actions
    const addBlock = (type: TrainingBlock["type"] = "Main Set") => {
        const newBlock: TrainingBlock = {
            id: uid(),
            type,
            rounds: 1,
            items: [],
            note: ""
        };
        const newBlocks = [...plan.blocks, newBlock];
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const duplicateBlock = (blockId: string) => {
        const blockIndex = plan.blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const original = plan.blocks[blockIndex];
        const newBlock: TrainingBlock = {
            ...original,
            id: uid(),
            items: original.items.map(item => ({
                ...item,
                id: uid(),
                segments: item.segments ? [...item.segments] : undefined
            }))
        };

        const newBlocks = [...plan.blocks];
        newBlocks.splice(blockIndex + 1, 0, newBlock); // Insert after original
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const updateBlock = (blockId: string, updates: Partial<TrainingBlock>) => {
        const newBlocks = plan.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const deleteBlock = (blockId: string) => {
        const newBlocks = plan.blocks.filter(b => b.id !== blockId);
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const addItemToBlock = (blockId: string) => {
        const newItem: PlanItem = {
            id: uid(),
            repeats: 1,
            distance: 100,
            stroke: "Free",
            intensity: "Moderate",
            description: "1 x 100m Free",
            equipment: [],
            segments: [],
            intervalMode: 'Interval'
        };
        const newBlocks = plan.blocks.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, items: [...b.items, newItem] };
        });
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const updateItem = (blockId: string, itemId: string, updates: Partial<PlanItem>) => {
        const newBlocks = plan.blocks.map(b => {
            if (b.id !== blockId) return b;
            const newItems = b.items.map(item => {
                if (item.id !== itemId) return item;
                const updatedItem = { ...item, ...updates };
                // Auto-desc if basic fields change
                if (updates.distance || updates.stroke || updates.repeats) {
                    updatedItem.description = `${updatedItem.repeats}x${updatedItem.distance}m ${updatedItem.stroke}`;
                }
                return updatedItem;
            });
            return { ...b, items: newItems };
        });
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    const toggleEquipment = (blockId: string, itemId: string, equip: Equipment) => {
        const block = plan.blocks.find(b => b.id === blockId);
        const item = block?.items.find(i => i.id === itemId);
        if (item) {
            const newEquip = item.equipment.includes(equip)
                ? item.equipment.filter(e => e !== equip)
                : [...item.equipment, equip];
            updateItem(blockId, itemId, { equipment: newEquip });
        }
    };

    const deleteItem = (blockId: string, itemId: string) => {
        const newBlocks = plan.blocks.map(b => {
            if (b.id !== blockId) return b;
            return { ...b, items: b.items.filter(i => i.id !== itemId) };
        });
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
    };

    // Segment Logic
    const addSegment = (blockId: string, itemId: string) => {
        const block = plan.blocks.find(b => b.id === blockId);
        const item = block?.items.find(i => i.id === itemId);
        if (!item) return;

        const newSegment: PlanSegment = { distance: 25, type: "Swim", description: "" };
        const segments = [...(item.segments || []), newSegment];

        // Sum segments for total distance if they exist
        const totalSegDist = segments.reduce((sum, s) => sum + s.distance, 0);

        updateItem(blockId, itemId, { segments, distance: totalSegDist });
    };

    const updateSegment = (blockId: string, itemId: string, segIdx: number, updates: Partial<PlanSegment>) => {
        const block = plan.blocks.find(b => b.id === blockId);
        const item = block?.items.find(i => i.id === itemId);
        if (!item || !item.segments) return;

        const newSegments = [...item.segments];
        newSegments[segIdx] = { ...newSegments[segIdx], ...updates };

        const totalSegDist = newSegments.reduce((sum, s) => sum + s.distance, 0);
        updateItem(blockId, itemId, { segments: newSegments, distance: totalSegDist });
    };

    const removeSegment = (blockId: string, itemId: string, segIdx: number) => {
        const block = plan.blocks.find(b => b.id === blockId);
        const item = block?.items.find(i => i.id === itemId);
        if (!item || !item.segments) return;

        const newSegments = item.segments.filter((_, idx) => idx !== segIdx);
        // If no segments left, don't auto-update distance (keep manual)
        if (newSegments.length === 0) {
            updateItem(blockId, itemId, { segments: [] });
        } else {
            const totalSegDist = newSegments.reduce((sum, s) => sum + s.distance, 0);
            updateItem(blockId, itemId, { segments: newSegments, distance: totalSegDist });
        }
    };

    const handleSave = () => {
        if (initialPlan) {
            updatePlan(plan.id, plan);
        } else {
            addPlan(plan);
        }
        router.push("/dashboard");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-40">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {initialPlan ? t.editor.editPlan : t.editor.newPlan}
                        </h1>
                        <p className="text-xs text-muted-foreground">{plan.group} • {plan.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block px-4 py-1 rounded-full bg-secondary text-sm font-mono text-primary border border-primary/20">
                        Total: {plan.totalDistance}m
                    </div>

                    <div className="hidden lg:block">
                        <AIInsight plan={plan} swimmers={swimmers} />
                    </div>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                    >
                        <Save className="w-4 h-4" />
                        {t.common.publish}
                    </button>
                </div>
            </div>

            {/* Blocks List */}
            <div className="space-y-8">
                {plan.blocks?.map((block, bIndex) => (
                    <div key={block.id} className="relative group/block">
                        {/* Block Header */}
                        <div className="flex items-center gap-4 mb-4 bg-secondary/10 p-3 rounded-xl border border-white/5">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Layers className="w-5 h-5 text-primary" />
                            </div>
                            <select
                                value={block.type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateBlock(block.id, { type: e.target.value as TrainingBlock["type"] })}
                                className="bg-transparent font-bold text-lg text-white outline-none"
                            >
                                {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            <div className="h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono uppercase">Rounds:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={block.rounds}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { rounds: parseInt(e.target.value) || 1 })}
                                    className="w-12 bg-black/20 rounded text-center font-bold text-white border border-white/10"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Block Note (e.g. Descending)"
                                value={block.note || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { note: e.target.value })}
                                className="flex-1 bg-transparent text-sm text-muted-foreground focus:text-white outline-none border-b border-transparent focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                            />

                            <button onClick={() => duplicateBlock(block.id)} className="p-2 text-white/20 hover:text-primary transition-colors" title="Duplicate Block">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteBlock(block.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Items Container */}
                        <div className={`space-y-3 pl-4 border-l-2 ${block.rounds > 1 ? "border-primary/50" : "border-white/5"}`}>
                            {block.items.map((item, iIndex) => (
                                <div key={item.id} className="bg-card/40 border border-border rounded-xl p-4 hover:bg-card/60 transition-all relative group/item">
                                    <div className="grid grid-cols-12 gap-4 items-start">

                                        {/* Repeats x Distance */}
                                        <div className="col-span-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={item.repeats}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(block.id, item.id, { repeats: parseInt(e.target.value) })}
                                                className="w-10 bg-transparent text-xl font-bold text-right outline-none"
                                            />
                                            <span className="text-muted-foreground">x</span>
                                            <input
                                                type="number"
                                                value={item.distance}
                                                disabled={item.segments && item.segments.length > 0}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(block.id, item.id, { distance: parseInt(e.target.value) })}
                                                className={cn(
                                                    "w-16 bg-transparent text-xl font-bold outline-none",
                                                    item.segments && item.segments.length > 0 && "text-muted-foreground opacity-50"
                                                )}
                                            />
                                            <span className="text-xs text-muted-foreground">m</span>
                                        </div>

                                        {/* Stroke & Interval */}
                                        <div className="col-span-3 flex flex-col gap-2">
                                            <select
                                                value={item.stroke}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(block.id, item.id, { stroke: e.target.value as PlanItem["stroke"] })}
                                                className="bg-secondary/30 rounded px-2 py-1 text-sm font-medium outline-none text-white border border-white/5"
                                            >
                                                {STROKES_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>

                                            {/* Interval Toggle */}
                                            <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1 group/interval hover:bg-black/40 transition-colors cursor-pointer">
                                                <button
                                                    onClick={() => updateItem(block.id, item.id, { intervalMode: item.intervalMode === 'Rest' ? 'Interval' : 'Rest' })}
                                                    className={cn(
                                                        "w-4 h-4 flex items-center justify-center rounded-sm transition-colors",
                                                        item.intervalMode === 'Rest' ? "text-yellow-400" : "text-primary"
                                                    )}
                                                    title={item.intervalMode === 'Rest' ? "Rest Mode" : "Interval Mode"}
                                                >
                                                    {item.intervalMode === 'Rest' ? <Hourglass className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder={item.intervalMode === 'Rest' ? "Rest :15" : "@ 1:30"}
                                                    value={item.interval || ""}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(block.id, item.id, { interval: e.target.value })}
                                                    className={cn(
                                                        "w-full bg-transparent text-xs font-mono outline-none",
                                                        item.intervalMode === 'Rest' ? "text-yellow-400 placeholder:text-yellow-400/30" : "text-primary placeholder:text-primary/30"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-5 px-2">
                                            {/* Segments Toggle */}
                                            {(!item.segments || item.segments.length === 0) ? (
                                                <input
                                                    value={item.description}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(block.id, item.id, { description: e.target.value })}
                                                    className="w-full bg-transparent text-sm text-white/80 outline-none border-b border-transparent focus:border-white/20"
                                                />
                                            ) : (
                                                <div className="space-y-2">
                                                    {item.segments.map((seg, sIdx) => (
                                                        <div key={sIdx} className="flex items-center gap-2 text-xs">
                                                            <input
                                                                type="number"
                                                                value={seg.distance}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSegment(block.id, item.id, sIdx, { distance: parseInt(e.target.value) })}
                                                                className="w-10 bg-black/20 rounded px-1 py-0.5 text-center"
                                                            />
                                                            <select
                                                                value={seg.type}
                                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSegment(block.id, item.id, sIdx, { type: e.target.value as PlanSegment["type"] })}
                                                                className="bg-transparent text-muted-foreground"
                                                            >
                                                                <option>Swim</option><option>Kick</option><option>Drill</option>
                                                            </select>
                                                            <input
                                                                value={seg.description || ""}
                                                                placeholder="Detail..."
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSegment(block.id, item.id, sIdx, { description: e.target.value })}
                                                                className="flex-1 bg-transparent border-b border-white/10"
                                                            />
                                                            <button onClick={() => removeSegment(block.id, item.id, sIdx)} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => addSegment(block.id, item.id)}
                                                className="mt-2 text-[10px] text-blue-400 flex items-center gap-1 hover:underline"
                                            >
                                                <List className="w-3 h-3" />
                                                {(item.segments && item.segments.length > 0) ? "Add Segment" : "Breakdown (Segments)"}
                                            </button>
                                        </div>

                                        {/* Delete Item */}
                                        <div className="col-span-1 flex justify-end">
                                            <button onClick={() => deleteItem(block.id, item.id)} className="text-white/10 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addItemToBlock(block.id)}
                                className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-muted-foreground hover:text-white hover:border-white/20 transition-all"
                            >
                                + Add Swim to {block.type}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Batch Notes Section */}
                <div className="bg-card/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md sticky bottom-4 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                {t.editor.instruction} (Private)
                            </h3>
                            <span className="text-[10px] text-muted-foreground">Select swimmers to assign notes</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Swimmer Selector */}
                        <div className="flex flex-wrap gap-2">
                            {swimmers.filter(s => s.group === plan.group).map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSwimmerSelection(s.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                        selectedSwimmers.includes(s.id)
                                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(100,255,218,0.4)]"
                                            : "bg-black/20 text-muted-foreground border-white/10 hover:border-white/30"
                                    )}
                                >
                                    {s.name}
                                    {plan.targetedNotes?.[s.id] && <span className="ml-1 text-[10px] text-yellow-400">★</span>}
                                </button>
                            ))}
                        </div>

                        {/* Note Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={batchNote}
                                onChange={(e) => setBatchNote(e.target.value)}
                                placeholder="e.g. Focus on high elbows..."
                                className="flex-1 bg-black/40 rounded-xl px-4 py-2 text-sm text-white placeholder:text-muted-foreground/50 border border-white/5 focus:border-primary/50 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && applyBatchNote()}
                            />
                            <button
                                onClick={applyBatchNote}
                                disabled={selectedSwimmers.length === 0 || !batchNote.trim()}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

