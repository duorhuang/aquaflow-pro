"use client";

import { useEffect, useState } from "react";
import { PlanEditor } from "@/components/dashboard/PlanEditor";
import { useStore } from "@/lib/store";
import { TrainingPlan } from "@/types";
import { use } from "react";

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { plans, isLoaded } = useStore();
    const [plan, setPlan] = useState<TrainingPlan | null>(null);

    useEffect(() => {
        if (!isLoaded) return;
        const foundPlan = plans.find(p => p.id === resolvedParams.id);
        setPlan(foundPlan || null);
    }, [plans, resolvedParams.id, isLoaded]);

    if (!isLoaded || (plans.length > 0 && !plan)) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-muted-foreground">加载中...</div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-xl text-muted-foreground">未找到该训练计划</div>
                <a href="/dashboard" className="text-primary hover:underline">
                    返回仪表板
                </a>
            </div>
        );
    }

    return <PlanEditor initialPlan={plan} />;
}
