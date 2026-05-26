"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { CheckCircle, Users, FolderOpen, UserCheck } from "lucide-react";
import Link from "next/link";

export function OnboardingChecklist() {
    const { swimmers, plans, attendance } = useStore();
    const [dismissed, setDismissed] = useState(false);

    const hasSwimmers = swimmers.length > 0;
    const hasPlans = plans.length > 0;
    const hasAttendance = attendance.length > 0;

    if (dismissed) return null;
    if (hasSwimmers && hasPlans && hasAttendance) return null;

    const steps = [
        {
            done: hasSwimmers,
            title: "添加队员",
            desc: "先建立队员名单，才能发布计划和记录出勤",
            href: "/dashboard/athletes",
            icon: Users,
        },
        {
            done: hasPlans,
            title: "创建周训练计划",
            desc: "上传训练大纲或每日训练内容",
            href: "/dashboard/weekly-plan",
            icon: FolderOpen,
            requires: hasSwimmers,
        },
        {
            done: hasAttendance,
            title: "记录今日出勤",
            desc: "训练开始前为到场的队员打卡",
            href: "/dashboard/attendance",
            icon: UserCheck,
            requires: hasSwimmers,
        },
    ];

    const allDone = hasSwimmers && hasPlans && hasAttendance;

    return (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">
                    {allDone ? "🎉 初始设置完成！" : "欢迎使用 AquaFlow Pro — 快速入门"}
                </h3>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-xs text-muted-foreground hover:text-white"
                >
                    收起
                </button>
            </div>

            <div className="space-y-3">
                {steps.map((step, i) => {
                    const isLocked = step.requires && !hasSwimmers;
                    const Icon = step.icon;
                    return (
                        <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                step.done
                                    ? "bg-green-500/10 border border-green-500/20"
                                    : isLocked
                                    ? "bg-white/5 opacity-40"
                                    : "bg-white/5 border border-white/10 hover:border-primary/30"
                            }`}
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                step.done
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-white/10 text-muted-foreground"
                            }`}>
                                {step.done ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-bold">{i + 1}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${step.done ? "text-green-400" : "text-white"}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{step.desc}</p>
                            </div>
                            {!step.done && !isLocked && (
                                <Link
                                    href={step.href}
                                    className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:brightness-110"
                                >
                                    开始
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
