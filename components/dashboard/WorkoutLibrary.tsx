"use client";

import { useState } from "react";
import { BlockTemplate, TrainingBlock } from "@/types";
import { useStore } from "@/lib/store";
import { BookOpen, Plus, Trash2, Search, Filter, Calculator, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaceCalculator } from "./PaceCalculator";

interface WorkoutLibraryProps {
    onSelect: (template: BlockTemplate) => void;
    onClose?: () => void;
}

const CATEGORIES = ["All", "Warmup", "Main Set", "Sprint", "Drill", "Cool Down"];
const CATEGORY_MAP: Record<string, string> = {
    "All": "全部",
    "Warmup": "热身",
    "Main Set": "主项",
    "Sprint": "冲刺",
    "Drill": "分解",
    "Cool Down": "放松"
};

export function WorkoutLibrary({ onSelect, onClose }: WorkoutLibraryProps) {
    const { templates, deleteTemplate } = useStore();
    const [mainTab, setMainTab] = useState<"Templates" | "Tools">("Templates");
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = activeTab === "All" || t.category === activeTab;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Calculate distance for a block
    const getBlockDistance = (block: TrainingBlock) => {
        const dist = block.items.reduce((sum, item) => sum + (item.distance * item.repeats), 0);
        return dist * block.rounds;
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-card border-l border-white/10 h-full flex flex-col w-[85vw] md:w-80 fixed right-0 top-0 bottom-0 pt-20 z-50 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Top Tabs */}
                <div className="grid grid-cols-2 border-b border-white/10 bg-black/20">
                    <button
                        onClick={() => setMainTab("Templates")}
                        className={cn(
                            "py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all",
                            mainTab === "Templates"
                                ? "bg-primary/10 text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Library className="w-4 h-4" />
                        训练库
                    </button>
                    <button
                        onClick={() => setMainTab("Tools")}
                        className={cn(
                            "py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all",
                            mainTab === "Tools"
                                ? "bg-primary/10 text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Calculator className="w-4 h-4" />
                        工具
                    </button>
                </div>

                {mainTab === "Templates" ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-black/10">
                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="搜索模板..."
                                    className="w-full bg-secondary/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white border border-transparent focus:border-primary outline-none"
                                />
                            </div>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        className={cn(
                                            "text-[10px] px-2 py-1 rounded-full transition-all border",
                                            activeTab === cat
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white/5 text-muted-foreground border-transparent hover:bg-white/10"
                                        )}
                                    >
                                        {CATEGORY_MAP[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredTemplates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    没有找到模板
                                </div>
                            ) : (
                                filteredTemplates.map(template => (
                                    <div
                                        key={template.templateId}
                                        className="bg-secondary/30 border border-white/5 rounded-xl p-3 hover:border-primary/50 transition-all group relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-white truncate max-w-[140px]" title={template.name}>
                                                    {template.name}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded uppercase">
                                                    {template.category}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono font-bold text-primary">
                                                    {getBlockDistance(template)}m
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {template.items.length} items
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div className="space-y-1 mb-3">
                                            {template.items.slice(0, 2).map((item, i) => (
                                                <div key={i} className="text-[10px] text-muted-foreground truncate">
                                                    {item.repeats}x{item.distance}m {item.stroke}
                                                </div>
                                            ))}
                                            {template.items.length > 2 && (
                                                <div className="text-[10px] text-muted-foreground opacity-50">...</div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onSelect(template)}
                                                className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all font-medium"
                                            >
                                                <Plus className="w-3 h-3" /> 使用
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("确定要删除这个模板吗？")) {
                                                        deleteTemplate(template.templateId);
                                                    }
                                                }}
                                                className="px-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <PaceCalculator />
                    </div>
                )}

                <div className="p-3 bg-black/20 border-t border-white/10 text-[10px] text-center text-muted-foreground">
                    {mainTab === 'Templates'
                        ? "提示: 在编辑器中点击保存图标可创建新模板"
                        : "提示: 配速计算器仅供参考"
                    }
                </div>
            </div>
        </>
    );
}
