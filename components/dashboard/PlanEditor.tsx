"use client";

import { useState, useEffect } from "react";
import { TrainingPlan, PlanItem, GroupLevel, Equipment, TrainingBlock, PlanSegment, BlockTemplate } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Waves, Info, Layers, Clock, List, Copy, Timer, Hourglass, BookOpen, X, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { WorkoutLibrary } from "@/components/dashboard/WorkoutLibrary";
import { getLocalDateISOString } from "@/lib/date-utils";

// UID Helper (Deterministic-ish for client)
const uid = () => {
    if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substr(2, 9);
};


const DISTANCE_PRESETS = [15, 25, 50, 100, 200, 400, 800, 1500];
const STROKES_KEYS = ["Free", "Back", "Breast", "Fly", "IM", "Choice"] as const;
const STROKES_MAP: Record<string, string> = {
    "Free": "自由泳",
    "Back": "仰泳",
    "Breast": "蛙泳",
    "Fly": "蝶泳",
    "IM": "混合泳",
    "Choice": "自选"
};
const EQUIPMENT: Equipment[] = ["Fins", "Paddles", "Snorkel", "Kickboard", "Pullbuoy"];
const EQUIPMENT_MAP: Record<Equipment, string> = {
    "Fins": "脚蹼",
    "Paddles": "手蹼",
    "Snorkel": "呼吸管",
    "Kickboard": "浮板",
    "Pullbuoy": "夹板"
};
const BLOCK_TYPES = ["Warmup", "Pre-Set", "Main Set", "Drill Set", "Cool Down"] as const;
const BLOCK_TYPES_MAP: Record<string, string> = {
    "Warmup": "热身",
    "Pre-Set": "预备组",
    "Main Set": "主项",
    "Drill Set": "分解练习",
    "Cool Down": "放松"
};

interface PlanEditorProps {
    initialPlan?: TrainingPlan;
}

