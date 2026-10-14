import { WeeklyPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Calendar, Target, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface WeeklyPlanCardProps {
    plan: WeeklyPlan;
}

const GROUP_STYLES: Record<string, string> = {
    Advanced: "bg-red-50 text-red-600 border-red-100",
    Intermediate: "bg-amber-50 text-amber-600 border-amber-100",
    External: "bg-teal-50 text-teal-600 border-teal-100",
    Junior: "bg-green-50 text-green-600 border-green-100",
};

const GROUP_LABELS: Record<string, string> = {
    Advanced: "高级组",
    Intermediate: "中级组",
    External: "校外组",
    Junior: "初级组",
};

export const WeeklyPlanCard = memo(function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
    const groups = plan.targetGroup && plan.targetGroup.length > 0
        ? plan.targetGroup
        : [plan.group || "Junior"];

    const primaryGroup = groups[0];
    const groupStyle = GROUP_STYLES[primaryGroup] || GROUP_STYLES.Junior;
    const groupLabel = groups.map(g => GROUP_LABELS[g] || g).join(", ");
    const totalSessions = plan.sessions?.length || 0;
    const hasStructured = plan.sessions?.some(s => s.editorMode === "plan" && (s.trainingBlocks?.length || 0) > 0);

    return (
        <Link href={`/dashboard/weekly-plan?id=${plan.id}`}>
            <div className="group p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={cn("inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border", groupStyle)}>
                                {groupLabel}
                            </span>
                            {hasStructured && (
                                <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    结构化课表
                                </span>
                            )}
                            {!plan.isPublished && (
                                <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                                    草稿
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                            {plan.title || `${plan.weekStart} 周训练`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            plan.isPublished ? "bg-success" : "bg-muted-foreground/40"
                        )} />
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{plan.weekStart} ~ {plan.weekEnd}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>{totalSessions} 节课</span>
                    </div>
                    {(plan.targetSwimmerIds?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span>→ {plan.targetSwimmerIds!.length} 名指定队员</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});