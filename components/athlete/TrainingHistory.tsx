"use client";

import { useStore } from "@/lib/store";
import { Calendar, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TrainingPlan, TrainingBlock, PlanItem, Feedback } from "@/types";
import { getLocalDateISOString } from "@/lib/date-utils";
import { SessionRenderer } from "@/components/dashboard/SessionRenderer";
import Link from "next/link";

interface TrainingHistoryProps {
    swimmerId: string;
}

// Check if a weekly plan is visible to this swimmer
function isWeeklyPlanVisible(wp: any, swimmer: any): boolean {
    if (!swimmer) return false;
    const targetGroup: string[] = Array.isArray(wp.targetGroup)
        ? wp.targetGroup
        : typeof wp.targetGroup === 'string' ? (() => { try { return JSON.parse(wp.targetGroup || '[]'); } catch { return []; } })() : [];
    const targetSwimmerIds: string[] = Array.isArray(wp.targetSwimmerIds)
        ? wp.targetSwimmerIds
        : typeof wp.targetSwimmerIds === 'string' ? (() => { try { return JSON.parse(wp.targetSwimmerIds || '[]'); } catch { return []; } })() : [];
    const hasGroupTarget = targetGroup.length > 0;
    const hasIndividualTarget = targetSwimmerIds.length > 0;
    if (!hasGroupTarget && !hasIndividualTarget) return true;
    if (hasGroupTarget && targetGroup.includes(swimmer.group)) return true;
    if (hasIndividualTarget && targetSwimmerIds.includes(swimmer.id)) return true;
    return false;
}

interface HistoryEntry {
    date: string;
    planId: string;
    type: 'standalone' | 'weekly';
    plan: TrainingPlan & Record<string, any>;
    attended: boolean;
    feedback?: Feedback | undefined;
    weeklyPlanTitle?: string;
}

export function TrainingHistory({ swimmerId }: TrainingHistoryProps) {
    const { plans, attendance, feedbacks, swimmers, weeklyPlans } = useStore();
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

    const swimmer = swimmers.find(s => s.id === swimmerId);
    if (!swimmer) return null;

    // Get past 7 days of training (recent week only — older sessions accessible via archive)
    const now = new Date();
    const todayStr = getLocalDateISOString(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Standalone daily plans
    const standaloneHistory: HistoryEntry[] = plans
        .filter(p => {
            const planDate = new Date(p.date);
            return p.date < todayStr &&
                planDate >= sevenDaysAgo &&
                p.group === swimmer.group;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(plan => {
            const attended = attendance.some(a =>
                a.swimmerId === swimmerId && a.date === plan.date
            );
            const feedback = feedbacks.find(f =>
                f.swimmerId === swimmerId && f.planId === plan.id
            );
            return { date: plan.date, planId: plan.id, type: 'standalone' as const, plan: plan as TrainingPlan & Record<string, any>, attended, feedback };
        });

    // 2. Weekly plan sessions (derive from published weekly plans)
    const weeklyHistory: HistoryEntry[] = [];
    for (const wp of weeklyPlans) {
        if (!isWeeklyPlanVisible(wp, swimmer)) continue;
        const sessions = wp.sessions?.filter((s: any) => s.date < todayStr) || [];
        for (const session of sessions) {
            const sessionDate = new Date(session.date);
            if (sessionDate < sevenDaysAgo) continue;
            const attended = attendance.some(a => a.swimmerId === swimmerId && a.date === session.date);
            weeklyHistory.push({
                date: session.date,
                planId: `weekly-${session.id}`,
                type: 'weekly' as const,
                plan: {
                    id: `weekly-${session.id}`,
                    date: session.date,
                    group: swimmer.group,
                    totalDistance: 0,
                    focus: session.label,
                    imageUrl: session.imageUrl || session.imageData,
                    blocks: [],
                    targetedNotes: {},
                    status: "Published",
                    editorMode: session.editorMode,
                    contentBlocks: session.contentBlocks,
                    contentHtml: session.contentHtml,
                    imageData: session.imageData,
                    imageType: session.imageType,
                    notes: session.notes,
                },
                attended,
                weeklyPlanTitle: wp.title || `${wp.weekStart}周`,
            });
        }
    }

    // Merge and sort by date
    const history = [...standaloneHistory, ...weeklyHistory]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    训练历史
                </h3>
                <Link href="/archive" className="text-xs text-primary hover:underline flex items-center gap-1">
                    归档记录 <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {history.map(({ plan, attended, feedback, type, weeklyPlanTitle }) => {
                    const isExpanded = expandedPlanId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                "bg-card/50 border rounded-xl overflow-hidden transition-all",
                                attended
                                    ? "border-green-500/30 bg-green-500/5"
                                    : "border-white/10 opacity-80"
                            )}
                        >
                            {/* Card Header - Clickable */}
                            <div
                                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {attended ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-muted-foreground" />
                                        )}
                                        <span className="font-bold text-white">
                                            {new Date(plan.date).toLocaleDateString('zh-CN', {
                                                month: 'short',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </span>
                                        {type === 'weekly' && weeklyPlanTitle && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                                                周计划: {weeklyPlanTitle}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-1 rounded-full",
                                            attended
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-white/10 text-muted-foreground"
                                        )}>
                                            {attended ? "已完成" : "未完成"}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">训练距离</span>
                                        <span className="text-sm font-mono text-white">
                                            {plan.totalDistance.toLocaleString()}m
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">训练重点</span>
                                        <span className="text-sm text-white">{plan.focus}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="p-4 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2">
                                    {/* Plan Content */}
                                    <div className="space-y-4 mb-4">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Layers className="w-3 h-3" />
                                            训练内容
                                        </h4>

                                        {plan.blocks?.map((block: TrainingBlock, i: number) => (
                                            <div key={block.id || i} className="space-y-2">
                                                <div className="text-xs font-bold text-primary flex justify-between">
                                                    <span>{block.type} {block.rounds > 1 && `(${block.rounds} rounds)`}</span>
                                                </div>
                                                <div className="space-y-1 pl-2 border-l-2 border-primary/20">
                                                    {block.items.map((item: PlanItem, j: number) => (
                                                        <div key={item.id || j} className="text-sm text-white flex justify-between">
                                                            <span>
                                                                <span className="font-mono text-primary">{item.repeats}x{item.distance}m</span>
                                                                <span className="ml-2 text-muted-foreground">{item.stroke}</span>
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{item.interval}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Session media content (images, videos, notes from coach) */}
                                        {(plan.contentBlocks?.length || plan.contentHtml || plan.imageData || plan.notes) && (
                                            <SessionRenderer session={plan} />
                                        )}
                                    </div>

                                    {/* Feedback & Notes Section */}
                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                        {plan.targetedNotes?.[swimmerId] && (
                                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                                <p className="text-xs font-medium text-primary mb-1">教练备注</p>
                                                <p className="text-xs text-white">{plan.targetedNotes[swimmerId]}</p>
                                            </div>
                                        )}

                                        {feedback && (
                                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3 text-primary" />
                                                        <span className="text-xs font-medium text-primary">我的反馈</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-muted-foreground">RPE:</span>
                                                        <span className={cn(
                                                            "font-bold",
                                                            feedback.rpe >= 8 ? "text-red-400" :
                                                                feedback.rpe >= 6 ? "text-yellow-400" :
                                                                    "text-green-400"
                                                        )}>
                                                            {feedback.rpe}/10
                                                        </span>
                                                    </div>
                                                </div>
                                                {feedback.comments && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {feedback.comments}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {history.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">没有更早的归档记录</p>
                    </div>
                )}
            </div>
        </div>
    );
}
