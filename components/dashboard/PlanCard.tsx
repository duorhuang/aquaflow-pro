import { TrainingPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Link2, Target, Star } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface PlanCardProps {
    plan: TrainingPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
    const { starPlan } = useStore();

    return (
        <Link href={`/dashboard/plan/${plan.id}`}>
            <div className={cn(
                "group relative p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-all duration-300",
                "hover:shadow-[0_0_30px_rgba(100,255,218,0.1)] hover:border-primary/50"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={cn(
                            "text-xs font-mono px-2 py-1 rounded-full uppercase tracking-wider",
                            plan.group === "Advanced" ? "bg-red-500/10 text-red-400" :
                                plan.group === "Intermediate" ? "bg-yellow-500/10 text-yellow-400" :
                                    "bg-green-500/10 text-green-400"
                        )}>
                            {plan.group === "Advanced" ? "高级组" : plan.group === "Intermediate" ? "中级组" : "初级组"}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-white group-hover:text-primary transition-colors">
                            {plan.date} 训练计划
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); starPlan(plan.id); }}
                            className="text-muted-foreground hover:text-yellow-400 transition-colors"
                        >
                            <Star className={cn("w-5 h-5", plan.isStarred ? "fill-yellow-400 text-yellow-400" : "")} />
                        </button>
                        <div className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_10px]",
                            plan.status === "Published" ? "bg-primary shadow-primary" : "bg-gray-500"
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ActivityIcon className="w-4 h-4" />
                        <span className="text-sm font-mono">{plan.totalDistance}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span className="text-sm truncate">{plan.focus}</span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex gap-2">
                        {plan.blocks?.slice(0, 3).map(b => (
                            <span key={b.id} className="bg-secondary/20 px-1.5 py-0.5 rounded border border-white/5">
                                {b.type === "Warmup" ? "热身" :
                                    b.type === "Pre-Set" ? "预备" :
                                        b.type === "Main Set" ? "主项" :
                                            b.type === "Drill Set" ? "分解" : "放松"}
                            </span>
                        ))}
                        {(plan.blocks?.length || 0) > 3 && <span>+{(plan.blocks?.length || 0) - 3}</span>}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">点击编辑</span>
                    <Link2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
