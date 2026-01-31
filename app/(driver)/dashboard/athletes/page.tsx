"use client";

import { MOCK_SWIMMERS } from "@/lib/data";
import { User } from "lucide-react";

export default function AthletesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Team Roster</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_SWIMMERS.map((s) => (
                    <div key={s.id} className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-colors">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-white">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.group} Group</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
