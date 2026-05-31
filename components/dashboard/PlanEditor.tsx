"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Clock,
  X,
  Dumbbell,
  ChevronRight,
  Save,
  Send,
  ImagePlus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TrainingBlock, TrainingPlan, GroupLevel, PlanItem, Equipment, PlanSegment } from "@/types";
import { useToast } from "@/components/common/Toast";
import { RichTextEditor } from "./RichTextEditor";
import { WorkoutLibrary } from "./WorkoutLibrary";
import { PaceCalculator } from "./PaceCalculator";

const GROUPS: GroupLevel[] = ["Advanced", "Intermediate", "Junior", "External"];
const STROKES: PlanItem["stroke"][] = ["Free", "Back", "Breast", "Fly", "IM", "Choice"];
const DISTANCES = [15, 25, 50, 75, 100, 150, 200, 300, 400, 800];
const EQUIPMENT_MAP: Record<Equipment, string> = {
  Fins: "脚蹼",
  Paddles: "手蹼",
  Snorkel: "呼吸管",
  Kickboard: "浮板",
  Pullbuoy: "夹板",
};
const EQUIPMENT = Object.keys(EQUIPMENT_MAP) as Equipment[];
const TYPES: TrainingBlock["type"][] = [
  "Warmup",
  "Pre-Set",
  "Main Set",
  "Drill Set",
  "Cool Down",
];
const BLOCK_TYPES_MAP: Record<string, string> = {
  Warmup: "热身",
  "Pre-Set": "预备组",
  "Main Set": "主项",
  "Drill Set": "分解练习",
  "Cool Down": "放松",
};
const STROKES_MAP: Record<string, string> = {
  Free: "自由泳",
  Back: "仰泳",
  Breast: "蛙泳",
  Fly: "蝶泳",
  IM: "混合泳",
  Choice: "自选",
};

const uid = () => Math.random().toString(36).substr(2, 9);

interface PlanEditorProps {
  initialPlan?: TrainingPlan | null;
}

