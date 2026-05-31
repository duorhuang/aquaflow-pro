"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { ChevronLeft, Plus, Trash2, Clock, X, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TrainingBlock, TrainingPlan, GroupLevel, PlanItem, Equipment } from "@/types";


const GROUPS: GroupLevel[] = ["Advanced", "Intermediate", "Junior", "External"];
const STROKES: PlanItem["stroke"][] = ["Free", "Back", "Breast", "Fly", "IM", "Choice"];
const DISTANCES = [15, 25, 50, 75, 100, 150, 200, 300, 400, 800];
const EQUIPMENT_MAP: Record<Equipment, string> = {
    "Fins": "脚蹼",
    "Paddles": "手蹼",
    "Snorkel": "呼吸管",
    "Kickboard": "浮板",
    "Pullbuoy": "夹板"
};
const EQUIPMENT = Object.keys(EQUIPMENT_MAP) as Equipment[];
const TYPES: TrainingBlock["type"][] = ["Warmup", "Pre-Set", "Main Set", "Drill Set", "Cool Down"];
const BLOCK_TYPES_MAP: Record<string, string> = {
    "Warmup": "热身",
    "Pre-Set": "预备组",
    "Main Set": "主项",
    "Drill Set": "分解练习",
    "Cool Down": "放松"
};
const STROKES_MAP: Record<string, string> = {
    "Free": "自由泳",
    "Back": "仰泳",
    "Breast": "蛙泳",
    "Fly": "蝶泳",
    "IM": "混合泳",
    "Choice": "自选"
};
const GROUPS_MAP: Record<string, string> = {
    "Advanced": "高级组",
    "Intermediate": "中级组",
    "Junior": "初级组",
    "External": "校外组"
};

function Breadcrumb() {
    const { t } = useLanguage();
    return (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
            <Link href="/dashboard" className="hover:text-white transition-colors">{t.common.dashboard}</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white font-medium">{t.editor.quickPlan}</span>
        </nav>
    );
}

function QuickPlanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const urlDate = searchParams.get('date');
    const { plans, addPlan, updatePlan } = useStore();
    const { t } = useLanguage();

    // Plan State
    const [group, setGroup] = useState<GroupLevel>("Advanced");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
    const [trainingType, setTrainingType] = useState<string>("");
    const [primaryStroke, setPrimaryStroke] = useState<string>("");

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // New Set State
    const [newSetType, setNewSetType] = useState<TrainingBlock["type"]>("Main Set");
    const [repeats, setRepeats] = useState(4);
    const [distance, setDistance] = useState(100);
    const [stroke, setStroke] = useState<PlanItem["stroke"]>("Free");
    const [interval, setInterval] = useState("1:30");
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

    // Load existing plan if ?id=XYZ is present
    useEffect(() => {
        if (id) {
            const plan = plans.find(p => p.id === id);
            if (plan) {
                setGroup(plan.group);
                setDate(plan.date);
                setBlocks(plan.blocks || []);
                setTrainingType(plan.trainingType || "");
                setPrimaryStroke(plan.primaryStroke || "");
            }
        }
    }, [id, plans]);

    // Set date from URL parameter if ?date=YYYY-MM-DD is present
    useEffect(() => {
        if (urlDate && !id) {
            setDate(urlDate);
        }
    }, [urlDate, id]);

    const handleAddSet = () => {
        const newItem: PlanItem = {
            id: Math.random().toString(36).substr(2, 9),
            repeats,
            distance,
            stroke,
            intensity: "Moderate",
            description: "",
            equipment: selectedEquipment,
            interval,
            intervalMode: "Interval"
        };

        const newBlock: TrainingBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: newSetType,
            rounds: 1,
            items: [newItem]
        };

        setBlocks([...blocks, newBlock]);
        setIsDrawerOpen(false);
        // Reset defaults
        setRepeats(4);
        setDistance(100);
    };

    const handlePublish = async () => {
        const totalDist = blocks.reduce((sum, b) =>
            sum + b.items.reduce((s, i) => s + (i.repeats * i.distance), 0), 0);

        const planData: Partial<TrainingPlan> = {
            date,
            group,
            status: "Published" as const,
            focus: "Quick Plan",
            totalDistance: totalDist,
            coachNotes: "Created via Quick Planner",
            trainingType,
            primaryStroke,
            blocks
        };

        try {
            if (id) {
                await updatePlan(id, planData);
            } else {
                const newPlan: TrainingPlan = {
                    id: 'p_' + Date.now(),
                    ...(planData as any)
                };
                await addPlan(newPlan);
            }
        } catch {
            // Optimistic store sync will recover
        }
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-background pb-24 flex flex-col">
            <div className="px-4 pt-4 max-w-4xl mx-auto w-full">
                <Breadcrumb />
            </div>

            {/* Header - Fixed Overlap Issues */}
            <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-muted-foreground hover:text-white transition-colors rounded-lg"
                    aria-label="返回"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-lg leading-tight">{id ? t.editor.editPlan : t.editor.newPlan}</h1>
                </div>
                <button
                    onClick={handlePublish}
                    disabled={blocks.length === 0}
                    className="bg-primary/10 text-primary px-3 py-1.5 min-h-[44px] rounded-full text-xs font-bold disabled:opacity-20 disabled:text-muted-foreground disabled:cursor-not-allowed hover:bg-primary/20 transition-all border border-primary/20"
                >
                    {t.common.publish}
                </button>
            </header>

            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* Meta Config */}
                <div className="space-y-4 bg-card/40 p-4 rounded-2xl border border-white/5">
                    <div>
                        <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">训练组别</label>
                        <div className="flex flex-wrap gap-2">
                            {GROUPS.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGroup(g)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                        group === g
                                            ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(100,255,218,0.3)]"
                                            : "bg-black/20 text-muted-foreground border-white/5 hover:bg-white/5"
                                    )}
                                >
                                    {GROUPS_MAP[g]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">日期</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">训练类型</label>
                            <select
                                value={trainingType}
                                onChange={(e) => setTrainingType(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            >
                                <option value="">无</option>
                                <option value="aerobic">有氧</option>
                                <option value="anaerobic">无氧</option>
                                <option value="lactate">乳酸</option>
                                <option value="sprint">冲刺</option>
                                <option value="recovery">恢复</option>
                                <option value="endurance">耐力</option>
                                <option value="race_prep">赛前</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">主项泳姿</label>
                            <select
                                value={primaryStroke}
                                onChange={(e) => setPrimaryStroke(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            >
                                <option value="">无</option>
                                <option value="Free">自由泳</option>
                                <option value="Back">仰泳</option>
                                <option value="Breast">蛙泳</option>
                                <option value="Fly">蝶泳</option>
                                <option value="IM">混合泳</option>
                                <option value="Choice">自选</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Plan Content */}
                <div className="space-y-3">
                    <label className="text-xs text-muted-foreground uppercase font-bold flex items-center justify-between">
                        <span>训练流程</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">{blocks.length} 个训练块</span>
                    </label>

                    {blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-card/20 rounded-2xl border border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground font-medium">暂无训练内容</p>
                            <p className="text-xs text-slate-500 mt-1">点击右下角 + 号开始添加</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20">
                            {blocks.map((block, idx) => (
                                <div key={block.id} className="bg-card border border-border p-4 rounded-2xl relative group animate-in slide-in-from-bottom-4 duration-300 shadow-sm">
                                    <button
                                        onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                                        className="absolute right-3 top-3 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                        aria-label={`删除训练块 ${idx + 1}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground">{idx + 1}</span>
                                        <div className="text-xs text-primary font-bold">{BLOCK_TYPES_MAP[block.type] || block.type}</div>
                                    </div>

                                    {block.items.map(item => (
                                        <div key={item.id} className="flex flex-col gap-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-white">{item.repeats}</span>
                                                <span className="text-sm text-muted-foreground">x</span>
                                                <span className="text-2xl font-bold text-white">{item.distance}m</span>
                                                <span className="ml-2 text-lg font-medium text-primary">{STROKES_MAP[item.stroke] || item.stroke}</span>
                                            </div>
                                            {(item.interval || item.equipment.length > 0) && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {item.interval && (
                                                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-blue-300 font-mono flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> @{item.interval}
                                                        </span>
                                                    )}
                                                    {item.equipment && item.equipment.map((eq: Equipment) => (
                                                        <span key={eq} className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-white/5">
                                                            {EQUIPMENT_MAP[eq]}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-8 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-[0_0_20px_rgba(100,255,218,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
            >
                <Plus className="w-7 h-7 stroke-[3]" />
            </button>

            {/* Bottom Drawer Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0f172a] rounded-t-3xl border-t border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300 shadow-2xl relative">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">添加训练</h2>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                aria-label="关闭"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Type Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-linear-fade">
                            {TYPES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setNewSetType(t as any)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all border",
                                        newSetType === t
                                            ? "bg-white text-black border-white shadow-lg"
                                            : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                                    )}
                                >
                                    {BLOCK_TYPES_MAP[t]}
                                </button>
                            ))}
                        </div>

                        {/* 组数 x 距离 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">组数</label>
                                <div className="flex items-center gap-2 bg-black/20 rounded-2xl p-2 border border-white/5">
                                    <button onClick={() => setRepeats(Math.max(1, repeats - 1))} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-xl font-bold hover:bg-white/20 text-white">-</button>
                                    <div className="flex-1 text-center text-3xl font-mono font-bold text-white">{repeats}</div>
                                    <button onClick={() => setRepeats(repeats + 1)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-xl font-bold hover:bg-white/20 text-white">+</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">距离</label>
                                <div className="relative">
                                    <select
                                        value={distance}
                                        onChange={(e) => setDistance(Number(e.target.value))}
                                        className="w-full h-[60px] bg-black/20 rounded-2xl px-4 text-2xl font-bold text-white border border-white/5 focus:outline-none focus:border-primary appearance-none"
                                    >
                                        {DISTANCES.map(d => <option key={d} value={d}>{d}m</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm font-bold">m</div>
                                </div>
                            </div>
                        </div>

                        {/* Stroke & Interval */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">泳姿</label>
                                <select
                                    value={stroke}
                                    onChange={(e) => setStroke(e.target.value as any)}
                                    className="w-full h-12 bg-black/20 rounded-xl px-4 text-white border border-white/5 focus:outline-none font-medium"
                                >
                                    {STROKES.map(s => <option key={s} value={s}>{STROKES_MAP[s]}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">包干时间</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={interval}
                                        onChange={(e) => setInterval(e.target.value)}
                                        className="w-full h-12 bg-black/20 rounded-xl pl-9 pr-4 text-white border border-white/5 focus:outline-none focus:border-primary font-mono text-lg placeholder:text-muted-foreground/30"
                                        placeholder="1:30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Equipment */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-muted-foreground">器材</label>
                            <div className="flex flex-wrap gap-2">
                                {EQUIPMENT.map(eq => {
                                    const isSelected = selectedEquipment.includes(eq);
                                    return (
                                        <button
                                            key={eq}
                                            onClick={() => isSelected
                                                ? setSelectedEquipment(selectedEquipment.filter(i => i !== eq))
                                                : setSelectedEquipment([...selectedEquipment, eq])
                                            }
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                                                isSelected
                                                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
                                                    : "bg-transparent border-white/10 text-muted-foreground hover:bg-white/5"
                                            )}
                                        >
                                            {EQUIPMENT_MAP[eq]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddSet}
                            className="w-full py-4 bg-gradient-to-r from-primary to-emerald-400 text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(100,255,218,0.3)] active:scale-95 transition-all mt-2"
                        >
                            确认添加
                        </button>
                        <div className="h-4 md:hidden" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function QuickPlanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <QuickPlanContent />
        </Suspense>
    );
}
