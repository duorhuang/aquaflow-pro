"use client";

import {
  TrainingBlock,
  PlanItem,
  PlanSegment,
  Equipment,
  BlockTemplate,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Save,
  Layers,
  Clock,
  Copy,
  Timer,
  Hourglass,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { WorkoutLibrary } from "@/components/dashboard/WorkoutLibrary";

// UID Helper (Deterministic-ish for client)
const uid = () => {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9);
};

const DISTANCE_PRESETS = [15, 25, 50, 100, 200, 400, 800, 1500];
const STROKES_KEYS = ["Free", "Back", "Breast", "Fly", "IM", "Choice"] as const;
const STROKES_MAP: Record<string, string> = {
  Free: "自由泳",
  Back: "仰泳",
  Breast: "蛙泳",
  Fly: "蝶泳",
  IM: "混合泳",
  Choice: "自选",
};
const EQUIPMENT: Equipment[] = [
  "Fins",
  "Paddles",
  "Snorkel",
  "Kickboard",
  "Pullbuoy",
];
const EQUIPMENT_MAP: Record<Equipment, string> = {
  Fins: "脚蹼",
  Paddles: "手蹼",
  Snorkel: "呼吸管",
  Kickboard: "浮板",
  Pullbuoy: "夹板",
};
const BLOCK_TYPES = [
  "Warmup",
  "Pre-Set",
  "Main Set",
  "Drill Set",
  "Cool Down",
] as const;
const BLOCK_TYPES_MAP: Record<string, string> = {
  Warmup: "热身",
  "Pre-Set": "预备组",
  "Main Set": "主项",
  "Drill Set": "分解练习",
  "Cool Down": "放松",
};

interface PlanModuleEditorProps {
  blocks: TrainingBlock[];
  onChange: (blocks: TrainingBlock[]) => void;
}