export function PlanEditor({ initialPlan }: PlanEditorProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const { addPlan, updatePlan, swimmers, addTemplate } = useStore();
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Initialize State
    const [plan, setPlan] = useState<TrainingPlan>(initialPlan || {
        id: uid(),
        date: getLocalDateISOString(),
        group: "Advanced",
        status: "Draft",
        focus: "",
        totalDistance: 0,
        coachNotes: "",
        blocks: [], // New Structure
        targetedNotes: {}
    });

    const [batchNote, setBatchNote] = useState("");
    const [batchNoteOpen, setBatchNoteOpen] = useState(false);
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

    const handleSaveTemplate = (block: TrainingBlock) => {
        const name = prompt("给这个训练块起个名字 (保存为模板):", `${BLOCK_TYPES_MAP[block.type]} - ${block.items.length} 项`);
        if (name) {
            addTemplate(block, name, block.type);
            setIsLibraryOpen(true); // Auto open
        }
    };

    const addBlockFromTemplate = (template: BlockTemplate) => {
        const newBlock: TrainingBlock = {
            ...template,
            id: uid(),
            // Regenerate item IDs
            items: template.items.map(item => ({ ...item, id: uid() }))
        };
        const newBlocks = [...plan.blocks, newBlock];
        setPlan({ ...plan, blocks: newBlocks, totalDistance: calculateTotalDistance(newBlocks) });
        // Optional: Scroll to bottom
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
            description: "1 x 100m 自由泳",
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
                    const sName = STROKES_MAP[updatedItem.stroke] || updatedItem.stroke;
                    updatedItem.description = `${updatedItem.repeats}x${updatedItem.distance}m ${sName}`;
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
        // Count how many swimmers have notes
        const notesCount = Object.keys(plan.targetedNotes || {}).length;

        if (initialPlan) {
            updatePlan(plan.id, plan);
        } else {
            addPlan(plan);
        }

        // Show success message with details
        const message = `✅ 计划已保存！\n\n` +
            `📅 日期: ${plan.date}\n` +
            `👥 组别: ${plan.group === "Advanced" ? "高级组" : plan.group === "Intermediate" ? "中级组" : "初级组"}\n` +
            `🏊 总距离: ${plan.totalDistance}m\n` +
            `📝 备注: 已为 ${notesCount} 位队员添加备注`;

        alert(message);
        router.push("/dashboard");
    };

    // Auto-Save Draft Logic
    useEffect(() => {
        if (!initialPlan && plan && plan.blocks.length > 0) {
            const draft = JSON.stringify(plan);
            localStorage.setItem("aquaflow_draft_plan", draft);
            localStorage.setItem("aquaflow_draft_timestamp", new Date().toISOString());
        }
    }, [plan, initialPlan]);

    // Recover Draft on Mount
    useEffect(() => {
        if (!initialPlan) {
            const savedDraft = localStorage.getItem("aquaflow_draft_plan");
            const savedTime = localStorage.getItem("aquaflow_draft_timestamp");

            if (savedDraft && savedTime) {
                const diffMinutes = (new Date().getTime() - new Date(savedTime).getTime()) / 1000 / 60;
                // If draft is less than 24 hours old, load it
                if (diffMinutes < 1440) {
                    try {
                        setPlan(JSON.parse(savedDraft));
                    } catch (e) {
                        console.error("Failed to parse draft", e);
                    }
                }
            }
        }
    }, [initialPlan]);

    return (
        <>
            <div className={cn("transition-all duration-300", isLibraryOpen ? "md:mr-80" : "")}>
                <div className="space-y-6 max-w-5xl mx-auto pb-40">
                    {/* Header */}
                    <div className="flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md py-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                            </Link>
                            <div>
                                <h1 className="text-lg md:text-2xl font-bold text-white">
                                    {initialPlan ? t.editor.editPlan : t.editor.newPlan}
                                </h1>

                                {/* Header Controls */}
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                    {/* Group Selector */}
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1">
                                        <label className="text-[10px] text-muted-foreground">{t.editor.group}</label>
                                        <select
                                            value={plan.group}
                                            onChange={(e) => setPlan({ ...plan, group: e.target.value as GroupLevel })}
                                            className="bg-transparent text-xs font-bold text-white outline-none [&>option]:text-black"
                                        >
                                            {/* @ts-ignore */}
                                            <option value="Advanced">{t.editor.groupSelector?.Advanced || "Advanced"}</option>
                                            {/* @ts-ignore */}
                                            <option value="Intermediate">{t.editor.groupSelector?.Intermediate || "Intermediate"}</option>
                                            {/* @ts-ignore */}
                                            <option value="Junior">{t.editor.groupSelector?.Junior || "Junior"}</option>
                                        </select>
                                    </div>

                                    {/* Time Selector */}
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-muted-foreground">{t.editor.timeStart}</span>
                                            <input
                                                type="time"
                                                value={plan.startTime || ""}
                                                onChange={(e) => setPlan({ ...plan, startTime: e.target.value })}
                                                className="bg-transparent text-xs font-mono text-white outline-none"
                                            />
                                        </div>
                                        <span className="text-white/20">-</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-muted-foreground">{t.editor.timeEnd}</span>
                                            <input
                                                type="time"
                                                value={plan.endTime || ""}
                                                onChange={(e) => setPlan({ ...plan, endTime: e.target.value })}
                                                className="bg-transparent text-xs font-mono text-white outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1">
                                        <span className="text-[10px] text-muted-foreground">日期</span>
                                        <input
                                            type="date"
                                            value={plan.date}
                                            onChange={(e) => setPlan({ ...plan, date: e.target.value })}
                                            className="bg-transparent text-xs font-mono text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block px-4 py-1 rounded-full bg-secondary text-sm font-mono text-primary border border-primary/20">
                                {t.editor.totalDistance}: {plan.totalDistance}m
                            </div>

                            <div className="hidden lg:block">
                                <AIInsight plan={plan} swimmers={swimmers} />
                            </div>

                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(100,255,218,0.3)] text-xs md:text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {initialPlan ? t.editor.updatePlan : t.editor.publishPlan}
                            </button>

                            <button
                                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                                className={cn(
                                    "p-2 rounded-full transition-all border",
                                    isLibraryOpen
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary text-muted-foreground border-white/10 hover:text-white"
                                )}
                                title="Toggle Workout Library"
                            >
                                <BookOpen className="w-5 h-5" />
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
                                        className="bg-transparent font-bold text-lg text-white outline-none [&>option]:text-black"
                                    >
                                        {BLOCK_TYPES.map(t => <option key={t} value={t}>{BLOCK_TYPES_MAP[t]}</option>)}
                                    </select>

                                    <div className="h-6 w-px bg-white/10" />

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-mono uppercase">组数:</span>
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
                                        placeholder="训练块备注 (例如: 递减游)"
                                        value={block.note || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { note: e.target.value })}
                                        className="flex-1 bg-transparent text-sm text-muted-foreground focus:text-white outline-none border-b border-transparent focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                                    />

                                    <button
                                        onClick={() => handleSaveTemplate(block)}
                                        className="p-2 text-white/20 hover:text-green-400 transition-colors"
                                        title="保存为模板"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => duplicateBlock(block.id)} className="p-2 text-white/20 hover:text-primary transition-colors" title="复制训练块">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteBlock(block.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors" title="删除训练块">
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

                                                    {/* Distance Presets */}
                                                    <select
                                                        className="w-4 bg-transparent outline-none text-muted-foreground hover:text-white cursor-pointer"
                                                        onChange={(e) => updateItem(block.id, item.id, { distance: parseInt(e.target.value) })}
                                                        value=""
                                                    >
                                                        <option value="" disabled>▾</option>
                                                        {DISTANCE_PRESETS.map(d => (
                                                            <option key={d} value={d} className="text-black">
                                                                {d}m
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Stroke & Interval */}
                                                <div className="col-span-3 flex flex-col gap-2">
                                                    <select
                                                        value={item.stroke}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(block.id, item.id, { stroke: e.target.value as PlanItem["stroke"] })}
                                                        className="bg-secondary/30 rounded px-2 py-1 text-sm font-medium outline-none text-white border border-white/5 [&>option]:text-black"
                                                    >
                                                        {STROKES_KEYS.map(s => <option key={s} value={s}>{STROKES_MAP[s]}</option>)}
                                                    </select>

                                                    {/* Interval Toggle */}
                                                    <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1 group/interval hover:bg-black/40 transition-colors cursor-pointer">
                                                        <button
                                                            onClick={() => updateItem(block.id, item.id, { intervalMode: item.intervalMode === 'Rest' ? 'Interval' : 'Rest' })}
                                                            className={cn(
                                                                "w-4 h-4 flex items-center justify-center rounded-sm transition-colors",
                                                                item.intervalMode === 'Rest' ? "text-yellow-400" : "text-primary"
                                                            )}
                                                            title={item.intervalMode === 'Rest' ? "休息模式" : "包干模式"}
                                                        >
                                                            {item.intervalMode === 'Rest' ? <Hourglass className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            placeholder={item.intervalMode === 'Rest' ? "休息 :15" : "包干 1:30"}
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
                                                                        <option value="Swim">配合</option><option value="Kick">打腿</option><option value="Drill">分解</option>
                                                                    </select>
                                                                    <input
                                                                        value={seg.description || ""}
                                                                        placeholder="详情..."
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
                                                        {(item.segments && item.segments.length > 0) ? "添加分段" : "拆分动作 (混合)"}
                                                    </button>

                                                    {/* Equipment Selection */}
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {EQUIPMENT.map(eq => {
                                                            const isSelected = item.equipment?.includes(eq);
                                                            return (
                                                                <button
                                                                    key={eq}
                                                                    onClick={() => toggleEquipment(block.id, item.id, eq)}
                                                                    className={cn(
                                                                        "px-2 py-0.5 rounded text-[10px] border transition-all",
                                                                        isSelected
                                                                            ? "bg-primary/20 border-primary text-primary"
                                                                            : "bg-transparent border-white/5 text-muted-foreground hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    {EQUIPMENT_MAP[eq]}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
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
                                        + 添加训练项
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Batch Notes Section - Collapsible Bottom Sheet Style */}
                        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
                            {/* Toggle Button */}
                            <button
                                onClick={() => setBatchNoteOpen(!batchNoteOpen)}
                                className="pointer-events-auto bg-yellow-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-110 transition-transform flex items-center justify-center relative"
                                title="Add Private Note"
                            >
                                <MessageSquareQuote className="w-6 h-6" />
                                {Object.keys(plan.targetedNotes || {}).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                                        {Object.keys(plan.targetedNotes || {}).length}
                                    </span>
                                )}
                            </button>

                            {/* Collapsible Content */}
                            {/* Collapsible Content */}
                            <div className={cn(
                                "pointer-events-auto mt-4 w-72 bg-[#0f172a] border border-yellow-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right",
                                batchNoteOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-12 h-0"
                            )}>
                                <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquareQuote className="w-3 h-3" />
                                        教练专属备注
                                    </h3>
                                    <button onClick={() => setBatchNoteOpen(false)} className="text-muted-foreground hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-3 space-y-3">
                                    <p className="text-[10px] text-muted-foreground">
                                        给队员的悄悄话 (选人 → 写内容 → 添加)
                                    </p>

                                    {/* Swimmer Selector */}
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                        {swimmers.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => toggleSwimmerSelection(s.id)}
                                                className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1",
                                                    selectedSwimmers.includes(s.id)
                                                        ? "bg-yellow-500 text-black border-yellow-500"
                                                        : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/30"
                                                )}
                                            >
                                                {s.name}
                                                {plan.targetedNotes?.[s.id] && <span className="text-[9px] ml-0.5 opacity-70">★</span>}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Note Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={batchNote}
                                            onChange={(e) => setBatchNote(e.target.value)}
                                            placeholder="输入叮嘱..."
                                            className="flex-1 bg-black/40 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-muted-foreground/50 border border-white/5 focus:border-yellow-500/50 outline-none transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && applyBatchNote()}
                                        />
                                        <button
                                            onClick={applyBatchNote}
                                            disabled={selectedSwimmers.length === 0 || !batchNote.trim()}
                                            className="bg-yellow-500 text-black px-2.5 py-1.5 rounded-lg font-bold text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Library Sidebar */}
            {isLibraryOpen && (
                <WorkoutLibrary
                    onSelect={addBlockFromTemplate}
                    onClose={() => setIsLibraryOpen(false)}
                />
            )}
        </>
    );
}

