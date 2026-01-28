import { TrainingPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Link2, Target } from "lucide-react";
import Link from "next/link";

interface PlanCardProps {
    plan: TrainingPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
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
                            {plan.group}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-white group-hover:text-primary transition-colors">
                            {plan.date} Plan
                        </h3>
                    </div>
                    <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_10px]",
                        plan.status === "Published" ? "bg-primary shadow-primary" : "bg-gray-500"
                    )} />
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
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Tap to edit</span>
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