export function PlanModuleEditor({ blocks, onChange }: PlanModuleEditorProps) {
  const { addTemplate } = useStore();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const addBlock = (type: TrainingBlock["type"] = "Main Set") => {
    const newBlock: TrainingBlock = {
      id: uid(),
      type,
      rounds: 1,
      items: [],
      note: "",
    };
    onChange([...blocks, newBlock]);
  };

  const duplicateBlock = (blockId: string) => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const original = blocks[blockIndex];
    const newBlock: TrainingBlock = {
      ...original,
      id: uid(),
      items: original.items.map((item) => ({
        ...item,
        id: uid(),
        segments: item.segments ? [...item.segments] : undefined,
      })),
    };

    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const updateBlock = (blockId: string, updates: Partial<TrainingBlock>) => {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
  };

  const handleSaveTemplate = (block: TrainingBlock) => {
    const name = prompt(
      "给这个训练块起个名字 (保存为模板):",
      `${BLOCK_TYPES_MAP[block.type]} - ${block.items.length} 项`,
    );
    if (name) {
      addTemplate(block, name, block.type);
      alert("已保存到模板库");
    }
  };

  const deleteBlock = (blockId: string) => {
    onChange(blocks.filter((b) => b.id !== blockId));
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
      intervalMode: "Interval",
    };
    onChange(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, items: [...b.items, newItem] };
      }),
    );
  };

  const updateItem = (
    blockId: string,
    itemId: string,
    updates: Partial<PlanItem>,
  ) => {
    onChange(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        const newItems = b.items.map((item) => {
          if (item.id !== itemId) return item;
          const updatedItem = { ...item, ...updates };
          if (updates.distance || updates.stroke || updates.repeats) {
            const sName = STROKES_MAP[updatedItem.stroke] || updatedItem.stroke;
            updatedItem.description = `${updatedItem.repeats}x${updatedItem.distance}m ${sName}`;
          }
          return updatedItem;
        });
        return { ...b, items: newItems };
      }),
    );
  };

  const toggleEquipment = (
    blockId: string,
    itemId: string,
    equip: Equipment,
  ) => {
    const block = blocks.find((b) => b.id === blockId);
    const item = block?.items.find((i) => i.id === itemId);
    if (item) {
      const newEquip = item.equipment.includes(equip)
        ? item.equipment.filter((e) => e !== equip)
        : [...item.equipment, equip];
      updateItem(blockId, itemId, { equipment: newEquip });
    }
  };

  const deleteItem = (blockId: string, itemId: string) => {
    onChange(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, items: b.items.filter((i) => i.id !== itemId) };
      }),
    );
  };

  // Segment Logic
  const addSegment = (blockId: string, itemId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    const item = block?.items.find((i) => i.id === itemId);
    if (!item) return;

    const newSegment: PlanSegment = {
      distance: 25,
      type: "Swim",
      description: "",
    };
    const segments = [...(item.segments || []), newSegment];

    const totalSegDist = segments.reduce((sum, s) => sum + s.distance, 0);

    updateItem(blockId, itemId, { segments, distance: totalSegDist });
  };

  const updateSegment = (
    blockId: string,
    itemId: string,
    segIdx: number,
    updates: Partial<PlanSegment>,
  ) => {
    const block = blocks.find((b) => b.id === blockId);
    const item = block?.items.find((i) => i.id === itemId);
    if (!item || !item.segments) return;

    const newSegments = [...item.segments];
    newSegments[segIdx] = { ...newSegments[segIdx], ...updates };

    const totalSegDist = newSegments.reduce((sum, s) => sum + s.distance, 0);
    updateItem(blockId, itemId, {
      segments: newSegments,
      distance: totalSegDist,
    });
  };

  const removeSegment = (blockId: string, itemId: string, segIdx: number) => {
    const block = blocks.find((b) => b.id === blockId);
    const item = block?.items.find((i) => i.id === itemId);
    if (!item || !item.segments) return;

    const newSegments = item.segments.filter((_, idx) => idx !== segIdx);
    if (newSegments.length === 0) {
      updateItem(blockId, itemId, { segments: [] });
    } else {
      const totalSegDist = newSegments.reduce((sum, s) => sum + s.distance, 0);
      updateItem(blockId, itemId, {
        segments: newSegments,
        distance: totalSegDist,
      });
    }
  };

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="relative group/block bg-black/20 rounded-xl p-4 border border-white/5"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-secondary/20 p-2 rounded-lg">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <select
              value={block.type}
              onChange={(e) =>
                updateBlock(block.id, {
                  type: e.target.value as TrainingBlock["type"],
                })
              }
              className="bg-transparent font-bold text-sm text-white outline-none [&>option]:text-black"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BLOCK_TYPES_MAP[t]}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-mono uppercase">
                组数:
              </span>
              <input
                type="number"
                min="1"
                value={block.rounds}
                onChange={(e) =>
                  updateBlock(block.id, {
                    rounds: parseInt(e.target.value) || 1,
                  })
                }
                className="w-10 bg-black/30 rounded text-center font-bold text-white border border-white/10 text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="训练块备注 (如: 递减游)"
              value={block.note || ""}
              onChange={(e) => updateBlock(block.id, { note: e.target.value })}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-muted-foreground focus:text-white outline-none border-b border-transparent focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => handleSaveTemplate(block)}
                className="p-1.5 text-white/20 hover:text-green-400 transition-colors"
                title="保存为模板"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => duplicateBlock(block.id)}
                className="p-1.5 text-white/20 hover:text-primary transition-colors"
                title="复制"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteBlock(block.id)}
                className="p-1.5 text-white/20 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`space-y-2 pl-3 border-l-2 ${block.rounds > 1 ? "border-primary/50" : "border-white/5"}`}
          >
            {(block.items || []).map((item) => (
              <div
                key={item.id}
                className="bg-card/40 border border-white/5 rounded-lg p-3 hover:bg-card/60 transition-all relative group/item"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-3 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={item.repeats}
                      onChange={(e) =>
                        updateItem(block.id, item.id, {
                          repeats: parseInt(e.target.value),
                        })
                      }
                      className="w-8 bg-transparent text-sm font-bold text-right outline-none"
                    />
                    <span className="text-muted-foreground text-xs">x</span>
                    <input
                      type="number"
                      value={item.distance}
                      disabled={item.segments && item.segments.length > 0}
                      onChange={(e) =>
                        updateItem(block.id, item.id, {
                          distance: parseInt(e.target.value),
                        })
                      }
                      className={cn(
                        "w-12 bg-transparent text-sm font-bold outline-none",
                        item.segments &&
                          item.segments.length > 0 &&
                          "text-muted-foreground opacity-50",
                      )}
                    />
                    <span className="text-xs text-muted-foreground">m</span>
                    <select
                      className="w-4 bg-transparent outline-none text-muted-foreground hover:text-white cursor-pointer text-xs"
                      onChange={(e) =>
                        updateItem(block.id, item.id, {
                          distance: parseInt(e.target.value),
                        })
                      }
                      value=""
                    >
                      <option value="" disabled>
                        ▾
                      </option>
                      {DISTANCE_PRESETS.map((d) => (
                        <option key={d} value={d} className="text-black">
                          {d}m
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap md:flex-col lg:flex-row gap-2">
                    <select
                      value={item.stroke}
                      onChange={(e) =>
                        updateItem(block.id, item.id, {
                          stroke: e.target.value as PlanItem["stroke"],
                        })
                      }
                      className="bg-secondary/30 rounded px-1.5 py-0.5 text-xs font-medium outline-none text-white border border-white/5 [&>option]:text-black"
                    >
                      {STROKES_KEYS.map((s) => (
                        <option key={s} value={s}>
                          {STROKES_MAP[s]}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-black/20 rounded px-1.5 py-0.5 group/interval hover:bg-black/40 transition-colors">
                      <button
                        onClick={() =>
                          updateItem(block.id, item.id, {
                            intervalMode:
                              item.intervalMode === "Rest"
                                ? "Interval"
                                : "Rest",
                          })
                        }
                        className={cn(
                          "w-3 h-3 flex items-center justify-center transition-colors",
                          item.intervalMode === "Rest"
                            ? "text-yellow-400"
                            : "text-primary",
                        )}
                        title={
                          item.intervalMode === "Rest" ? "休息模式" : "包干模式"
                        }
                      >
                        {item.intervalMode === "Rest" ? (
                          <Hourglass className="w-2.5 h-2.5" />
                        ) : (
                          <Timer className="w-2.5 h-2.5" />
                        )}
                      </button>
                      <input
                        type="text"
                        placeholder={
                          item.intervalMode === "Rest" ? ":15" : "1:30"
                        }
                        value={item.interval || ""}
                        onChange={(e) =>
                          updateItem(block.id, item.id, {
                            interval: e.target.value,
                          })
                        }
                        className={cn(
                          "w-12 bg-transparent text-xs font-mono outline-none",
                          item.intervalMode === "Rest"
                            ? "text-yellow-400 placeholder:text-yellow-400/30"
                            : "text-primary placeholder:text-primary/30",
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-5 relative">
                    {!item.segments || item.segments.length === 0 ? (
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(block.id, item.id, {
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-xs text-white/80 outline-none border-b border-transparent focus:border-white/20"
                      />
                    ) : (
                      <div className="space-y-1.5">
                        {item.segments.map((seg, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <input
                              type="number"
                              value={seg.distance}
                              onChange={(e) =>
                                updateSegment(block.id, item.id, sIdx, {
                                  distance: parseInt(e.target.value),
                                })
                              }
                              className="w-8 bg-black/20 rounded px-1 py-0.5 text-center"
                            />
                            <select
                              value={seg.type}
                              onChange={(e) =>
                                updateSegment(block.id, item.id, sIdx, {
                                  type: e.target.value as PlanSegment["type"],
                                })
                              }
                              className="bg-transparent text-muted-foreground outline-none"
                            >
                              <option value="Swim">配合</option>
                              <option value="Kick">打腿</option>
                              <option value="Drill">分解</option>
                            </select>
                            <input
                              type="text"
                              value={seg.description || ""}
                              onChange={(e) =>
                                updateSegment(block.id, item.id, sIdx, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="备注..."
                              className="flex-1 bg-transparent border-b border-white/10 outline-none"
                            />
                            <button
                              onClick={() =>
                                removeSegment(block.id, item.id, sIdx)
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => deleteItem(block.id, item.id)}
                      className="absolute top-0 right-0 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Equipment & Segments Footer */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    {EQUIPMENT.map((eq) => (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(block.id, item.id, eq)}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold transition-all border",
                          item.equipment.includes(eq)
                            ? "bg-primary/20 text-primary border-primary/50"
                            : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30",
                        )}
                      >
                        {EQUIPMENT_MAP[eq]}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addSegment(block.id, item.id)}
                      className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 拆分距离
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addItemToBlock(block.id)}
              className="w-full mt-2 py-1.5 border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 rounded-lg text-xs text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> 添加训练项
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 flex-1">
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="flex items-center justify-center gap-2 py-2 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-white/5 hover:text-primary text-muted-foreground transition-all text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {BLOCK_TYPES_MAP[type]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="flex flex-col items-center justify-center px-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 text-primary transition-all text-xs"
        >
          <Layers className="w-4 h-4 mb-1" />
          模板库
        </button>
      </div>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <WorkoutLibrary 
            onSelect={(template) => {
              const newBlock: TrainingBlock = {
                id: uid(),
                type: template.category as TrainingBlock["type"] || "Main Set",
                rounds: template.rounds || 1,
                items: template.items.map(item => ({...item, id: uid()})),
                note: template.name
              };
              onChange([...blocks, newBlock]);
              setIsLibraryOpen(false);
            }} 
            onClose={() => setIsLibraryOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}
