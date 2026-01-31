"use client";

import { MOCK_SWIMMERS } from "@/lib/data";
import { Swimmer } from "@/types";
import { cn } from "@/lib/utils";
import { User, ChevronRight } from "lucide-react";

interface SwimmerSelectProps {
    onSelect: (swimmer: Swimmer) => void;
}

export function SwimmerSelect({ onSelect }: SwimmerSelectProps) {
    return (
        <div className="space-y-4">
            {MOCK_SWIMMERS.map((swimmer) => (
                <button
                    key={swimmer.id}
                    onClick={() => onSelect(swimmer)}
                    className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/20 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">{swimmer.name}</p>
                            <p className={cn(
                                "text-xs",
                                swimmer.group === "Advanced" ? "text-red-400" :
                                    swimmer.group === "Intermediate" ? "text-yellow-400" :
                                        "text-green-400"
                            )}>{swimmer.group}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
            ))}
        </div>
    );
}
