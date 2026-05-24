import { WeeklyPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Link2, Target, Calendar } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface WeeklyPlanCardProps {
    plan: WeeklyPlan;
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
    const { } = useStore();
    
    const targetGroupsStr = plan.targetGroup && plan.targetGroup.length > 0 
        ? plan.targetGroup.map(g => g === "Advanced" ? "高级组" : g === "Intermediate" ? "中级组" : g === "External" ? "校外组" : "初级组").join(", ")
        : (plan.group === "Advanced" ? "高级组" : plan.group === "Intermediate" ? "中级组" : plan.group === "External" ? "校外组" : "初级组");

    // Calculate total sessions
    const totalSessions = plan.sessions?.length || 0;
    
    // Check if it has any structured blocks
    const hasStructured = plan.sessions?.some(s => s.editorMode === "plan" && (s.trainingBlocks?.length || 0) > 0);

    return (
        <Link href={`/dashboard/weekly-plan?id=${plan.id}`}>
            <div className={cn(
                "group relative p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-all duration-300",
                "hover:shadow-[0_0_30px_rgba(100,255,218,0.1)] hover:border-primary/50"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={cn(
                            "text-xs font-mono px-2 py-1 rounded-full uppercase tracking-wider",
                            plan.targetGroup?.includes("Advanced") || plan.group === "Advanced" ? "bg-red-500/10 text-red-400" :
                            plan.targetGroup?.includes("Intermediate") || plan.group === "Intermediate" ? "bg-yellow-500/10 text-yellow-400" :
                            plan.targetGroup?.includes("External") || plan.group === "External" ? "bg-teal-500/10 text-teal-400" :
                                "bg-green-500/10 text-green-400"
                        )}>
                            {targetGroupsStr}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-white group-hover:text-primary transition-colors">
                            {plan.title || `${plan.weekStart} 周训练`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_10px]",
                            plan.isPublished ? "bg-primary shadow-primary" : "bg-gray-500"
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-mono">{plan.weekStart} ~ {plan.weekEnd}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span className="text-sm truncate">{totalSessions} 节训练课</span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex gap-2 items-center mt-2">
                        {hasStructured && (
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">结构化课表</span>
                        )}
                        {!plan.isPublished && (
                            <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-full text-[10px]">草稿</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center">
                                    <div className="w-3 h-3 text-muted-foreground opacity-50" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            发送给 {plan.targetSwimmerIds?.length || 0} 名队员
                        </span>
                    </div>
                    
                    <button className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                        查看详情 <Link2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