export function PlanEditor({ initialPlan }: PlanEditorProps) {
  const router = useRouter();
  const { plans, addPlan, updatePlan } = useStore();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Plan metadata state
  const [group, setGroup] = useState<GroupLevel>(initialPlan?.group || "Advanced");
  const [date, setDate] = useState(initialPlan?.date || new Date().toISOString().split("T")[0]);
  const [focus, setFocus] = useState(initialPlan?.focus || "");
  const [coachNotes, setCoachNotes] = useState(initialPlan?.coachNotes || "");
  const [targetedNotes, setTargetedNotes] = useState<Record<string, string>>(
    typeof initialPlan?.targetedNotes === "string"
      ? JSON.parse(initialPlan.targetedNotes)
      : initialPlan?.targetedNotes || {}
  );
  const [trainingType, setTrainingType] = useState(initialPlan?.trainingType || "");
  const [primaryStroke, setPrimaryStroke] = useState(initialPlan?.primaryStroke || "");
  const [blocks, setBlocks] = useState<TrainingBlock[]>(initialPlan?.blocks || []);
  const [isPublishing, setIsPublishing] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"add" | "library" | "tools">("add");

  // Add set state
  const [newSetType, setNewSetType] = useState<TrainingBlock["type"]>("Main Set");
  const [repeats, setRepeats] = useState(4);
  const [distance, setDistance] = useState(100);
  const [stroke, setStroke] = useState<PlanItem["stroke"]>("Free");
  const [interval, setInterval] = useState("1:30");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

  const totalDistance = blocks.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.repeats * i.distance, 0),
    0
  );

  const handleAddSet = () => {
    const newItem: PlanItem = {
      id: uid(),
      repeats,
      distance,
      stroke,
      intensity: "Moderate",
      description: "",
      equipment: selectedEquipment,
      interval,
      intervalMode: "Interval",
    };

    const newBlock: TrainingBlock = {
      id: uid(),
      type: newSetType,
      rounds: 1,
      items: [newItem],
    };

    setBlocks([...blocks, newBlock]);
    setIsDrawerOpen(false);
    setRepeats(4);
    setDistance(100);
  };

  const handleUseTemplate = (template: any) => {
    const newBlock: TrainingBlock = {
      id: uid(),
      type: template.category || "Main Set",
      rounds: 1,
      items: (template.items || []).map((item: any) => ({
        ...item,
        id: uid(),
      })),
    };
    setBlocks([...blocks, newBlock]);
    setIsDrawerOpen(false);
    toast("success", `已添加模板: ${template.name}`);
  };

  const handlePublish = async () => {
    if (blocks.length === 0) {
      toast("error", "请至少添加一个训练块");
      return;
    }

    setIsPublishing(true);
    const planData: Partial<TrainingPlan> = {
      date,
      group,
      status: "Published" as const,
      focus,
      totalDistance,
      coachNotes,
      targetedNotes,
      trainingType,
      primaryStroke,
      blocks,
    };

    try {
      if (initialPlan?.id) {
        await updatePlan(initialPlan.id, planData);
        toast("success", "计划已更新！");
      } else {
        const newPlan: TrainingPlan = {
          id: "p_" + Date.now(),
          ...(planData as any),
        };
        await addPlan(newPlan);
        toast("success", "计划已发布！");
      }
      router.push("/dashboard");
    } catch {
      toast("error", "保存失败，请重试");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const handleAddItemToBlock = (blockId: string) => {
    const newItem: PlanItem = {
      id: uid(),
      repeats: 1,
      distance: 100,
      stroke: "Free",
      intensity: "Moderate",
      description: "",
      equipment: [],
      segments: [] as PlanSegment[],
      intervalMode: "Interval",
    };
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, items: [...b.items, newItem] };
      })
    );
  };

  const handleRemoveItem = (blockId: string, itemId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, items: b.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const handleUpdateItem = (
    blockId: string,
    itemId: string,
    updates: Partial<PlanItem>
  ) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          items: b.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, ...updates };
          }),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <div className="px-4 pt-4 max-w-4xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" aria-label="面包屑导航">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            {t.common.dashboard}
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span className="text-white font-medium">
            {initialPlan ? t.editor.editPlan : t.editor.newPlan}
          </span>
        </nav>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-muted-foreground hover:text-white transition-colors rounded-lg"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-lg leading-tight">
            {initialPlan ? "编辑计划" : "新建计划"}
          </h1>
          <span className="text-xs text-muted-foreground">
            {totalDistance > 0 ? `${totalDistance}m · ${blocks.length} 块` : "Plan Editor"}
          </span>
        </div>
        <button
          onClick={handlePublish}
          disabled={isPublishing || blocks.length === 0}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 min-h-[44px] rounded-full text-xs font-bold disabled:opacity-30 disabled:text-muted-foreground disabled:cursor-not-allowed hover:bg-primary/20 transition-all border border-primary/20"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              发布
            </>
          )}
        </button>
      </header>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Meta Config */}
        <div className="space-y-4 bg-card/40 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
              训练组别 (Group)
            </label>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={cn(
                    "px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold transition-all border",
                    group === g
                      ? "bg-primary text-black border-primary"
                      : "bg-black/20 text-muted-foreground border-white/5 hover:bg-white/5"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plan-date" className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
                日期 (Date)
              </label>
              <input
                id="plan-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
            <div>
              <label htmlFor="plan-focus" className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
                训练主题 (Focus)
              </label>
              <input
                id="plan-focus"
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="如: 有氧耐力"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="training-type" className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
                训练类型 (Type)
              </label>
              <select
                id="training-type"
                value={trainingType}
                onChange={(e) => setTrainingType(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="">无 (None)</option>
                <option value="aerobic">有氧 Aerobic</option>
                <option value="anaerobic">无氧 Anaerobic</option>
                <option value="lactate">乳酸 Lactate</option>
                <option value="sprint">冲刺 Sprint</option>
                <option value="recovery">恢复 Recovery</option>
                <option value="endurance">耐力 Endurance</option>
                <option value="race_prep">赛前 Race Prep</option>
              </select>
            </div>
            <div>
              <label htmlFor="primary-stroke" className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
                主项 (Primary Stroke)
              </label>
              <select
                id="primary-stroke"
                value={primaryStroke}
                onChange={(e) => setPrimaryStroke(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="">无 (None)</option>
                {STROKES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Coach Notes */}
        <div className="bg-card/40 p-4 rounded-2xl border border-white/5">
          <label className="text-xs text-muted-foreground uppercase font-bold mb-2 block">
            教练备注 (Coach Notes)
          </label>
          <RichTextEditor
            value={coachNotes}
            onChange={setCoachNotes}
            placeholder="本周训练要点..."
          />
        </div>

        {/* Training Blocks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              训练内容 ({blocks.length} 块 · {totalDistance}m)
            </h3>
          </div>

          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-white/10">
              <Dumbbell className="w-12 h-12 opacity-25 mb-3" />
              <p className="font-medium">暂无训练内容</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                点击右下角 + 号开始添加
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-20">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="bg-card border border-border p-4 rounded-2xl relative group animate-in slide-in-from-bottom-4 duration-300 shadow-sm"
                >
                  <button
                    onClick={() => handleRemoveBlock(block.id)}
                    className="absolute right-3 top-3 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                    aria-label={`删除训练块 ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="text-xs text-primary font-bold uppercase tracking-wider">
                      {BLOCK_TYPES_MAP[block.type] || block.type}
                    </div>
                  </div>

                  {block.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1 mb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-white">
                          {item.repeats}
                        </span>
                        <span className="text-sm text-muted-foreground">x</span>
                        <span className="text-2xl font-bold text-white">
                          {item.distance}m
                        </span>
                        <span className="ml-2 text-lg font-medium text-primary">
                          {STROKES_MAP[item.stroke] || item.stroke}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleUpdateItem(block.id, item.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="备注..."
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
                        />
                        <input
                          type="text"
                          value={item.interval || ""}
                          onChange={(e) =>
                            handleUpdateItem(block.id, item.id, {
                              interval: e.target.value,
                            })
                          }
                          placeholder="@1:30"
                          className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 font-mono"
                        />
                        <button
                          onClick={() => handleRemoveItem(block.id, item.id)}
                          className="p-1.5 text-white/20 hover:text-red-400 transition-colors rounded"
                          aria-label="删除此项目"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddItemToBlock(block.id)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                    aria-label="添加项目到训练块"
                  >
                    <Plus className="w-3.5 h-3.5" /> 添加项目
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setIsDrawerOpen(true);
          setDrawerTab("add");
        }}
        className="fixed bottom-8 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-[0_0_20px_rgba(100,255,218,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
        aria-label="添加训练块"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Bottom Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDrawerOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[#0f172a] rounded-t-3xl border-t border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">添加训练</h2>
                <p className="text-xs text-muted-foreground">Add Set</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2">
              {(["add", "library", "tools"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    drawerTab === tab
                      ? "bg-primary text-black"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {tab === "add" ? "添加" : tab === "library" ? "训练库" : "工具"}
                </button>
              ))}
            </div>

            {drawerTab === "add" && (
              <>
                {/* Type Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewSetType(t)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all border",
                        newSetType === t
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                      )}
                    >
                      {BLOCK_TYPES_MAP[t]}
                    </button>
                  ))}
                </div>

                {/* Repeats x Distance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">
                      组数 (Repeats)
                    </label>
                    <div className="flex items-center gap-2 bg-black/20 rounded-2xl p-2 border border-white/5">
                      <button
                        onClick={() => setRepeats(Math.max(1, repeats - 1))}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="减少组数"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center text-xl font-bold text-white">
                        {repeats}
                      </span>
                      <button
                        onClick={() => setRepeats(repeats + 1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="增加组数"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">
                      距离 (Distance)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DISTANCES.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDistance(d)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                            distance === d
                              ? "bg-primary text-black border-primary"
                              : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stroke */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">
                    泳姿 (Stroke)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STROKES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStroke(s)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                          stroke === s
                            ? "bg-white text-black border-white"
                            : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                        )}
                      >
                        {STROKES_MAP[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interval */}
                <div className="space-y-2">
                  <label htmlFor="set-interval" className="text-xs uppercase font-bold text-muted-foreground">
                    包干 (Interval)
                  </label>
                  <input
                    id="set-interval"
                    type="text"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    placeholder="1:30"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Equipment */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">
                    器材 (Equipment)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((eq) => (
                      <button
                        key={eq}
                        onClick={() =>
                          setSelectedEquipment(
                            selectedEquipment.includes(eq)
                              ? selectedEquipment.filter((e) => e !== eq)
                              : [...selectedEquipment, eq]
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                          selectedEquipment.includes(eq)
                            ? "bg-primary/20 text-primary border-primary/50"
                            : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                        )}
                      >
                        {EQUIPMENT_MAP[eq]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">预览</p>
                  <p className="text-xl font-bold text-white">
                    {repeats}x{distance}m{" "}
                    <span className="text-primary">{STROKES_MAP[stroke]}</span>
                    {interval && (
                      <span className="text-blue-300 font-mono ml-2 text-base">
                        @{interval}
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={handleAddSet}
                  className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> 添加到计划
                </button>
              </>
            )}

            {drawerTab === "library" && (
              <WorkoutLibrary
                onSelect={handleUseTemplate}
                onClose={() => setIsDrawerOpen(false)}
              />
            )}

            {drawerTab === "tools" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">配速计算器</h3>
                <PaceCalculator />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
