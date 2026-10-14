"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { SwimEvent, PerformanceRecord } from "@/types";
import { Plus, X, Trophy, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PerformanceChart } from "./PerformanceChart";

const SWIM_EVENTS: SwimEvent[] = [
    "50Free", "100Free", "200Free", "400Free", "800Free", "1500Free",
    "50Back", "100Back", "200Back",
    "50Breast", "100Breast", "200Breast",
    "50Fly", "100Fly", "200Fly",
    "200IM", "400IM"
];

const EVENT_LABELS: Record<SwimEvent, string> = {
    "50Free": "50m 自由泳",
    "100Free": "100m 自由泳",
    "200Free": "200m 自由泳",
    "400Free": "400m 自由泳",
    "800Free": "800m 自由泳",
    "1500Free": "1500m 自由泳",
    "50Back": "50m 仰泳",
    "100Back": "100m 仰泳",
    "200Back": "200m 仰泳",
    "50Breast": "50m 蛙泳",
    "100Breast": "100m 蛙泳",
    "200Breast": "200m 蛙泳",
    "50Fly": "50m 蝶泳",
    "100Fly": "100m 蝶泳",
    "200Fly": "200m 蝶泳",
    "200IM": "200m 混合泳",
    "400IM": "400m 混合泳"
};

interface PerformanceFormProps {
    swimmerId: string;
    onClose: () => void;
    initialData?: PerformanceRecord;
}

export function PerformanceForm({ swimmerId, onClose, initialData }: PerformanceFormProps) {
    const { addPerformance, updatePerformance } = useStore();
    const [event, setEvent] = useState<SwimEvent>(initialData?.event || "50Free");
    const [time, setTime] = useState(initialData?.time || "");
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [meetName, setMeetName] = useState(initialData?.meetName || "");
    const [notes, setNotes] = useState(initialData?.notes || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!time.trim()) return;

        const performanceData = {
            swimmerId,
            event,
            time: time.trim(),
            date,
            meetName: meetName.trim() || undefined,
            notes: notes.trim() || undefined
        };

        if (initialData) {
            updatePerformance(initialData.id, performanceData);
        } else {
            const newPerformance: PerformanceRecord = {
                id: crypto.randomUUID().slice(0, 9),
                isPB: false,
                ...performanceData
            };
            addPerformance(newPerformance);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl p-5 max-w-md w-full shadow-lg">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        {initialData ? "修改成绩" : "添加成绩"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">项目</label>
                        <select
                            value={event}
                            onChange={(e) => setEvent(e.target.value as SwimEvent)}
                            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {SWIM_EVENTS.map(evt => (
                                <option key={evt} value={evt}>{EVENT_LABELS[evt]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">成绩时间 (秒)</label>
                        <input
                            type="text"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            placeholder="例如: 28.50"
                            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">请输入总秒数，例如 1:02.5 = 62.5</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">日期</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">比赛名称 (可选)</label>
                        <input
                            type="text"
                            value={meetName}
                            onChange={(e) => setMeetName(e.target.value)}
                            placeholder="例如: 市级锦标赛"
                            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">备注 (可选)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="当时感觉如何？..."
                            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                        />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            {initialData ? "保存修改" : "添加成绩"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddPerformanceForm({ swimmerId, onClose }: { swimmerId: string; onClose: () => void }) {
    return <PerformanceForm swimmerId={swimmerId} onClose={onClose} />;
}

interface PerformanceListProps {
    swimmerId: string;
}

export function PerformanceList({ swimmerId }: PerformanceListProps) {
    const { getSwimmerPerformances, getSwimmerPBs, deletePerformance } = useStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPerformance, setEditingPerformance] = useState<PerformanceRecord | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<SwimEvent | "all">("all");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("确定要删除这条成绩记录吗？")) return;
        setIsDeleting(id);
        await deletePerformance(id);
        setIsDeleting(null);
    };

    const performances = getSwimmerPerformances(swimmerId);
    const pbs = getSwimmerPBs(swimmerId);

    const filteredPerformances = selectedEvent === "all"
        ? performances
        : performances.filter(p => p.event === selectedEvent);

    const formatTime = (timeStr: string) => {
        const time = parseFloat(timeStr);
        if (time >= 60) {
            const minutes = Math.floor(time / 60);
            const seconds = (time % 60).toFixed(2);
            return `${minutes}:${seconds.padStart(5, '0')}`;
        }
        return `${time.toFixed(2)}s`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    我的成绩
                </h3>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                    <Plus className="w-3.5 h-3.5" />
                    添加成绩
                </button>
            </div>

            {/* Event Filter */}
            <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value as SwimEvent | "all")}
                className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            >
                <option value="all">所有项目</option>
                {SWIM_EVENTS.map(evt => (
                    <option key={evt} value={evt}>
                        {EVENT_LABELS[evt]}
                    </option>
                ))}
            </select>

            {/* Performance Trend Chart */}
            {selectedEvent !== "all" && performances.filter(p => p.event === selectedEvent).length > 0 && (
                <PerformanceChart
                    performances={performances}
                    event={selectedEvent}
                />
            )}

            {/* Personal Bests Summary */}
            {Object.keys(pbs).length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> 个人最佳</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(pbs).slice(0, 4).map(([event, perf]) => (
                            <div key={event} className="text-xs">
                                <span className="text-muted-foreground">{EVENT_LABELS[event as SwimEvent]}</span>
                                <span className="ml-2 text-foreground font-mono font-medium">{formatTime(perf.time)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance List */}
            <div className="space-y-2">
                {filteredPerformances.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">还没有成绩记录</p>
                        <p className="text-xs mt-1">点击&ldquo;添加成绩&rdquo;开始记录</p>
                    </div>
                ) : (
                    filteredPerformances.map((perf) => (
                        <div
                            key={perf.id}
                            className={cn(
                                "bg-card border rounded-xl p-4 transition-colors",
                                perf.isPB
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm text-foreground">
                                            {EVENT_LABELS[perf.event]}
                                        </h4>
                                        {perf.isPB && (
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-medium">
                                                PB 🎉
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs text-muted-foreground">{perf.date}</p>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => setEditingPerformance(perf)}
                                                className="p-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                                                title="修改"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(perf.id)}
                                                disabled={isDeleting === perf.id}
                                                className="p-1.5 rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20 disabled:opacity-30"
                                                title="删除"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {perf.meetName && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            📍 {perf.meetName}
                                        </p>
                                    )}
                                    {perf.notes && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">
                                            &ldquo;{perf.notes}&rdquo;
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-mono font-semibold text-foreground">
                                        {formatTime(perf.time)}
                                    </p>
                                    {perf.improvement !== undefined && (
                                        <p className={cn(
                                            "text-xs font-mono mt-1",
                                            perf.improvement < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                        )}>
                                            {perf.improvement < 0 ? "↓" : "↑"} {Math.abs(perf.improvement).toFixed(2)}s
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <AddPerformanceForm
                    swimmerId={swimmerId}
                    onClose={() => setShowAddForm(false)}
                />
            )}

            {/* Edit Form Modal */}
            {editingPerformance && (
                <PerformanceForm
                    swimmerId={swimmerId}
                    initialData={editingPerformance}
                    onClose={() => setEditingPerformance(null)}
                />
            )}
        </div>
    );
}
